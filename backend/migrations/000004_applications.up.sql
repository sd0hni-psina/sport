CREATE TYPE application_status AS ENUM (
    'pending',
    'confirmed',
    'cancelled_by_user',
    'cancelled_by_admin',
    'no_show',
    'attended'
);

CREATE TABLE applications (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT              NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id     BIGINT              NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    child_id     BIGINT              REFERENCES children(id) ON DELETE SET NULL,
    status       application_status  NOT NULL DEFAULT 'pending',
    is_volunteer BOOLEAN             NOT NULL DEFAULT FALSE,
    notes        TEXT,
    admin_notes  TEXT,
    created_at   TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    UNIQUE(user_id, event_id, child_id)
);

CREATE INDEX idx_applications_user  ON applications(user_id);
CREATE INDEX idx_applications_event ON applications(event_id);
CREATE INDEX idx_applications_status ON applications(status);