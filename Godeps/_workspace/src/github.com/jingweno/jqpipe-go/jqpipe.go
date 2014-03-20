/*
	Wraps the "jq" utility as a pipe.

	This package makes it easy for Go programs to filter JSON data using
	stedolan's "jq". This is used internally at ThreatGRID as a sort of
	expedient map/reduce in its distributed data store and in its "expectjq"
	test utility.
*/
package jq

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"os/exec"
)

// Eval starts a new Jq process to evaluate an expression with json input
func Eval(js string, expr string, opts ...string) ([]json.RawMessage, error) {
	jq, err := New(bytes.NewReader([]byte(js)), expr, opts...)
	if err != nil {
		return nil, err
	}

	ret := make([]json.RawMessage, 0, 16)
	for {
		next, err := jq.Next()
		switch err {
		case nil:
			ret = append(ret, next)
		case io.EOF:
			return ret, nil
		default:
			return ret, err
		}
	}
	panic("unreachable") // for go 1.0
}

// New wraps a jq.Pipe around an existing io.Reader, applying a JQ expression
func New(r io.Reader, expr string, opts ...string) (*Pipe, error) {
	var err error

	proc := new(Pipe)
	opts = append(opts, expr)
	proc.jq = exec.Command("jq", opts...)
	proc.jq.Stdin = r

	proc.stdout, err = proc.jq.StdoutPipe()
	if err != nil {
		return nil, err
	}

	proc.jq.Stderr = &proc.stderr
	err = proc.jq.Start()
	if err != nil {
		proc.stdout.Close()
		return nil, err
	}

	proc.dec = json.NewDecoder(proc.stdout)
	return proc, nil
}

// Pipe encapsulates a child "jq" process with a fixed expression, returning each JSON output from jq.
type Pipe struct {
	jq     *exec.Cmd
	dec    *json.Decoder
	stdout io.ReadCloser
	stderr bytes.Buffer
}

// Next provides the next JSON result from JQ.  If there are no more results, io.EOF is returned.
func (p *Pipe) Next() (json.RawMessage, error) {
	var msg json.RawMessage
	err := p.dec.Decode(&msg)

	//TODO: guard against a Next() after we have terminated.
	if err == nil {
		return msg, nil
	}
	p.stdout.Close()

	// if we have a decoding error, jq is sick and we need to kill it with fire..
	if err != io.EOF {
		p.Close()
		return nil, err
	}

	// terminate jq (if it hasn't died already)
	p.jq.Process.Kill()
	p.jq.Wait()

	// if jq complained, that's our error
	if p.stderr.Len() != 0 {
		return nil, errors.New(p.stderr.String())
	}

	if p.jq.ProcessState.Success() {
		return nil, io.EOF
	}

	return nil, errors.New("unexplained jq failure")
}

// Close attempts to halt the jq process if it has not already exited.  This is only necessary if Next has not returned io.EOF.
func (p *Pipe) Close() error {
	if p.stdout != nil {
		p.stdout.Close()
		return nil
	}
	if p.jq != nil {
		return nil
	}
	if p.jq.ProcessState != nil && p.jq.ProcessState.Exited() {
		return nil
	}
	if p.jq.Process != nil {
		p.jq.Process.Kill()
		go p.jq.Process.Wait()
	}
	return nil
}
