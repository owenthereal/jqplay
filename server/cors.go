package server

import (
	"net/http"
	"strings"

	"github.com/jingweno/jqplay/Godeps/_workspace/src/github.com/codegangsta/negroni"
)

func corsMiddleware(pathPrefix string) negroni.Handler {
	return &cors{pathPrefix}
}

type cors struct {
	PathPrefix string
}

func (c *cors) ServeHTTP(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	if strings.HasPrefix(r.URL.Path, c.PathPrefix) {
		rw.Header().Set("Access-Control-Allow-Origin", "*")
	}

	next(rw, r)
}
