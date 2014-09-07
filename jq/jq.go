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

const jqExecTimeout = 3

var Path, Version string

func Init() error {
	pwd, err := os.Getwd()
	if err != nil {
		return err
	}

	err = SetPath(pwd)
	if err != nil {
		return err
	}

	return nil
}

func SetPath(binDir string) error {
	jqPath := filepath.Join(binDir, "bin", fmt.Sprintf("%s_%s", runtime.GOOS, runtime.GOARCH))
	Path = filepath.Join(jqPath, "jq")

	_, err := os.Stat(Path)
	if err != nil {
		return err
	}

	os.Setenv("PATH", fmt.Sprintf("%s%c%s", jqPath, os.PathListSeparator, os.Getenv("PATH")))

	err = setVersion()

	return err
}

func setVersion() error {
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
		Version = string(m)

		return nil
	}

	return fmt.Errorf("can't find jq version: %s", out)
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
	if err := j.Validate(); err != nil {
		return "", err
	}

	jj, err := jq.New(bytes.NewReader([]byte(j.J)), j.Q, j.Opts()...)
	if err != nil {
		return "", err
	}

	rc := make(chan *jqResult, 1)
	defer close(rc)
	go run(jj, rc)

	select {
	case r := <-rc:
		return r.Result()
	case <-time.After(time.Second * jqExecTimeout):
		log.Printf("Error: JQ timeout - %s\n", j)

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

func run(jq *jq.Pipe, rc chan *jqResult) {
	r := &jqResult{Seq: make([]json.RawMessage, 0, 16)}
loop:
	for {
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

	rc <- r
}
