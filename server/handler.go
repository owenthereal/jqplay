package server

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/Sirupsen/logrus"
	log "github.com/Sirupsen/logrus"
	"github.com/jingweno/jqplay/config"
	"github.com/jingweno/jqplay/jq"
	"gopkg.in/gin-gonic/gin.v1"
)

const (
	jqExecTimeout = 15 * time.Second
)

type JQHandlerContext struct {
	*config.Config
	JQ string
}

func (c *JQHandlerContext) Asset(path string) string {
	return fmt.Sprintf("%s/%s", c.AssetHost, path)
}

func (c *JQHandlerContext) ShouldInitJQ() bool {
	return c.JQ != ""
}

type JQHandler struct {
	DB     *DB
	Config *config.Config
}

func (h *JQHandler) handleIndex(c *gin.Context) {
	c.HTML(200, "index.tmpl", &JQHandlerContext{Config: h.Config})
}

func (h *JQHandler) handleJqPost(c *gin.Context) {
	var j *jq.JQ
	if err := c.BindJSON(&j); err != nil {
		err = fmt.Errorf("error parsing JSON: %s", err)
		h.logger(c).WithError(err).Info("error parsing JSON")
		c.String(http.StatusUnprocessableEntity, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), jqExecTimeout)
	defer cancel()

	// Evaling into ResponseWriter sets the status code to 200
	// appending error message in the end if there's any
	var debug bytes.Buffer
	w := io.MultiWriter(c.Writer, &debug)
	if err := j.Eval(ctx, w); err != nil {
		fmt.Fprint(c.Writer, err.Error())

		if shouldLogJQError(err) {
			h.logger(c).WithError(err).WithFields(log.Fields{
				"j": j.J,
				"q": j.Q,
				"o": j.Opts(),
				"r": debug.String(),
			}).Info("jq error")
		}
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
		h.logger(c).WithError(err).Info("error parsing JSON")
		c.String(http.StatusUnprocessableEntity, err.Error())
		return
	}

	if err := jq.Validate(); err != nil {
		c.String(http.StatusUnprocessableEntity, err.Error())
		return
	}

	id, err := h.DB.UpsertSnippet(FromJQ(jq))
	if err != nil {
		h.logger(c).WithError(err).Info("error upserting snippet")
		c.String(http.StatusUnprocessableEntity, "error sharing snippet")
		return
	}

	c.String(http.StatusCreated, id)
}

func (h *JQHandler) handleJqShareGet(c *gin.Context) {
	id := c.Param("id")

	s, err := h.DB.GetSnippet(id)
	if err != nil {
		h.logger(c).WithError(err).WithField("id", id).Info("error getting snippet")
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

func (h *JQHandler) logger(c *gin.Context) *logrus.Entry {
	l, _ := c.Get("logger")
	return l.(*logrus.Entry)
}

func shouldLogJQError(err error) bool {
	return err == jq.ExecTimeoutError || err == jq.ExecCancelledError
}
