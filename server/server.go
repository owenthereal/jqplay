package server

import (
	"log"
	"os"
	"time"

	"html/template"

	"github.com/gin-gonic/gin"
	"github.com/jingweno/jqplay/jq"
	"github.com/tylerb/graceful"
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
		Env:                os.Getenv("GIN_MODE"),
		NewRelicLicenseKey: os.Getenv("NEW_RELIC_LICENSE_KEY"),
		AssetHost:          os.Getenv("ASSET_HOST"),
	}
	h := &JQHandler{c}

	tmpl := template.New("index.tmpl")
	tmpl.Delims("#{", "}")
	tmpl, err := tmpl.ParseFiles("public/index.tmpl")
	if err != nil {
		log.Fatal(err)
	}

	router := gin.New()
	router.Use(secureMiddleware(c), requestID(), logger(), gin.Recovery())
	router.SetHTMLTemplate(tmpl)
	router.Static("/public", "public")
	router.StaticFile("/robots.txt", "public/robots.txt")
	router.GET("/", h.handleIndex)
	router.GET("/jq", h.handleJqGet)
	router.POST("/jq", h.handleJqPost)

	graceful.Run(":"+s.Config.Port, 10*time.Second, router)
}
