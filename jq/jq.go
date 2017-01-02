package jq

import (
	"bytes"
	"fmt"
	"io"
	"os/exec"
	"strings"

	"golang.org/x/net/context"
)

type JQ struct {
	J string  `json:"j"`
	Q string  `json:"q"`
	O []JQOpt `json:"o"`
}

type JQOpt struct {
	Name    string `json:"name"`
	Enabled bool   `json:"enabled"`
}

func (j *JQ) Opts() []string {
	opts := []string{}
	for _, opt := range j.O {
		if opt.Enabled {
			opts = append(opts, fmt.Sprintf("--%s", opt.Name))
		}
	}

	return opts
}

func (j *JQ) Eval(ctx context.Context, w io.Writer) error {
	if err := j.Validate(); err != nil {
		return err
	}

	opts := j.Opts()
	opts = append(opts, j.Q)
	cmd := exec.Command(Path, opts...)
	cmd.Stdin = bytes.NewBufferString(j.J)
	cmd.Env = make([]string, 0)
	cmd.Stdout = w
	cmd.Stderr = w
	err := cmd.Start()
	if err != nil {
		return err
	}

	c := make(chan error, 1)
	go func() { c <- cmd.Wait() }()
	select {
	case err := <-c:
		return err
	case <-ctx.Done():
		cmd.Process.Kill()
		<-c // Wait for it to return.
		return fmt.Errorf("jq execution timeout")
	}
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
