package main

import (
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"strings"

	"github.com/jingweno/jqpipe-go"
)

func setupJQExec() error {
	pwd, err := os.Getwd()
	if err != nil {
		return err
	}

	jqPath := filepath.Join(pwd, "bin", fmt.Sprintf("%s_%s", runtime.GOOS, runtime.GOARCH))
	os.Setenv("PATH", fmt.Sprintf("%s%c%s", jqPath, os.PathListSeparator, os.Getenv("PATH")))
	return nil
}

func JQ(json, query string) (string, error) {
	seq, err := jq.Eval(json, query)
	if err != nil {
		return "", err
	}

	result := []string{}
	for _, s := range seq {
		result = append(result, string(s))
	}

	return strings.Join(result, "\n"), nil
}
