package server

import "fmt"

type Config struct {
	Port               string
	Env                string
	NewRelicLicenseKey string
	JQVersion          string
	AssetHost          string
}

func (c *Config) IsProduction() bool {
	return c.Env == "production"
}

func (c *Config) Asset(path string) string {
	return fmt.Sprintf("%s/%s", c.AssetHost, path)
}
