package server

import (
	"net/http"
	"os"

	"github.com/jingweno/jqplay/Godeps/_workspace/src/github.com/codegangsta/negroni"
	"github.com/jingweno/jqplay/Godeps/_workspace/src/github.com/jingweno/negroni-gorelic"
	render "github.com/jingweno/jqplay/Godeps/_workspace/src/gopkg.in/unrolled/render.v1"
	"github.com/jingweno/jqplay/jq"
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
		AssetHost:          os.Getenv("ASSET_HOST"),
	}
	r := render.New(render.Options{
		Delims: render.Delims{
			Left:  "#{",
			Right: "}",
		},
		Directory: "public",
	})
	h := &JQHandler{r, c}

	mux := http.NewServeMux()
	mux.HandleFunc("/", h.handleIndex)
	mux.HandleFunc("/jq", h.handleJq)

	n := negroni.New()

	n.Use(negroni.NewRecovery())
	n.Use(negroni.NewLogger())
	n.Use(robotsMiddleware())
	n.Use(corsMiddleware("/public"))

	static := negroni.NewStatic(http.Dir("public"))
	static.Prefix = "/public"
	n.Use(static)

	if nwk := c.NewRelicLicenseKey; nwk != "" {
		n.Use(negronigorelic.New(nwk, "jqplay", false))
	}

	n.Use(secureMiddleware(c))
	n.UseHandler(mux)

	n.Run(":" + s.Config.Port)
}
