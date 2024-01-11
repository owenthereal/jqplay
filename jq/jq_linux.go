//go:build linux

package jq

import (
	"os"
	"syscall"
	"unsafe"
)

const (
	limitMemory  = 1 * 1024 * 1024 // 1 MiB
	limitCPUTime = 10              // 50 percentage
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
	MemoryLimit int
	CPULImit    int
}

func (r *LinuxResourceLimiter) LimitResources(proc *os.Process) {
	limitResources(proc)
}

func limitResources(proc *os.Process) {
	if proc == nil {
		return
	}

	pid := proc.Pid

	// limit address space
	lim := syscall.Rlimit{limitMemory, limitMemory}
	syscall.Syscall6(syscall.SYS_PRLIMIT64, uintptr(pid), syscall.RLIMIT_AS, uintptr(unsafe.Pointer(&lim)), 0, 0, 0)

	// limit cpu time
	lim = syscall.Rlimit{limitCPUTime, limitCPUTime}
	syscall.Syscall6(syscall.SYS_PRLIMIT64, uintptr(pid), syscall.RLIMIT_CPU, uintptr(unsafe.Pointer(&lim)), 0, 0, 0)
}
