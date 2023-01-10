package middleware

import (
	"net/http"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/unrolled/secure"
)

const (
	allowOriginHeader = "Access-Control-Allow-Origin"
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
		if shouldAllowOrigin(c.Request) {
			c.Writer.Header().Add(allowOriginHeader, "*")
		}

		err := secureMiddleware.Process(c.Writer, c.Request)
		if err != nil {
			return
		}

		c.Next()
	}
}

func shouldAllowOrigin(req *http.Request) bool {
	extension := filepath.Ext(req.URL.Path)
	if len(extension) < 4 { // fast path
		return false
	}

	switch extension {
	case ".eot", ".ttf", ".otf", ".woff", ".woff2":
		return true
	default:
		return false
	}
}
