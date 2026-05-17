CREATE TABLE sections (
    id           BIGSERIAL PRIMARY KEY,
    name         VARCHAR(255)    NOT NULL,
    description  TEXT            NOT NULL,
    trainer_name VARCHAR(200),
    address      TEXT,
    schedule     TEXT,
    contact      TEXT,
    is_partner   BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);