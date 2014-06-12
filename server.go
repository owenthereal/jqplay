package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/codegangsta/negroni"
	"github.com/unrolled/render"
)

type JQHandler struct {
	r *render.Render
}

func (h *JQHandler) handle(rw http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		h.r.JSON(rw, 500, nil)
		return
	}

	b, err := ioutil.ReadAll(r.Body)
	if err != nil {
		h.r.JSON(rw, 422, map[string]string{"message": err.Error()})
		return
	}
	defer r.Body.Close()

	var jq *JQ
	err = json.Unmarshal(b, &jq)
	if err != nil {
		h.r.JSON(rw, 422, map[string]string{"message": err.Error()})
		return
	}

	if !jq.Valid() {
		h.r.JSON(rw, 422, map[string]string{"message": "invalid input"})
		return
	}

	log.Println(jq)

	re, err := jq.Eval()
	if err != nil {
		h.r.JSON(rw, 422, map[string]string{"message": err.Error()})
		return
	}

	h.r.JSON(rw, 200, re)
}

type Server struct {
	Port string
}

func (s *Server) Start() {
	r := render.New(render.Options{})
	h := &JQHandler{r}

	mux := http.NewServeMux()
	mux.HandleFunc("/jq", h.handle)

	n := negroni.Classic()
	n.UseHandler(mux)
	n.Run(":" + s.Port)
}
