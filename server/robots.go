package server

import (
	"net/http"

	"github.com/codegangsta/negroni"
)

const robotsPath = "/robots.txt"

func robotsMiddleware() negroni.Handler {
	return &robots{"public/robots.txt"}
}

type robots struct {
	File string
}

func (r *robots) ServeHTTP(rw http.ResponseWriter, req *http.Request, next http.HandlerFunc) {
	if req.URL.Path == robotsPath {
		http.ServeFile(rw, req, r.File)
		return
	}

	next(rw, req)
}
