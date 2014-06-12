package main

import (
	"log"
	"os"
)

func main() {
	log.Printf("jq version=%s path=%s\n", JQVersion, JQPath)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	log.Printf("Starting server at %s\n", port)
	s := &Server{port}
	s.Start()
}
