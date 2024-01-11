package server

import (
	"context"
	"html/template"
	"log/slog"
	"net/http"
	"os"
	"syscall"
	"time"

	sentrygin "github.com/getsentry/sentry-go/gin"
	"github.com/gin-gonic/gin"
	"github.com/oklog/run"
	"github.com/owenthereal/jqplay"
	"github.com/owenthereal/jqplay/config"
	"github.com/owenthereal/jqplay/jq"
	"github.com/owenthereal/jqplay/server/middleware"
)

const (
	requestTimeout = 5 * time.Second
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
			s.Config.Logger.Error("error shutting down server", "error", err)
		}
	})

	return g.Run()
}

func newHTTPServer(cfg *config.Config, db *DB) (*http.Server, error) {
	b, err := jqplay.PublicFS.ReadFile("public/index.tmpl")
	if err != nil {
		return nil, err
	}

	tmpl := template.New("index.tmpl")
	tmpl.Delims("#{", "}")
	tmpl, err = tmpl.Parse(string(b))
	if err != nil {
		return nil, err
	}

	router := gin.New()
	router.Use(
		sentrygin.New(sentrygin.Options{
			Repanic: true,
		}),
		middleware.Timeout(requestTimeout),
		middleware.LimitContentLength(10),
		middleware.Secure(cfg.IsProd()),
		middleware.RequestID(),
		middleware.Logger(slog.New(slog.NewJSONHandler(os.Stderr, nil))),
		gin.Recovery(),
	)
	router.SetHTMLTemplate(tmpl)

	h := &JQHandler{JQExec: jq.NewJQExec(), Config: cfg, DB: db}

	router.StaticFS("/assets", http.FS(jqplay.PublicFS))
	router.GET("/", h.handleIndex)
	router.GET("/jq", h.handleJqGet)
	router.POST("/jq", h.handleJqPost)
	router.POST("/s", h.handleJqSharePost)
	router.GET("/s/:id", h.handleJqShareGet)
	router.GET("/ping", func(c *gin.Context) {
		c.String(http.StatusOK, "pong")
	})

	return &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: router,
	}, nil
}
