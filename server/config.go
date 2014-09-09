package server

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
