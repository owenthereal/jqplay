package jq

import (
	"bytes"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"runtime"
	"strings"

	"github.com/jingweno/jqpipe-go"
)

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
	fmt.Println(os.Getenv("PATH"))
	fmt.Println(Path)
	out, err := exec.Command(Path, "--version").Output()
	if err != nil {
		return "", err
	}

	out = bytes.TrimSpace(out)
	r := regexp.MustCompile(`^jq-(.+)$`)
	if r.Match(out) {
		m := r.FindSubmatch(out)[1]
		return string(m), nil
	}

	r = regexp.MustCompile(`^jq version (.+)$`)
	if r.Match(out) {
		m := r.FindSubmatch(out)[1]
		return string(m), nil
	}

	return "", fmt.Errorf("can't find jq version: %s", out)
}

type JQ struct {
	J string `json:"j"`
	Q string `json:"q"`
}

func (j *JQ) Eval() (string, error) {
	seq, err := jq.Eval(j.J, j.Q)
	if err != nil {
		return "", err
	}

	result := []string{}
	for _, s := range seq {
		ss := string(s)
		if ss != "" && ss != "null" {
			result = append(result, ss)
		}
	}

	return strings.Join(result, "\n"), nil
}

func (j *JQ) Valid() bool {
	return j.J != "" && j.Q != ""
}

func (j JQ) String() string {
	return fmt.Sprintf("j=%s, q=%s", j.J, j.Q)
}
