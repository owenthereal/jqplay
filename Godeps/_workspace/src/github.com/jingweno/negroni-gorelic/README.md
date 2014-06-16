negroni-gorelic
===============

[New Relic](https://newrelic.com) middleware for the [negroni](https://github.com/codegangsta/negroni) framework.

Usage
-----

```go
package main

import (
	"fmt"
	"net/http"

	"github.com/codegangsta/negroni"
	"github.com/jingweno/negroni-gorelic"
)

func main() {
	r := http.NewServeMux()
	r.HandleFunc(`/`, func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, "success!\n")
	})

	n := negroni.New()
	n.Use(negronigorelic.New("NEW_RELIC_LICENSE_KEY", "example-app", true))
	n.UseHandler(r)

	n.Run(":3000")
}
```

See a running [example](https://github.com/jingweno/negroni-gorelic/blob/master/example/example.go).

Credits
-------

A shout out to [@yvasiyarov](https://github.com/yvasiyarov) for his awesome work of [gorelic](https://github.com/yvasiyarov/gorelic).

License
-------

negroni-gorelic is released under the MIT license.
See [LICENSE.md](https://github.com/jingweno/negroni-gorelic/blob/master/LICENSE.md).
