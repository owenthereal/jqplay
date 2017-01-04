package server

import (
	"html/template"
	"log"
	"time"

	"github.com/gin-contrib/gzip"
	"github.com/jingweno/jqplay/config"
	"github.com/jingweno/jqplay/server/middleware"
	"github.com/tylerb/graceful"
	"gopkg.in/gin-gonic/gin.v1"
)

func New(c *config.Config) *Server {
	return &Server{c}
}

type Server struct {
	Config *config.Config
}

func (s *Server) Start() error {
	db, err := ConnectDB(s.Config.DatabaseURL)
	if err != nil {
		return err
	}

	h := &JQHandler{Config: s.Config, DB: db}

	tmpl := template.New("index.tmpl")
	tmpl.Delims("#{", "}")
	tmpl, err = tmpl.ParseFiles("public/index.tmpl")
	if err != nil {
		log.Fatal(err)
	}

	router := gin.New()
	router.Use(gzip.Gzip(gzip.DefaultCompression))
	router.Use(middleware.Secure(s.Config.IsProd()), middleware.RequestID(), middleware.Logger(), gin.Recovery())
	router.SetHTMLTemplate(tmpl)

	router.Static("/js", "public/js")
	router.Static("/css", "public/css")
	router.Static("/images", "public/images")
	router.Static("/fonts", "public/bower_components/bootstrap/dist/fonts")
	router.StaticFile("/worker-xquery.js", "public/bower_components/ace-builds/src-min-noconflict/worker-xquery.js")
	router.StaticFile("/robots.txt", "public/robots.txt")

	router.GET("/", h.handleIndex)
	router.GET("/jq", h.handleJqGet)
	router.POST("/jq", h.handleJqPost)
	router.POST("/s", h.handleJqSharePost)
	router.GET("/s/:id", h.handleJqShareGet)

	graceful.Run(":"+s.Config.Port, 10*time.Second, router)

	return nil
}
