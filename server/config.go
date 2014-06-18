package server

type Config struct {
	JQVersion          string
	Env                string
	NewRelicLicenseKey string
}

func (c *Config) IsProduction() bool {
	return c.Env == "production"
}
