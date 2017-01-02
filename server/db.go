package server

import (
	"crypto/sha1"
	"encoding/base64"
	"fmt"
	"io"

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

type Snippet struct {
	ID string `json:"id" db:"slug"`
	J  string `json:"j" db:"j"`
	Q  string `json:"q" db:"q"`
}

type DB struct {
	*sqlx.DB
	salt string
}

func (db *DB) UpsertSnippet(s *Snippet) error {
	s.ID = db.slug(s)
	_, err := db.NamedExec(`INSERT INTO snippets (slug, j, q) VALUES (:slug, :j, :q) ON CONFLICT (slug) DO UPDATE SET j = :j, q = :q`,
		map[string]interface{}{
			"slug": s.ID,
			"j":    s.J,
			"q":    s.Q,
		})

	return err
}

func (db *DB) GetSnippet(id string) (*Snippet, error) {
	fmt.Println(id)
	s := Snippet{}
	err := db.Get(&s, "SELECT slug, j, q FROM snippets WHERE slug = $1", id)

	return &s, err
}

func (db *DB) slug(s *Snippet) string {
	h := sha1.New()
	io.WriteString(h, db.salt)
	io.WriteString(h, s.J)
	io.WriteString(h, s.Q)
	sum := h.Sum(nil)
	b := make([]byte, base64.URLEncoding.EncodedLen(len(sum)))
	base64.URLEncoding.Encode(b, sum)

	return string(b)[:10]
}
