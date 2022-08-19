package jq

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
)

var Path, Version string

func Init() error {
	path, err := exec.LookPath("jq")

	var binDir string
	if err == nil {
		binDir = filepath.Dir(path)
	} else {
		dir, err := os.MkdirTemp("", "jqplay")
		if err != nil {
			return err
		}

		if err := copyJqBin(dir); err != nil {
			return err
		}

		binDir = dir
	}

	return SetPath(binDir)
}

func SetPath(binDir string) error {
	Path = filepath.Join(binDir, "jq")
	os.Setenv("PATH", fmt.Sprintf("%s%c%s", binDir, os.PathListSeparator, os.Getenv("PATH")))
	return setVersion()
}

func setVersion() error {
	// get version from `jq --help`
	// since `jq --version` diffs between versions
	// e.g., 1.3 & 1.4
	var b bytes.Buffer
	cmd := exec.Command(Path, "--help")
	cmd.Stdout = &b
	cmd.Stderr = &b
	if err := cmd.Run(); err != nil {
		return err
	}

	out := bytes.TrimSpace(b.Bytes())
	r := regexp.MustCompile(`\[version (.+)\]`)
	if r.Match(out) {
		m := r.FindSubmatch(out)[1]
		Version = string(m)

		return nil
	}

	return fmt.Errorf("can't find jq version: %s", out)
}
