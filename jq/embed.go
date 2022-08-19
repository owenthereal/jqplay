package jq

import (
	"embed"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"runtime"
)

//go:embed vendor/*
var fs embed.FS

func copyJqBin(dstDir string) error {
	in, err := fs.Open(jqBinRelPath())
	if err != nil {
		return fmt.Errorf("cannot open file %w", err)
	}
	defer in.Close()

	out, err := os.OpenFile(filepath.Join(dstDir, "jq"), os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0755)
	if err != nil {
		return fmt.Errorf("cannot create dst file %w", err)
	}
	defer out.Close()

	if _, err = io.Copy(out, in); err != nil {
		return fmt.Errorf("cannot copy file %w", err)
	}

	return nil
}

func jqBinRelPath() string {
	return filepath.Join("vendor", fmt.Sprintf("%s_%s", runtime.GOOS, runtime.GOARCH), "jq")
}
