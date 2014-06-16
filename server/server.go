package server

import (
	"net/http"
	"os"

	"github.com/codegangsta/negroni"
	"github.com/jingweno/negroni-gorelic"
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
	if nwk := os.Getenv("NEW_RELIC_LICENSE_KEY"); nwk != "" {
		n.Use(negronigorelic.New(nwk, "jqplay", false))
	}
	n.Run(":" + s.Port)
}
