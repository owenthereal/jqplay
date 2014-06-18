package server

import (
	"github.com/codegangsta/negroni"
	"github.com/unrolled/secure"
)

func secureHanlder(c *Config) negroni.Handler {
	secureMiddleware := secure.New(secure.Options{
		SSLRedirect:           true,
		STSSeconds:            315360000,
		STSIncludeSubdomains:  true,
		FrameDeny:             true,
		ContentTypeNosniff:    true,
		BrowserXssFilter:      true,
		ContentSecurityPolicy: "default-src *; script-src 'self' https://www.google-analytics.com 'unsafe-inline'; style-src 'self' 'unsafe-inline'; object-src 'self';",
		IsDevelopment:         !c.IsProduction(),
	})

	return negroni.HandlerFunc(secureMiddleware.HandlerFuncWithNext)
}
