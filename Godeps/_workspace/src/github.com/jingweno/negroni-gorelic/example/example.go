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
