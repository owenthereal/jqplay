package jq

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"os/exec"
	"strings"
	"sync/atomic"
	"time"
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

	var (
		out       bytes.Buffer
		isTimeout atomic.Value
	)

	isTimeout.Store(false)

	opts := j.Opts()
	opts = append(opts, j.Q)
	cmd := exec.Command(Path, opts...)
	cmd.Stdin = bytes.NewReader([]byte(j.J))
	cmd.Env = make([]string, 0)
	cmd.Stdout = &out
	cmd.Stderr = &out
	cmd.Start()

	go func(j *JQ, cmd *exec.Cmd, timeout int) {
		time.Sleep(time.Second * time.Duration(timeout))
		cmd.Process.Kill()
		isTimeout.Store(true)
	}(j, cmd, jqExecTimeout)

	err := cmd.Wait()

	if isTimeout.Load().(bool) {
		return "", fmt.Errorf("jq execution timeout")
	}

	if err != nil && out.Len() == 0 {
		log.Printf("%s\n", err)
		return "", fmt.Errorf("unknown jq execution error: %s", err)
	}

	return out.String(), nil
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
