//go:build darwin

package jq

func NewJQExec() *JQExec {
	return &JQExec{
		ResourceLimiter: &NoResourceLimiter{},
	}
}
