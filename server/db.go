package server

import (
	"crypto/sha1"
	"encoding/base64"
	"fmt"
	"io"

	"github.com/jingweno/jqplay/jq"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

func ConnectDB(url, salt string) (*DB, error) {
	db, err := sqlx.Connect("postgres", url)
	if err != nil {
		return nil, err
	}

	return &DB{DB: db, salt: salt}, nil
}

type DB struct {
	*sqlx.DB
	salt string
}

func (db *DB) UpsertSnippet(jq *jq.JQ) (string, error) {
	slug := db.slug(jq)
	_, err := db.NamedExec(`INSERT INTO snippets (slug, j, q) VALUES (:slug, :j, :q) ON CONFLICT (slug) DO UPDATE SET j = :j, q = :q`,
		map[string]interface{}{
			"slug": slug,
			"j":    jq.J,
			"q":    jq.Q,
		})

	return slug, err
}

func (db *DB) GetSnippet(id string) (*jq.JQ, error) {
	fmt.Println(id)
	jq := jq.JQ{}
	err := db.Get(&jq, "SELECT j, q FROM snippets WHERE slug = $1", id)

	return &jq, err
}

func (db *DB) slug(jq *jq.JQ) string {
	h := sha1.New()
	io.WriteString(h, db.salt)
	io.WriteString(h, jq.J)
	io.WriteString(h, jq.Q)
	sum := h.Sum(nil)
	b := make([]byte, base64.URLEncoding.EncodedLen(len(sum)))
	base64.URLEncoding.Encode(b, sum)

	return string(b)[:10]
}
