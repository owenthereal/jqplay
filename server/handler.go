package server

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/jingweno/jqplay/jq"
	"github.com/unrolled/render"
)

type JQHandler struct {
	r *render.Render
}

func (h *JQHandler) handleIndex(rw http.ResponseWriter, r *http.Request) {
	h.r.HTML(rw, 200, "index", jq.Version)
}

func (h *JQHandler) handleJq(rw http.ResponseWriter, r *http.Request) {
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

	var jq *jq.JQ
	err = json.Unmarshal(b, &jq)
	if err != nil {
		h.r.JSON(rw, 422, map[string]string{"message": err.Error()})
		return
	}

	if err := jq.Validate(); err != nil {
		h.r.JSON(rw, 422, map[string]string{"message": err.Error()})
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
