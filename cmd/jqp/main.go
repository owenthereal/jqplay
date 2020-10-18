package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/grpc-ecosystem/grpc-gateway/runtime"
	"github.com/jingweno/jqplay/api"
	"github.com/jingweno/jqplay/config"
	"github.com/jingweno/jqplay/jq"
	"github.com/rs/cors"
	"github.com/sirupsen/logrus"
	"google.golang.org/grpc/grpclog"
)

func main() {
	logger := logrus.New()
	grpclog.SetLoggerV2(grpclog.NewLoggerV2(logger.Out, logger.Out, logger.Out))

	if err := jq.Init(); err != nil {
		logger.Fatal(err)
	}

	c, err := config.Load()
	if err != nil {
		logger.Fatal(err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	grpcgw := runtime.NewServeMux()
	if err := api.RegisterJQServiceHandlerServer(ctx, grpcgw, &api.JQServer{}); err != nil {
		logger.Fatal(err)
	}

	r := mux.NewRouter()
	r.Use(handlers.CompressHandler)
	r.NotFoundHandler = handlers.CompressHandler(cors.Default().Handler(grpcgw))

	fs := http.FileServer(api.AssetFile())
	r.PathPrefix("/assets/").Handler(http.StripPrefix("/assets/", fs))
	r.Path("/").Handler(fs) // For index.html

	logger.Infof("Starting server on %s", c.Port)
	srv := &http.Server{
		Addr:    ":" + c.Port,
		Handler: r,
	}

	idleConnsClosed := make(chan struct{})
	go func() {
		sigint := make(chan os.Signal, 1)
		signal.Notify(sigint, os.Interrupt)
		<-sigint

		if err := srv.Shutdown(context.Background()); err != nil {
			logger.Infof("HTTP server Shutdown: %v", err)
		}

		close(idleConnsClosed)
	}()

	if err := srv.ListenAndServe(); err != nil {
		logger.Fatal(err)
	}

	<-idleConnsClosed
}
