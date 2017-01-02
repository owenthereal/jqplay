DROP TABLE IF EXISTS snippets;
CREATE TABLE snippets (
  id BIGSERIAL,
  slug TEXT NOT NULL UNIQUE,
  j JSONB NOT NULL,
  q TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp
);