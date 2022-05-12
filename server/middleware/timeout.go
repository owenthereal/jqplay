package middleware

import (
	"context"
	"time"

	"github.com/gin-gonic/gin"
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
