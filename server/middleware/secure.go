package middleware

import (
	"github.com/unrolled/secure"
	"gopkg.in/gin-gonic/gin.v1"
)

func Secure(isProd bool) gin.HandlerFunc {
	secureMiddleware := secure.New(secure.Options{
		SSLRedirect:          true,
		STSSeconds:           315360000,
		SSLProxyHeaders:      map[string]string{"X-Forwarded-Proto": "https"},
		STSIncludeSubdomains: true,
		FrameDeny:            true,
		ContentTypeNosniff:   true,
		BrowserXssFilter:     true,
		IsDevelopment:        !isProd,
	})

	return func(c *gin.Context) {
		err := secureMiddleware.Process(c.Writer, c.Request)
		if err != nil {
			return
		}

		c.Next()
	}
}
