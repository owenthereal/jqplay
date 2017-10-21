package middleware

import (
	"fmt"
	"net/http"

	"gopkg.in/gin-gonic/gin.v1"
)

const (
	oneMB = 1024000
)

func LimitContentLength(limitMBs int64) gin.HandlerFunc {
	limitBytes := limitMBs * oneMB
	return func(c *gin.Context) {
		if c.Request.ContentLength > limitBytes {
			size := float64(c.Request.ContentLength) / oneMB
			c.String(http.StatusExpectationFailed, fmt.Sprintf("Request payload size is %.1fMB, larger than limit %dMB.", size, limitMBs))
			return
		}

		c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, limitBytes)
		c.Next()
	}
}
