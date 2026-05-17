CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');

CREATE TABLE events (
    id                  BIGSERIAL PRIMARY KEY,
    name                VARCHAR(255)    NOT NULL,
    sport_type          VARCHAR(100)    NOT NULL,
    description         TEXT            NOT NULL,
    location            VARCHAR(255)    NOT NULL,
    location_lat        DOUBLE PRECISION,
    location_lng        DOUBLE PRECISION,
    time_start          TIMESTAMPTZ     NOT NULL,
    time_end            TIMESTAMPTZ     NOT NULL,
    instructor_name     VARCHAR(200),
    instructor_bio      TEXT,
    min_age             INT,
    max_age             INT,
    max_participants    INT,
    prizes              TEXT,
    cancel_deadline_hrs INT             NOT NULL DEFAULT 24,
    status              event_status    NOT NULL DEFAULT 'draft',
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_status     ON events(status);
CREATE INDEX idx_events_sport_type ON events(sport_type);
CREATE INDEX idx_events_time_start ON events(time_start);