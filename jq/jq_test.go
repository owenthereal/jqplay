package jq

import (
	"io/ioutil"
	"os"
	"path/filepath"
	"sync"
	"testing"
	"time"

	"golang.org/x/net/context"
)

func TestJQEval(t *testing.T) {
	pwd, _ := os.Getwd()
	err := SetPath(filepath.Join(pwd, ".."))
	if err != nil {
		t.Fatalf("can't set JQ path: %s", err)
	}

	jq := &JQ{}
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	err = jq.Eval(ctx, ioutil.Discard)
	cancel()

	if err == nil {
		t.Errorf("err should not be nil since it's invalid input")
	}

	jq = &JQ{
		J: `{"dependencies":{"capnp":{"version":"0.1.4","dependencies":{"es6-promise":{"version":"1.0.0","dependencies":{"es6-promise":{"version":"1.0.0"}}}}}}}`,
		Q: `.dependencies | recurse(to_entries | map(.values.dependencies))`,
	}
	ctx, cancel = context.WithTimeout(context.Background(), 3*time.Second)
	err = jq.Eval(ctx, ioutil.Discard)
	cancel()

	if err == nil {
		t.Errorf("err should not be nil since the executation should timeout")
	}

	if err.Error() != "jq execution timeout" {
		t.Errorf("err message should be jq execution timeout, but it's %s", err)
	}

	// simulate race condition
	var wg sync.WaitGroup
	for i := 0; i < 100; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()

			ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
			defer cancel()

			jq := &JQ{
				J: `{ "foo": { "bar": { "baz": 123 } } }`,
				Q: ".",
			}
			err = jq.Eval(ctx, ioutil.Discard)
			if err != nil {
				t.Errorf("err should be nil: %s", err)
			}
		}()
	}

	wg.Wait()
}
