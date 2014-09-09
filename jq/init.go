package jq

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"runtime"
)

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
