package server

import (
	"time"

	log "github.com/Sirupsen/logrus"
	"github.com/gin-gonic/gin"
)

func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID, _ := c.Get("request_id")
		logger := log.WithField("request_id", requestID)
		c.Set("logger", logger)

		start := time.Now()
		c.Next()
		end := time.Now()

		method := c.Request.Method
		path := c.Request.URL.Path
		latency := end.Sub(start)
		//comment := c.Errors.ByType(ErrorTypePrivate).String()
		logger.WithFields(log.Fields{
			"method":      method,
			"path":        path,
			"status_code": c.Writer.Status(),
			"client_ip":   c.ClientIP(),
			"latency":     latency,
		}).Infof("[jqplay] %s %s", method, path)
	}
}
