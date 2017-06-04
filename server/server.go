package server

import (
	"context"
	"html/template"
	"net/http"
	"os"
	"os/signal"
	"time"

	log "github.com/Sirupsen/logrus"
	"github.com/jingweno/jqplay/config"
	"github.com/jingweno/jqplay/server/middleware"
	"gopkg.in/gin-gonic/gin.v1"
)

func New(c *config.Config) *Server {
	return &Server{c}
}

type Server struct {
	Config *config.Config
}

func (s *Server) Start() error {
	stop := make(chan os.Signal)
	signal.Notify(stop, os.Interrupt)

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
	router.Use(
		middleware.Secure(s.Config.IsProd()),
		middleware.RequestID(),
		middleware.Logger(),
		gin.Recovery(),
	)
	router.SetHTMLTemplate(tmpl)

	router.Static("/js", "public/js")
	router.Static("/css", "public/css")
	router.Static("/images", "public/images")
	router.Static("/fonts", "public/bower_components/bootstrap/dist/fonts")
	router.StaticFile("/worker-xquery.js", "public/bower_components/ace-builds/src-min-noconflict/worker-xquery.js")
	router.StaticFile("/ext-searchbox.js", "public/bower_components/ace-builds/src-min-noconflict/ext-searchbox.js")
	router.StaticFile("/robots.txt", "public/robots.txt")

	router.GET("/", h.handleIndex)
	router.GET("/jq", h.handleJqGet)
	router.POST("/jq", h.handleJqPost)
	router.POST("/s", h.handleJqSharePost)
	router.GET("/s/:id", h.handleJqShareGet)

	srv := &http.Server{
		Addr:         ":" + s.Config.Port,
		ReadTimeout:  28 * time.Second,
		WriteTimeout: 28 * time.Second,
		Handler:      router,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil {
			log.WithError(err).Fatal("error starting server")
		}
	}()

	<-stop
	log.Println("\nShutting down the server...")
	ctx, _ := context.WithTimeout(context.Background(), 30*time.Second)
	return srv.Shutdown(ctx)
}
