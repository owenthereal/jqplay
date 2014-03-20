package jq

import (
	"encoding/json"
	"testing"
)

func TestJqEval(t *testing.T) {
	exSucc(t, "", ".[0] + .[1]")
	exSucc(t, "[1,2]", ".[0] + .[1]", "3")
	exSucc(t, "[1,2][11,22]", ".[0] + .[1]", "3", "33")
	exFail(t, "[", ".")
	exFail(t, "[]", "]")
	exFail(t, "[1,2] 3", ".[0] + .[1]", "3")
}

func exFail(t *testing.T, inp string, expr string, out ...string) bool {
	ok := true
	seq, err := Eval(inp, expr)

	if len(seq) != len(out) {
		return failEval(t, inp, expr, seq, "expected %v results and failure", len(out))
	}
	for i := range seq {
		if string(out[i]) != string(seq[i]) {
			ok = failEval(t, inp, expr, seq, "expected [%v]: %v", i, out[i])
		}
	}
	if err == nil {
		return failEval(t, inp, expr, seq, "expected failure")
	}
	return ok
}

func exSucc(t *testing.T, inp string, expr string, out ...string) bool {
	ok := true
	seq, err := Eval(inp, expr)
	if err != nil {
		return failEval(t, inp, expr, seq, "jq-exit: %v", err)
	}

	if len(seq) != len(out) {
		return failEval(t, inp, expr, seq, "expected %v results", len(out))
	}

	for i := range seq {
		if string(out[i]) != string(seq[i]) {
			ok = failEval(t, inp, expr, seq, "expected [%v]: %v", i, out[i])
		}
	}
	return ok
}

func failEval(t *testing.T, inp, expr string, results []json.RawMessage, layout string, info ...interface{}) bool {
	t.Logf("json: %v", inp)
	t.Logf("expr: %v", expr)
	for i, item := range results {
		t.Logf(" [%v]: %v", i, string(item))
	}
	t.Errorf(layout, info...)
	return false
}
