package middleware

import (
	"time"

	"github.com/sirupsen/logrus"
	"gopkg.in/gin-gonic/gin.v1"
)

func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID, _ := c.Get("request_id")
		logger := logrus.WithField("request_id", requestID)
		c.Set("logger", logger)

		start := time.Now()
		c.Next()
		end := time.Now()

		method := c.Request.Method
		path := c.Request.URL.Path
		latency := end.Sub(start)
		logger.WithFields(logrus.Fields{
			"method":    method,
			"path":      path,
			"status":    c.Writer.Status(),
			"client_ip": c.ClientIP(),
			"latency":   latency,
			"bytes":     c.Writer.Size(),
		}).Infof("%s %s", method, path)
	}
}
