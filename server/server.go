package server

import (
	"net/http"

	"github.com/codegangsta/negroni"
	"github.com/unrolled/render"
)

func New(port string) *Server {
	return &Server{port}
}

type Server struct {
	Port string
}

func (s *Server) Start() {
	r := render.New(render.Options{})
	h := &JQHandler{r}

	mux := http.NewServeMux()
	mux.HandleFunc("/", h.handleIndex)
	mux.HandleFunc("/jq", h.handleJq)

	n := negroni.Classic()
	n.UseHandler(mux)
	n.Run(":" + s.Port)
}
