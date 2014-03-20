package main

import (
	"log"
	"os"
)

func main() {
	err := setupJQExec()
	if err != nil {
		log.Fatal(err)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	s := &Server{port}
	err = s.Start()
	if err != nil {
		log.Fatal(err)
	}
}
