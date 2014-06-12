package main

import (
	"log"
	"os"

	"github.com/jingweno/jqplay/jq"
)

func main() {
	log.Printf("jq version=%s path=%s\n", jq.Version, jq.Path)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	log.Printf("Starting server at %s\n", port)
	s := &Server{port}
	s.Start()
}
