package main

import (
	"log"
	"os"

	"github.com/jingweno/jqplay/jq"
	"github.com/jingweno/jqplay/server"
)

func main() {
	err := jq.Init()
	if err != nil {
		log.Fatal(err)
	}

	log.Printf("jq version=%s path=%s\n", jq.Version, jq.Path)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	c := &server.Config{
		Port:               port,
		Env:                os.Getenv("JQPLAY_ENV"),
		NewRelicLicenseKey: os.Getenv("NEW_RELIC_LICENSE_KEY"),
		JQVersion:          jq.Version,
	}

	log.Printf("Starting server at %s\n", c.Port)
	s := server.New(c)
	s.Start()
}
