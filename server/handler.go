package server

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/jingweno/jqplay/jq"
	"github.com/unrolled/render"
)

const (
	JSONPayloadLimit   = JSONPayloadLimitMB * 1024000 // 5MB
	JSONPayloadLimitMB = 5
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

	if r.ContentLength > JSONPayloadLimit {
		h.r.JSON(rw, 403, map[string]string{
			"message": fmt.Sprintf("JSON payload is larger than limit %dMB.", JSONPayloadLimitMB)},
		)
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

	re, err := jq.Eval()
	if err != nil {
		h.r.JSON(rw, 422, map[string]string{"message": err.Error()})
		return
	}

	h.r.JSON(rw, 200, map[string]string{"result": re})
}
