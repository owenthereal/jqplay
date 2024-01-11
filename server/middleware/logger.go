package middleware

import (
	"fmt"
	"time"

	"log/slog"

	"github.com/gin-gonic/gin"
)

func Logger(logger *slog.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID, _ := c.Get("request_id")

		logger := logger.With("request_id", requestID)
		c.Set("logger", logger)

		start := time.Now()
		c.Next()
		end := time.Now()

		method := c.Request.Method
		path := c.Request.URL.Path
		latency := end.Sub(start)
		logger.Info(
			fmt.Sprintf("%s %s", method, path),
			"method", method,
			"path", path,
			"status", c.Writer.Status(),
			"client_ip", c.ClientIP(),
			"latency", latency,
			"bytes", c.Writer.Size(),
		)
	}
}
