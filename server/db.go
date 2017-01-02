package server

import (
	"crypto/sha1"
	"encoding/base64"
	"encoding/json"
	"io"

	"github.com/jingweno/jqplay/jq"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

const (
	upsertSnippetQuery = `INSERT INTO snippets (slug, j, q, o) VALUES (:slug, :j, :q, :o) ON CONFLICT (slug) DO UPDATE SET j = :j, q = :q, o = :o`
	getSnippetQuery    = `SELECT j, q, o FROM snippets WHERE slug = $1`
)

type Snippet struct {
	J string `db:"j"`
	Q string `db:"q"`
	O string `db:"o"`
}

func FromJQ(jq *jq.JQ) *Snippet {
	var oJSON []byte
	if jq.O != nil {
		oJSON, _ = json.Marshal(jq.O)
	}

	return &Snippet{
		J: jq.J,
		Q: jq.Q,
		O: string(oJSON),
	}
}

func ToJQ(s *Snippet) *jq.JQ {
	var o []jq.JQOpt
	if s.O != "" {
		_ = json.Unmarshal([]byte(s.O), &o)
	}

	return &jq.JQ{
		J: s.J,
		Q: s.Q,
		O: o,
	}
}

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

func (db *DB) UpsertSnippet(s *Snippet) (string, error) {
	slug := db.slug(s)
	_, err := db.NamedExec(upsertSnippetQuery,
		map[string]interface{}{
			"slug": slug,
			"j":    s.J,
			"q":    s.Q,
			"o":    s.O,
		})

	return slug, err
}

func (db *DB) GetSnippet(id string) (*Snippet, error) {
	s := Snippet{}
	err := db.Get(&s, getSnippetQuery, id)

	return &s, err
}

func (db *DB) slug(s *Snippet) string {
	h := sha1.New()
	io.WriteString(h, db.salt)
	io.WriteString(h, s.J)
	io.WriteString(h, s.Q)
	io.WriteString(h, s.O)
	sum := h.Sum(nil)
	b := make([]byte, base64.URLEncoding.EncodedLen(len(sum)))
	base64.URLEncoding.Encode(b, sum)

	return string(b)[:10]
}
