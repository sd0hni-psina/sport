CREATE TABLE posts (
    id           BIGSERIAL PRIMARY KEY,
    title        VARCHAR(255)    NOT NULL,
    body         TEXT            NOT NULL,
    cover_image  TEXT,
    event_id     BIGINT          REFERENCES events(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_published_at ON posts(published_at);
CREATE INDEX idx_posts_event        ON posts(event_id);