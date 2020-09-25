package main

import (
	"fmt"
	"net/url"
	"syscall/js"

	"github.com/jingweno/jqplay/api/swagger/client"
	"github.com/jingweno/jqplay/api/swagger/client/j_q_service"
	"github.com/jingweno/jqplay/api/swagger/models"
)

func main() {
	u, err := currentURL()
	if err != nil {
		panic(err) // impossible
	}

	cfg := client.DefaultTransportConfig()
	cfg.Host = u.Host
	cfg.Schemes = []string{u.Scheme}
	c := client.NewHTTPClientWithConfig(nil, cfg)
	req := j_q_service.NewPostRunParams().WithBody(&models.APIRunRequest{
		J: `{"foo": "bar}`,
		Q: ".",
	})
	resp, err := c.JqService.PostRun(req)
	if err != nil {
		def := err.(*j_q_service.PostRunDefault)
		fmt.Println(def.GetPayload().Code)
		fmt.Println(def.GetPayload().Error)
		return
	}

	fmt.Println(resp.GetPayload().Out)
}

func currentURL() (*url.URL, error) {
	loc := js.Global().Get("window").Get("location")
	return url.ParseRequestURI(loc.Get("href").String())
}
