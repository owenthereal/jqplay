package server

import (
	"context"
	"html/template"
	"net/http"
	"syscall"
	"time"

	"github.com/oklog/run"
	"github.com/owenthereal/jqplay/config"
	"github.com/owenthereal/jqplay/server/middleware"
	log "github.com/sirupsen/logrus"
	"gopkg.in/gin-gonic/gin.v1"
)

func New(c *config.Config) *Server {
	return &Server{c}
}

type Server struct {
	Config *config.Config
}

func (s *Server) Start(ctx context.Context) error {
	db, err := ConnectDB(s.Config.DatabaseURL)
	if err != nil {
		return err
	}

	var g run.Group

	g.Add(run.SignalHandler(ctx, syscall.SIGTERM))

	srv, err := newHTTPServer(s.Config, db)
	if err != nil {
		return err
	}
	g.Add(func() error {
		return srv.ListenAndServe()
	}, func(error) {
		ctx, cancel := context.WithTimeout(context.Background(), 28*time.Second)
		defer cancel()

		if err := srv.Shutdown(ctx); err != nil {
			log.WithError(err).Error("error shutting down server")
		}
	})

	return g.Run()
}

func newHTTPServer(cfg *config.Config, db *DB) (*http.Server, error) {
	h := &JQHandler{Config: cfg, DB: db}

	tmpl := template.New("index.tmpl")
	tmpl.Delims("#{", "}")
	tmpl, err := tmpl.ParseFiles("public/index.tmpl")
	if err != nil {
		return nil, err
	}

	router := gin.New()
	router.Use(
		middleware.Timeout(25*time.Second),
		middleware.LimitContentLength(10),
		middleware.Secure(cfg.IsProd()),
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
	router.StaticFile("/robots.txt", "public/robots.txt")

	router.GET("/", h.handleIndex)
	router.GET("/jq", h.handleJqGet)
	router.POST("/jq", h.handleJqPost)
	router.POST("/s", h.handleJqSharePost)
	router.GET("/s/:id", h.handleJqShareGet)

	return &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: router,
	}, nil
}
