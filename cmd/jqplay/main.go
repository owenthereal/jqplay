package main

import (
	"context"
	"log"
	"os"

	"github.com/owenthereal/jqplay/config"
	"github.com/owenthereal/jqplay/jq"
	"github.com/owenthereal/jqplay/server"
)

func main() {
	conf, err := config.Load()
	if err != nil {
		log.Fatalf("error loading config: %s", err.Error())
	}

	logger := conf.Logger

	if err := jq.Init(); err != nil {
		logger.Error("error initializing jq", "error", err)
		os.Exit(1)
	}
	logger.Info(
		"initialized jq",
		"version", jq.Version,
		"path", jq.Path,
	)

	logger.Info(
		"starting server",
		"host", conf.Host,
		"port", conf.Port,
	)
	srv := server.New(conf)
	if err := srv.Start(context.Background()); err != nil {
		logger.Error("error starting server", "error", err)
		os.Exit(1)
	}
}
