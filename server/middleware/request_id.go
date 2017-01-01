package middleware

import (
	"github.com/satori/go.uuid"
	"gopkg.in/gin-gonic/gin.v1"
)

func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.Request.Header.Get("X-Request-ID")
		if requestID == "" {
			requestID = uuid.NewV4().String()
		}
		c.Set("request_id", requestID)
		c.Next()
	}
}
