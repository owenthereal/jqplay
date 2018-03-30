package main

import (
	"github.com/jingweno/jqplay/config"
	"github.com/jingweno/jqplay/jq"
	"github.com/jingweno/jqplay/server"
	log "github.com/sirupsen/logrus"
)

func main() {
	err := jq.Init()
	if err != nil {
		log.Fatal(err)
	}

	log.WithFields(log.Fields{
		"version": jq.Version,
		"path":    jq.Path,
	}).Info("initialized jq")

	conf, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	log.WithFields(log.Fields{
		"host": conf.Host,
		"port": conf.Port,
	}).Infof("Starting server at %s:%s", conf.Host, conf.Port)
	srv := server.New(conf)
	err = srv.Start()
	if err != nil {
		log.WithError(err).Fatal("error starting sever")
	}
}
