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

	jq = &JQ{
		J: `{"dependencies":{"capnp":{"version":"0.1.4","dependencies":{"es6-promise":{"version":"1.0.0","dependencies":{"es6-promise":{"version":"1.0.0"}}}}}}}`,
		Q: `.dependencies | recurse(to_entries | map(.values.dependencies))`,
	}
	_, err = jq.Eval()

	if err == nil {
		t.Errorf("err should not be nil since the executation should timeout")
	}

	if err.Error() != "jq execution timeout" {
		t.Errorf("err message should be jq execution timeout")
	}

	jq = &JQ{
		J: `{ "foo": { "bar": { "baz": 123 } } }`,
		Q: ".",
	}

	// execute many times to simulate race condition
	for i := 0; i < 100; i++ {
		_, err = jq.Eval()

		if err != nil {
			t.Errorf("err should be nil: %s", err)
		}
	}
}
