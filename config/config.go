package config

import (
	"github.com/jingweno/jqplay/jq"
	"github.com/joeshaw/envdecode"
)

type Config struct {
	Host      string `env:"HOST,default=0.0.0.0"`
	Port      string `env:"PORT,default=3000"`
	AppMode   string `env:"APP_MODE,default=development"`
	AssetHost string `env:"ASSET_HOST"`
	JQVer     string
}

func (c *Config) IsProd() bool {
	return c.AppMode == "production"
}

func Load() (*Config, error) {
	conf := &Config{}
	err := envdecode.Decode(conf)
	if err != nil {
		return nil, err
	}

	conf.JQVer = jq.Version

	return conf, nil
}
