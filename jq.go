package main

import (
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"strings"

	"github.com/jingweno/jqpipe-go"
)

func setupJQPath() error {
	pwd, err := os.Getwd()
	if err != nil {
		return err
	}

	jqPath := filepath.Join(pwd, "bin", fmt.Sprintf("%s_%s", runtime.GOOS, runtime.GOARCH))
	os.Setenv("PATH", fmt.Sprintf("%s%c%s", jqPath, os.PathListSeparator, os.Getenv("PATH")))
	return nil
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
