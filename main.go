package main

import (
	"log"
	"os"
)

func main() {
	err := setupJQPath()
	if err != nil {
		log.Fatal(err)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	log.Printf("Starting server at %s\n", port)
	s := &Server{port}
	err = s.Start()
	if err != nil {
		log.Fatal(err)
	}
}
