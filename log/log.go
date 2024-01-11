package log

import (
	"log/slog"
	"os"

	slogmulti "github.com/samber/slog-multi"
	slogsentry "github.com/samber/slog-sentry/v2"
)

func NewJSONLogger() *slog.Logger {
	return slog.New(slog.NewJSONHandler(os.Stderr, nil))
}

func WrapWithSentryLogger(logger *slog.Logger) *slog.Logger {
	return slog.New(
		slogmulti.Fanout(
			logger.Handler(),
			slogsentry.Option{Level: slog.LevelError}.NewSentryHandler(),
		),
	)
}
