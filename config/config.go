package config

import (
	"log/slog"

	"github.com/getsentry/sentry-go"
	"github.com/joeshaw/envdecode"
	"github.com/owenthereal/jqplay/jq"
	"github.com/owenthereal/jqplay/log"
)

type Config struct {
	Host        string `env:"HOST,default=0.0.0.0"`
	Port        string `env:"PORT,default=8080"`
	GinMode     string `env:"GIN_MODE,default=debug"`
	DatabaseURL string `env:"DATABASE_URL,required"`
	AssetHost   string `env:"ASSET_HOST"`
	SentryDSN   string `env:"SENTRY_DSN"`
	JQVer       string

	Logger *slog.Logger
}

func (c *Config) IsProd() bool {
	return c.GinMode == "release"
}

func Load() (*Config, error) {
	conf := &Config{}
	err := envdecode.Decode(conf)
	if err != nil {
		return nil, err
	}

	conf.JQVer = jq.Version

	conf.Logger = log.NewJSONLogger()
	if dsn := conf.SentryDSN; dsn != "" {
		if err := sentry.Init(sentry.ClientOptions{
			Dsn:              dsn,
			EnableTracing:    true,
			TracesSampleRate: 0.2,
			AttachStacktrace: true,
			Environment:      conf.GinMode,
		}); err != nil {
			return nil, err
		}

		conf.Logger = log.WrapWithSentryLogger(conf.Logger)
	}

	return conf, nil
}
