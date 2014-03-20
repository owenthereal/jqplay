package main

import (
	"log"
	"net/http"
	"os"

	"github.com/codegangsta/martini"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	m := martini.Classic()
	m.Get("/jq", func(req *http.Request, logger *log.Logger) (int, string) {
		query := req.URL.Query()
		j := query.Get("j")
		q := query.Get("q")
		logger.Printf("j=%s, q=%s", j, q)

		r, err := JQ(j, q)
		if err != nil {
			return 422, err.Error()
		}

		return 200, r
	})

	err := http.ListenAndServe(":"+port, m)
	if err != nil {
		log.Fatal(err)
	}
}
