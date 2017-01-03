package middleware

import (
	"github.com/unrolled/secure"
	"gopkg.in/gin-gonic/gin.v1"
)

func Secure(isProd bool) gin.HandlerFunc {
	secureMiddleware := secure.New(secure.Options{
		SSLRedirect:           true,
		STSSeconds:            315360000,
		SSLProxyHeaders:       map[string]string{"X-Forwarded-Proto": "https"},
		STSIncludeSubdomains:  true,
		FrameDeny:             true,
		ContentTypeNosniff:    true,
		BrowserXssFilter:      true,
		IsDevelopment:         !isProd,
		ContentSecurityPolicy: `default-src 'none'; base-uri 'self'; block-all-mixed-content; child-src assets.jqplay.org; connect-src 'self' assets.jqplay.org www.google-analytics.com; font-src assets.jqplay.org; form-action 'self' jqplay.org assets.jqplay.org; frame-ancestors 'none'; frame-src assets.japlay.org; img-src 'self' data: assets.jqplay.org; media-src 'none'; script-src assets.jqplay.org; style-src 'unsafe-inline' assets.japlay.org`,
	})

	return func(c *gin.Context) {
		err := secureMiddleware.Process(c.Writer, c.Request)
		if err != nil {
			return
		}

		c.Next()
	}
}
