package server

import (
	"net/http"
	"os"

	"github.com/codegangsta/negroni"
	"github.com/jingweno/jqplay/jq"
	"github.com/jingweno/negroni-gorelic"
	"github.com/unrolled/render"
)

func New(c *Config) *Server {
	return &Server{c}
}

type Server struct {
	Config *Config
}

func (s *Server) Start() {
	c := &Config{
		JQVersion:          jq.Version,
		Env:                os.Getenv("JQPLAY_ENV"),
		NewRelicLicenseKey: os.Getenv("NEW_RELIC_LICENSE_KEY"),
	}
	r := render.New(render.Options{
		Delims:    render.Delims{"#{", "}"},
		Directory: "public",
	})
	h := &JQHandler{r, c}

	mux := http.NewServeMux()
	mux.HandleFunc("/", h.handleIndex)
	mux.HandleFunc("/jq", h.handleJq)

	n := negroni.Classic()
	if nwk := c.NewRelicLicenseKey; nwk != "" {
		n.Use(negronigorelic.New(nwk, "jqplay", false))
	}
	n.Use(secureMiddleware(c))
	n.UseHandler(mux)

	n.Run(":" + s.Config.Port)
}
