package main

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"time"

	cursoriterator "github.com/Eun/go-pgx-cursor-iterator/v2"
	"github.com/jackc/pgx/v5/pgxpool"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/jmoiron/sqlx"
)

const (
	upsertSnippetQuery = `INSERT INTO snippets (slug, json, query, options, created_at) VALUES (:slug, :json, :query, :options, :created_at) ON CONFLICT (slug) DO UPDATE SET json = :json, query = :query, options = :options, created_at = :created_at`
)

var optionsMap = map[string]string{
	"slurp":          "-s",
	"null-input":     "-n",
	"compact-output": "-c",
	"raw-output":     "-r",
	"raw-input":      "-R",
}

type OldSnippet struct {
	ID        int       `db:"id"`
	J         string    `db:"j"`
	Q         string    `db:"q"`
	O         string    `db:"o"`
	Slug      string    `db:"slug"`
	CreatedAt time.Time `db:"created_at"`
}

type OldSnippetOption struct {
	Name    string `json:"name"`
	Enabled bool   `json:"enabled"`
}

type NewSnippet struct {
	JSON      string    `db:"json"`
	Query     string    `db:"query"`
	Options   []string  `db:"options"`
	Slug      string    `db:"slug"`
	CreatedAt time.Time `db:"created_at"`
}

func main() {
	sourceURL := os.Getenv("DATABASE_URL")
	targetURL := os.Getenv("TARGET_DATABASE_URL")
	if sourceURL == "" || targetURL == "" {
		panic("DATABASE_URL and TARGET_DATABASE_URL must be set")
	}

	ctx := context.Background()
	pool, err := pgxpool.New(ctx, sourceURL)
	if err != nil {
		log.Fatal(err)
	}

	db, err := sqlx.Connect("pgx", targetURL)
	if err != nil {
		log.Fatal(err)
	}

	olds := make([]OldSnippet, 1000)
	iter, err := cursoriterator.NewCursorIterator(pool, olds, "SELECT * FROM snippets")
	if err != nil {
		panic(err)
	}
	defer iter.Close(ctx)

	for iter.Next(ctx) {
		old := olds[iter.ValueIndex()]

		var oldOptions []OldSnippetOption
		if err := json.Unmarshal([]byte(old.O), &oldOptions); err != nil {
			log.Printf("error unmarshalling options: %v", err)
			continue
		}

		var newOptions []string
		for _, oldOption := range oldOptions {
			if oldOption.Enabled {
				newOpt, ok := optionsMap[oldOption.Name]
				if ok {
					newOptions = append(newOptions, newOpt)
				} else {
					log.Printf("unknown option: %s %s", old.Slug, oldOption.Name)
				}
			}
		}

		new := NewSnippet{
			JSON:      old.J,
			Query:     old.Q,
			Options:   newOptions,
			Slug:      old.Slug,
			CreatedAt: old.CreatedAt,
		}
		_, err := db.NamedExec(upsertSnippetQuery,
			new,
		)
		if err != nil {
			log.Fatal(err)
		}
	}

	if err := iter.Error(); err != nil {
		log.Fatal(err)
	}
}
