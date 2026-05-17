CREATE TABLE children (
    id          BIGSERIAL PRIMARY KEY,
    parent_id   BIGINT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name  VARCHAR(100)    NOT NULL,
    last_name   VARCHAR(100)    NOT NULL,
    middle_name VARCHAR(100),
    birth_date  DATE            NOT NULL,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_children_parent ON children(parent_id);