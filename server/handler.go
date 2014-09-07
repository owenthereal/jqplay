package server

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/jingweno/jqplay/jq"
	"github.com/unrolled/render"
)

const (
	JSONPayloadLimit   = JSONPayloadLimitMB * OneMB
	JSONPayloadLimitMB = 1
	OneMB              = 1024000
)

type JQHandler struct {
	r *render.Render
	c *Config
}

func (h *JQHandler) handleIndex(rw http.ResponseWriter, r *http.Request) {
	h.r.HTML(rw, 200, "index", h.c)
}

func (h *JQHandler) handleJq(rw http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		h.r.JSON(rw, 500, nil)
		return
	}

	if r.ContentLength == -1 {
		log.Printf("Error: Content length is unknown")
	}

	if r.ContentLength > JSONPayloadLimit {
		msg := fmt.Sprintf("JSON payload size is %.1fMB, larger than limit %dMB.", float64(r.ContentLength)/OneMB, JSONPayloadLimitMB)
		log.Printf("Error: %s", msg)
		h.r.JSON(rw, 403, map[string]string{
			"message": msg,
		})

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

	re, err := jq.Eval()
	if err != nil {
		h.r.JSON(rw, 422, map[string]string{"message": err.Error()})
		return
	}

	h.r.JSON(rw, 200, map[string]string{"result": re})
}
