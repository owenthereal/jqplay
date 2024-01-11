package jq

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"strings"
)

type ValidationError struct {
	s string
}

func (e *ValidationError) Error() string {
	return e.s
}

var (
	ErrExecTimeout   = errors.New("jq execution was timeout")
	ErrExecCancelled = errors.New("jq execution was cancelled")
	ErrExecAborted   = errors.New("jq execution was aborted")
	allowedOpts      = map[string]struct{}{
		"slurp":          {},
		"null-input":     {},
		"compact-output": {},
		"raw-input":      {},
		"raw-output":     {},
		"sort-keys":      {},
	}
)

type JQ struct {
	J string  `json:"j"`
	Q string  `json:"q"`
	O []JQOpt `json:"o"`
}

func (j *JQ) optIsEnabled(name string) bool {
	for _, o := range j.O {
		if o.Name == name {
			return o.Enabled
		}
	}
	return false
}

type JQOpt struct {
	Name    string `json:"name"`
	Enabled bool   `json:"enabled"`
}

func (o *JQOpt) String() string {
	return fmt.Sprintf("%s (%t)", o.Name, o.Enabled)
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

func (j *JQ) Validate() error {
	errMsgs := []string{}

	if j.Q == "" {
		errMsgs = append(errMsgs, "missing filter")
	}

	if j.J == "" && !j.optIsEnabled("null-input") {
		errMsgs = append(errMsgs, "missing JSON")
	}

	for _, opt := range j.O {
		if _, allowed := allowedOpts[opt.Name]; !allowed {
			errMsgs = append(errMsgs, fmt.Sprintf("disallow option %q", opt.Name))
		}
	}

	if len(errMsgs) > 0 {
		return &ValidationError{fmt.Sprintf("invalid input: %s", strings.Join(errMsgs, ", "))}
	}

	return nil
}

func (j JQ) String() string {
	return fmt.Sprintf("j=%s, q=%s, o=%v", j.J, j.Q, j.Opts())
}

type ResourceLimiter interface {
	LimitResources(proc *os.Process)
}

type NoResourceLimiter struct {
}

func (r *NoResourceLimiter) LimitResources(proc *os.Process) {
}

type JQExec struct {
	ResourceLimiter ResourceLimiter
}

func (e *JQExec) Eval(ctx context.Context, jq JQ, w io.Writer) error {
	if err := jq.Validate(); err != nil {
		return err
	}

	cmd := exec.CommandContext(ctx, Path, append(jq.Opts(), jq.Q)...)
	cmd.Stdin = bytes.NewBufferString(jq.J)
	cmd.Env = make([]string, 0)
	cmd.Stdout = w
	cmd.Stderr = w

	if err := cmd.Start(); err != nil {
		return err
	}

	e.ResourceLimiter.LimitResources(cmd.Process)

	err := cmd.Wait()
	if err != nil {
		ctxErr := ctx.Err()
		if ctxErr == context.DeadlineExceeded {
			return ErrExecTimeout
		}
		if ctxErr == context.Canceled {
			return ErrExecCancelled
		}

		if strings.Contains(err.Error(), "signal: segmentation fault") ||
			strings.Contains(err.Error(), "signal: aborted") {
			return ErrExecAborted
		}
	}

	return err
}
