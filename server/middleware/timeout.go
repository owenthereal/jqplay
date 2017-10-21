package middleware

import (
	"context"
	"time"

	"gopkg.in/gin-gonic/gin.v1"
)

func Timeout(d time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), d)
		c.Request = c.Request.WithContext(ctx)

		go func() {
			<-ctx.Done()
			cancel()
		}()

		c.Next()
	}
}
