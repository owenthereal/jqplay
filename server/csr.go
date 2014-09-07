package server

import (
	"net/http"

	"github.com/codegangsta/negroni"
)

func csrMiddleware(c *Config) negroni.Handler {
	return &csr{c.AssetHost}
}

type csr struct {
	AllowedHost string
}

func (c *csr) ServeHTTP(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	rw.Header().Set("Access-Control-Allow-Origin", c.AllowedHost)
	rw.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	rw.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token")
	rw.Header().Set("Access-Control-Allow-Credentials", "true")
	next(rw, r)
}
