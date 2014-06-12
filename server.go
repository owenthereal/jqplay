package main

import (
	"log"
	"net/http"

	"github.com/codegangsta/negroni"
	"github.com/unrolled/render"
)

type JQHandler struct {
	r *render.Render
}

func (h *JQHandler) handle(rw http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	j := query.Get("j")
	q := query.Get("q")

	if j == "" {
		h.r.JSON(rw, 422, map[string]string{"message": "param j can't be blank"})
		return
	}

	if q == "" {
		h.r.JSON(rw, 422, map[string]string{"message": "param q can't be blank"})
		return
	}

	log.Printf("j=%s, q=%s", j, q)

	re, err := JQ(j, q)
	if err != nil {
		h.r.JSON(rw, 422, map[string]string{"message": err.Error()})
		return
	}

	h.r.JSON(rw, 200, re)
}

type Server struct {
	Port string
}

func (s *Server) Start() {
	r := render.New(render.Options{})
	h := &JQHandler{r}

	mux := http.NewServeMux()
	mux.HandleFunc("/jq", h.handle)

	n := negroni.Classic()
	n.UseHandler(mux)
	n.Run(":" + s.Port)
}
