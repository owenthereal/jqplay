//go:build linux

package jq

import (
	"os"
	"syscall"
	"unsafe"
)

func limitResources(proc *os.Process, memoryLimit, cpuLimit uint64) error {
	if proc == nil {
		return nil
	}

	pid := proc.Pid
	var err error

	// limit address space
	lim := syscall.Rlimit{Cur: memoryLimit, Max: memoryLimit}
	_, _, errno := syscall.Syscall6(syscall.SYS_PRLIMIT64, uintptr(pid), syscall.RLIMIT_AS, uintptr(unsafe.Pointer(&lim)), 0, 0, 0)
	err = errnoToErr(errno)
	if err != nil {
		return err
	}

	// limit cpu time
	lim = syscall.Rlimit{Cur: cpuLimit, Max: cpuLimit}
	_, _, errno = syscall.Syscall6(syscall.SYS_PRLIMIT64, uintptr(pid), syscall.RLIMIT_CPU, uintptr(unsafe.Pointer(&lim)), 0, 0, 0)
	err = errnoToErr(errno)

	return err
}

func errnoToErr(errno syscall.Errno) error {
	if errno != 0 {
		return errno
	}

	return nil
}
