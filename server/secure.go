package server

import (
	"github.com/gin-gonic/gin"
	"gopkg.in/unrolled/secure.v1"
)

func secureMiddleware(c *Config) gin.HandlerFunc {
	secureMiddleware := secure.New(secure.Options{
		SSLRedirect:          true,
		STSSeconds:           315360000,
		SSLProxyHeaders:      map[string]string{"X-Forwarded-Proto": "https"},
		STSIncludeSubdomains: true,
		FrameDeny:            true,
		ContentTypeNosniff:   true,
		BrowserXssFilter:     true,
		IsDevelopment:        !c.IsProduction(),
	})

	return func(c *gin.Context) {
		err := secureMiddleware.Process(c.Writer, c.Request)
		if err != nil {
			return
		}

		c.Next()
	}
}
