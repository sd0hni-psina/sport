CREATE TYPE award_type AS ENUM ('medal', 'diploma', 'certificate');

CREATE TABLE awards (
    id              BIGSERIAL PRIMARY KEY,
    application_id  BIGINT      NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    type            award_type  NOT NULL,
    description     TEXT        NOT NULL,
    issued_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_awards_application ON awards(application_id);