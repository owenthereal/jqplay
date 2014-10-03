package jq

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"strings"
	"time"

	"github.com/jingweno/jqpipe-go"
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

// eval `jq` expression with timeout support
func (j *JQ) Eval() (string, error) {
	if err := j.Validate(); err != nil {
		return "", err
	}

	jj, err := jq.New(bytes.NewReader([]byte(j.J)), j.Q, j.Opts()...)
	if err != nil {
		return "", err
	}

	isFailed := new(AtomicBool)
	rc := make(chan *jqResult, 1)
	defer close(rc)
	go run(jj, rc, isFailed)

	select {
	case r := <-rc:
		return r.Result()
	case <-time.After(time.Second * jqExecTimeout):
		log.Printf("Error: JQ timeout - %s\n", j)

		isFailed.Set(true)
		err := jj.Close()
		if err != nil {
			return "", fmt.Errorf("jq execution timeout: %s", err)
		}

		return "", fmt.Errorf("jq execution timeout")
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

func run(jq *jq.Pipe, rc chan *jqResult, isFailed *AtomicBool) {
	r := &jqResult{Seq: make([]json.RawMessage, 0, 16)}
loop:
	for {
		if isFailed.Get() {
			return
		}

		next, err := jq.Next()
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

	if !isFailed.Get() {
		rc <- r
	}
}
