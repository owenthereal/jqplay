package main

import (
	"context"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/grpc-ecosystem/grpc-gateway/runtime"
	"github.com/jingweno/jqplay/api"
	"github.com/jingweno/jqplay/config"
	"github.com/jingweno/jqplay/jq"
	"github.com/shurcooL/httpgzip"
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
	r.PathPrefix("/assets/").Handler(http.StripPrefix("/assets/", httpgzip.FileServer(
		api.AssetFile(),
		httpgzip.FileServerOptions{},
	)))
	r.Path("/").Handler(http.FileServer(api.AssetFile())) // For index.html
	r.Path("/run").Handler(grpcgw)                        // FIXME: Unfotunately this duplicates api.proto path defs

	logger.Infof("Starting server on %s", c.Port)
	svc := &http.Server{
		Addr:              ":" + c.Port,
		Handler:           r,
		ReadHeaderTimeout: 5 * time.Second,
		IdleTimeout:       120 * time.Second,
	}
	if err := svc.ListenAndServe(); err != nil {
		logger.Fatal(err)
	}
}
