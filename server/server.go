package server

import (
	"html/template"
	"log"
	"time"

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
	router.Use(middleware.Secure(s.Config.IsProd()), middleware.RequestID(), middleware.Logger(), gin.Recovery())
	router.SetHTMLTemplate(tmpl)
	router.Static("/public", "public")
	router.StaticFile("/robots.txt", "public/robots.txt")
	router.GET("/", h.handleIndex)
	router.GET("/jq", h.handleJqGet)
	router.POST("/jq", h.handleJqPost)
	router.POST("/s", h.handleJqSharePost)
	router.GET("/s/:id", h.handleJqShareGet)

	graceful.Run(":"+s.Config.Port, 10*time.Second, router)

	return nil
}
