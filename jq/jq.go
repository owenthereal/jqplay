package jq

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"runtime"
	"strings"
	"time"

	"github.com/jingweno/jqpipe-go"
)

const jqExecTimeout = 5

var Path, Version string

func init() {
	var err error

	Path, err = setupJQPath()
	if err != nil {
		log.Fatal(err)
	}

	Version, err = jqVersion()
	if err != nil {
		log.Fatal(err)
	}
}

func setupJQPath() (string, error) {
	pwd, err := os.Getwd()
	if err != nil {
		return "", err
	}

	jqPath := filepath.Join(pwd, "bin", fmt.Sprintf("%s_%s", runtime.GOOS, runtime.GOARCH))
	os.Setenv("PATH", fmt.Sprintf("%s%c%s", jqPath, os.PathListSeparator, os.Getenv("PATH")))

	return filepath.Join(jqPath, "jq"), nil
}

func jqVersion() (string, error) {
	// get version from `jq --help`
	// since `jq --version` diffs between versions
	// e.g., 1.3 & 1.4
	var b bytes.Buffer
	cmd := exec.Command(Path, "--help")
	cmd.Stdout = &b
	cmd.Stderr = &b
	cmd.Run()

	out := bytes.TrimSpace(b.Bytes())
	r := regexp.MustCompile(`\[version (.+)\]`)
	if r.Match(out) {
		m := r.FindSubmatch(out)[1]
		return string(m), nil
	}

	return "", fmt.Errorf("can't find jq version: %s", out)
}

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
	resultCh := make(chan jqResult, 1)
	go func(js, expr string, opts ...string) {
		seq, err := eval(js, expr, opts...)
		resultCh <- jqResult{seq, err}
	}(j.J, j.Q, j.Opts()...)

	select {
	case r := <-resultCh:
		return r.Result()
	case <-time.After(time.Second * jqExecTimeout):
		log.Printf("Error: JQ timeout - %s\n", j)
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

// eval `jq` expression
func eval(js string, expr string, opts ...string) ([]json.RawMessage, error) {
	jq, err := jq.New(bytes.NewReader([]byte(js)), expr, opts...)
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
}
