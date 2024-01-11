//go:build darwin

package jq

import "os"

func limitResources(proc *os.Process, memoryLimit, cpuLimit uint64) error {
	return nil
}
