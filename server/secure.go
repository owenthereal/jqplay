package server

import (
	"fmt"

	"github.com/codegangsta/negroni"
	"gopkg.in/unrolled/secure.v1"
)

func secureMiddleware(c *Config) negroni.Handler {
	csp := fmt.Sprintf("default-src *; script-src 'self' %s https://www.google-analytics.com 'unsafe-inline'; style-src 'self' %s 'unsafe-inline'; object-src 'self' %s;", c.AssetHost, c.AssetHost, c.AssetHost)
	secureMiddleware := secure.New(secure.Options{
		SSLRedirect:           true,
		STSSeconds:            315360000,
		SSLProxyHeaders:       map[string]string{"X-Forwarded-Proto": "https"},
		STSIncludeSubdomains:  true,
		FrameDeny:             true,
		ContentTypeNosniff:    true,
		BrowserXssFilter:      true,
		ContentSecurityPolicy: csp,
		IsDevelopment:         !c.IsProduction(),
	})

	return negroni.HandlerFunc(secureMiddleware.HandlerFuncWithNext)
}
