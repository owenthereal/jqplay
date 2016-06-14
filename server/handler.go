package server

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/jingweno/jqplay/jq"
	"gopkg.in/unrolled/render.v1"
)

const (
	JSONPayloadLimit   = JSONPayloadLimitMB * OneMB
	JSONPayloadLimitMB = 5
	OneMB              = 1024000
)

type JQHandlerContext struct {
	*Config
	JQ string
}

func (c *JQHandlerContext) Asset(path string) string {
	return fmt.Sprintf("%s/%s", c.Config.AssetHost, path)
}

func (c *JQHandlerContext) ShouldInitJQ() bool {
	return c.JQ != ""
}

type JQHandler struct {
	r *render.Render
	c *Config
}

func (h *JQHandler) handleIndex(rw http.ResponseWriter, r *http.Request) {
	h.r.HTML(rw, 200, "index", &JQHandlerContext{Config: h.c})
}

func (h *JQHandler) handleJqPost(rw http.ResponseWriter, r *http.Request) {
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
		rw.WriteHeader(422)
		fmt.Fprint(rw, err.Error())
		return
	}
	defer r.Body.Close()

	var jq *jq.JQ
	err = json.Unmarshal(b, &jq)
	if err != nil {
		rw.WriteHeader(422)
		fmt.Fprint(rw, err.Error())
		return
	}

	err = jq.Eval(rw)
	if err != nil {
		rw.WriteHeader(422)
		fmt.Fprint(rw, err.Error())
		return
	}
}

func (h *JQHandler) handleJqGet(rw http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	jq := &jq.JQ{
		J: q.Get("j"),
		Q: q.Get("q"),
	}

	var jqData string
	if err := jq.Validate(); err == nil {
		d, err := json.Marshal(jq)
		if err == nil {
			jqData = string(d)
		}
	}

	h.r.HTML(rw, 200, "index", &JQHandlerContext{Config: h.c, JQ: jqData})
}

func (h *JQHandler) handleJq(rw http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		h.handleJqPost(rw, r)
		return
	}

	if r.Method == "GET" {
		h.handleJqGet(rw, r)
		return
	}

	rw.WriteHeader(500)
}
