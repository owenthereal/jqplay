package main

import (
	"log"
	"net/http"

	"github.com/codegangsta/martini"
)

func handleJQ(req *http.Request, logger *log.Logger) (int, string) {
	query := req.URL.Query()
	j := query.Get("j")
	q := query.Get("q")

	if j == "" {
		return 422, "param j can't be blank"
	}

	if q == "" {
		return 422, "param q can't be blank"
	}

	logger.Printf("j=%s, q=%s", j, q)

	r, err := JQ(j, q)
	if err != nil {
		return 422, err.Error()
	}

	return 200, r
}

type Server struct {
	Port string
}

func (s *Server) Start() error {
	m := martini.Classic()
	m.Use(martini.Static("public"))
	m.Get("/jq", handleJQ)

	return http.ListenAndServe(":"+s.Port, m)
}
