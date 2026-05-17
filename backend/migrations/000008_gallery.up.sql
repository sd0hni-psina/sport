CREATE TYPE gallery_type AS ENUM ('photo', 'video');

CREATE TABLE gallery (
    id         BIGSERIAL PRIMARY KEY,
    event_id   BIGINT          REFERENCES events(id) ON DELETE SET NULL,
    url        TEXT            NOT NULL,
    type       gallery_type    NOT NULL,
    caption    TEXT,
    created_at TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gallery_event ON gallery(event_id);