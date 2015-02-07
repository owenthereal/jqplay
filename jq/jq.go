package jq

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"strings"
	"time"

	"github.com/jingweno/jqpipe-go"
	"golang.org/x/net/context"
)

const jqExecTimeout = 3

type jqResult struct {
	Seq []json.RawMessage
	Err error
}

func (r *jqResult) Result() (string, error) {
	if r.Err != nil {
		return "", r.Err
	}

	result := []string{}
	for _, s := range r.Seq {
		ss := string(s)
		if ss != "" && ss != "null" {
			result = append(result, ss)
		}
	}

	return strings.Join(result, "\n"), nil
}

type JQ struct {
	J string          `json:"j"`
	Q string          `json:"q"`
	O map[string]bool `json:"o"`
}

func (j *JQ) Opts() []string {
	opts := []string{}
	for opt, enabled := range j.O {
		if enabled {
			opts = append(opts, fmt.Sprintf("--%s", opt))
		}
	}

	return opts
}

func (j *JQ) Eval() (string, error) {
	if err := j.Validate(); err != nil {
		return "", err
	}

	jj, err := jq.New(bytes.NewReader([]byte(j.J)), j.Q, j.Opts()...)
	if err != nil {
		return "", err
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*jqExecTimeout)
	defer cancel()

	r, err := eval(jj, ctx)
	if err != nil {
		return "", err
	}

	return r.Result()
}

func (j *JQ) Validate() error {
	errMsgs := []string{}

	if j.Q == "" {
		errMsgs = append(errMsgs, "missing filter")
	}

	if j.J == "" {
		errMsgs = append(errMsgs, "missing JSON")
	}

	if len(errMsgs) > 0 {
		return fmt.Errorf("invalid input: %s", strings.Join(errMsgs, " and "))
	}

	return nil
}

func (j JQ) String() string {
	return fmt.Sprintf("j=%s, q=%s, o=%v", j.J, j.Q, j.Opts())
}

// eval evaluates `jq` expression with timeout support
func eval(j *jq.Pipe, ctx context.Context) (*jqResult, error) {
	c := make(chan *jqResult, 1)

	go func(j *jq.Pipe) {
		r := &jqResult{
			Seq: make([]json.RawMessage, 0, 16),
		}

	loop:
		for {
			next, err := j.Next()
			switch err {
			case nil:
				r.Seq = append(r.Seq, next)
			case io.EOF:
				break loop
			default:
				r.Err = err
				break loop
			}
		}

		c <- r
	}(j)

	select {
	case result := <-c:
		return result, nil
	case <-ctx.Done():
		err := j.Close()
		if err != nil {
			return nil, fmt.Errorf("jq execution timeout: %s", err)
		}

		<-c // wait for canceled execution

		return nil, fmt.Errorf("jq execution timeout")
	}
}
