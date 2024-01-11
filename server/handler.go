package server

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/owenthereal/jqplay/config"
	"github.com/owenthereal/jqplay/jq"
)

type JQHandlerContext struct {
	*config.Config
	JQ string
}

func (c *JQHandlerContext) Asset(path string) string {
	return fmt.Sprintf("%s/assets/public/%s", c.AssetHost, path)
}

func (c *JQHandlerContext) ShouldInitJQ() bool {
	return c.JQ != ""
}

type JQHandler struct {
	JQExec *jq.JQExec
	DB     *DB
	Config *config.Config
}

func (h *JQHandler) handleIndex(c *gin.Context) {
	c.HTML(200, "index.tmpl", &JQHandlerContext{Config: h.Config})
}

func (h *JQHandler) handleJqPost(c *gin.Context) {
	var jq jq.JQ
	if err := c.BindJSON(&jq); err != nil {
		err = fmt.Errorf("error parsing JSON: %s", err)
		h.logger(c).Error("error parsing JSON", "error", err)
		c.String(http.StatusUnprocessableEntity, err.Error())
		return
	}

	c.Header("Content-Type", "text/plain; charset=utf-8")

	// Evaling into ResponseWriter sets the status code to 200
	// appending error message in the end if there's any
	if err := h.JQExec.Eval(c.Request.Context(), jq, c.Writer); err != nil {
		fmt.Fprint(c.Writer, err.Error())
		h.logger(c).Error("jq error", "error", err)
	}
}

func (h *JQHandler) handleJqGet(c *gin.Context) {
	jq := &jq.JQ{
		J: c.Query("j"),
		Q: c.Query("q"),
	}

	var jqData string
	if err := jq.Validate(); err == nil {
		d, err := json.Marshal(jq)
		if err == nil {
			jqData = string(d)
		}
	}

	c.HTML(http.StatusOK, "index.tmpl", &JQHandlerContext{Config: h.Config, JQ: jqData})
}

func (h *JQHandler) handleJqSharePost(c *gin.Context) {
	var jq *jq.JQ
	if err := c.BindJSON(&jq); err != nil {
		err = fmt.Errorf("error parsing JSON: %s", err)
		h.logger(c).Error("error parsing JSON", "error", err)
		c.String(http.StatusUnprocessableEntity, err.Error())
		return
	}

	if err := jq.Validate(); err != nil {
		c.String(http.StatusUnprocessableEntity, err.Error())
		return
	}

	id, err := h.DB.UpsertSnippet(FromJQ(jq))
	if err != nil {
		h.logger(c).Error("error upserting snippet", "error", err)
		c.String(http.StatusUnprocessableEntity, "error sharing snippet")
		return
	}

	c.String(http.StatusCreated, id)
}

func (h *JQHandler) handleJqShareGet(c *gin.Context) {
	id := c.Param("id")

	s, err := h.DB.GetSnippet(id)
	if err != nil {
		h.logger(c).Error("error getting snippet", "error", err, "id", id)
		c.Redirect(http.StatusFound, "/")
		return
	}

	var jqData string
	d, err := json.Marshal(ToJQ(s))
	if err == nil {
		jqData = string(d)
	}

	c.HTML(200, "index.tmpl", &JQHandlerContext{
		Config: h.Config,
		JQ:     jqData,
	})
}

func (h *JQHandler) logger(c *gin.Context) *slog.Logger {
	l, _ := c.Get("logger")
	return l.(*slog.Logger)
}
