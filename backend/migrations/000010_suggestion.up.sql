CREATE TABLE suggestions (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text        TEXT        NOT NULL,
    contact     VARCHAR(255),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);