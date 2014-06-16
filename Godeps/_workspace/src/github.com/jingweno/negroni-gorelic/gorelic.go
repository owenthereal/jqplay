package negronigorelic

import (
	"net/http"
	"time"

	"github.com/yvasiyarov/go-metrics"
	"github.com/yvasiyarov/gorelic"
)

type Gorelic struct {
	Agent *gorelic.Agent
}

func New(license string, appname string, verbose bool) *Gorelic {
	if license == "" {
		panic("Please specify NewRelic license")
	}

	agent := gorelic.NewAgent()
	agent.NewrelicLicense = license
	agent.HTTPTimer = metrics.NewTimer()
	agent.CollectHTTPStat = true
	agent.Verbose = verbose

	agent.NewrelicName = appname
	agent.Run()

	return &Gorelic{agent}
}

func (g *Gorelic) ServeHTTP(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	startTime := time.Now()

	next(rw, r)

	g.Agent.HTTPTimer.UpdateSince(startTime)
}
