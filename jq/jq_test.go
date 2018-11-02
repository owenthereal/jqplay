package jq

import (
	"context"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"
	"time"
)

func TestMain(m *testing.M) {
	pwd, _ := os.Getwd()
	err := SetPath(filepath.Join(pwd, ".."))
	if err != nil {
		panic("can't set JQ path: " + err.Error())
	}

	os.Exit(m.Run())
}

func TestJQEvalInvalidInput(t *testing.T) {
	jq := &JQ{}
	err := jq.Eval(context.Background(), ioutil.Discard)

	if err == nil {
		t.Errorf("err should not be nil since it's invalid input")
	}
}

func TestJQValidateDisallowOpts(t *testing.T) {
	jq := &JQ{
		J: "{}",
		Q: ".",
		O: []JQOpt{
			{
				Name: "from-file",
			},
		},
	}

	err := jq.Validate()
	if err == nil || !strings.Contains(err.Error(), `disallow option "from-file"`) {
		t.Errorf(`err should include disallow option "from-file"`)
	}
}

func TestJQEvalTimeout(t *testing.T) {
	t.Parallel()

	jq := &JQ{
		J: `{"dependencies":{"capnp":{"version":"0.1.4","dependencies":{"es6-promise":{"version":"1.0.0","dependencies":{"es6-promise":{"version":"1.0.0"}}}}}}}`,
		Q: `.dependencies | recurse(to_entries | map(.values.dependencies))`,
	}
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	err := jq.Eval(ctx, ioutil.Discard)
	cancel()

	if err != ExecTimeoutError {
		t.Errorf("err message should be jq execution timeout, but it's %s", err)
	}
}

func TestJQEvalCancelled(t *testing.T) {
	t.Parallel()

	jq := &JQ{
		J: `{"dependencies":{"capnp":{"version":"0.1.4","dependencies":{"es6-promise":{"version":"1.0.0","dependencies":{"es6-promise":{"version":"1.0.0"}}}}}}}`,
		Q: `.dependencies | recurse(to_entries | map(.values.dependencies))`,
	}
	ctx, cancel := context.WithCancel(context.Background())
	go func() {
		time.Sleep(3 * time.Second)
		cancel()
	}()
	err := jq.Eval(ctx, ioutil.Discard)

	if err != ExecCancelledError {
		t.Errorf("err message should be jq execution timeout, but it's %s", err)
	}
}

func TestJQEvalRaceCondition(t *testing.T) {
	t.Parallel()

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
			err := jq.Eval(ctx, ioutil.Discard)
			if err != nil {
				t.Errorf("err should be nil: %s", err)
			}
		}()
	}

	wg.Wait()
}
