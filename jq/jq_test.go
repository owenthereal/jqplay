package jq

import (
	"os"
	"path/filepath"
	"testing"
)

func TestJQEval(t *testing.T) {
	pwd, _ := os.Getwd()
	err := SetPath(filepath.Join(pwd, ".."))
	if err != nil {
		t.Fatalf("can't set JQ path: %s", err)
	}

	jq := &JQ{}
	_, err = jq.Eval()

	if err == nil {
		t.Errorf("err should not be nil since it's invalid input")
	}

	jq = &JQ{J: "{}", Q: "def foo: foo; foo"}
	_, err = jq.Eval()

	if err == nil {
		t.Errorf("err should not be nil since the executation should timeout")
	}

	jq = &JQ{
		J: `{ "foo": { "bar": { "baz": 123 } } }`,
		Q: ".",
	}
	_, err = jq.Eval()

	if err != nil {
		t.Errorf("err should be nil: %s", err)
	}
}
