package server

import (
	"github.com/codegangsta/negroni"
	"gopkg.in/unrolled/secure.v1"
)

func secureMiddleware(c *Config) negroni.Handler {
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

	return negroni.HandlerFunc(secureMiddleware.HandlerFuncWithNext)
}
