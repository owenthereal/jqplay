//go:build linux

package jq

import (
	"os"
	"syscall"
	"unsafe"
)

const (
	limitMemory  uint64 = 1 * 1024 * 1024 // 1 MiB
	limitCPUTime uint64 = 10              // 50 percentage
)

func NewJQExec() *JQExec {
	return &JQExec{
		ResourceLimiter: &LinuxResourceLimiter{
			MemoryLimit: limitMemory,
			CPULImit:    limitCPUTime,
		},
	}
}

type LinuxResourceLimiter struct {
	MemoryLimit uint64
	CPULImit    uint64
}

func (r *LinuxResourceLimiter) LimitResources(proc *os.Process) error {
	if proc == nil {
		return nil
	}

	pid := proc.Pid
	var err error

	// limit address space
	lim := syscall.Rlimit{Cur: r.MemoryLimit, Max: r.MemoryLimit}
	_, _, errno := syscall.Syscall6(syscall.SYS_PRLIMIT64, uintptr(pid), syscall.RLIMIT_AS, uintptr(unsafe.Pointer(&lim)), 0, 0, 0)
	err = errnoToErr(errno)
	if err != nil {
		return err
	}

	// limit cpu time
	lim = syscall.Rlimit{Cur: r.CPULImit, Max: r.CPULImit}
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
