package server

import (
	"net/http"

	"github.com/codegangsta/negroni"
)

func corsMiddleware(c *Config) negroni.Handler {
	return &cors{}
}

type cors struct {
}

func (c *cors) ServeHTTP(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	rw.Header().Set("Access-Control-Allow-Origin", "*")
	next(rw, r)
}
