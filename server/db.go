package server

import (
	"crypto/sha1"
	"encoding/base64"
	"encoding/json"
	"io"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/jmoiron/sqlx"
	"github.com/owenthereal/jqplay/jq"
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

func ConnectDB(url string) (*DB, error) {
	db, err := sqlx.Connect("pgx", url)
	if err != nil {
		return nil, err
	}

	return &DB{db}, nil
}

type DB struct {
	*sqlx.DB
}

func (db *DB) UpsertSnippet(s *Snippet) (string, error) {
	slug := slug(s)
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

func slug(s *Snippet) string {
	h := sha1.New()
	_, _ = io.WriteString(h, s.J)
	_, _ = io.WriteString(h, s.Q)
	_, _ = io.WriteString(h, s.O)
	sum := h.Sum(nil)
	b := make([]byte, base64.URLEncoding.EncodedLen(len(sum)))
	base64.URLEncoding.Encode(b, sum)

	// Web sites don’t always linkify a trailing underscore, making it seem like
	// the link is broken. If there is an underscore at the end of the substring,
	// extend it until there is not.
	hashLen := 11
	for hashLen <= len(b) && b[hashLen-1] == '_' {
		hashLen++
	}
	return string(b)[:hashLen]
}
