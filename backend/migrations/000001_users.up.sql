CREATE TYPE user_role AS ENUM ('user', 'admin');

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100), 
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    city VARCHAR(100) NOT NULL,
    address TEXT,
    birth_date DATE NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    reputation INT NOT NULL DEFAULT(100),
    is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone_number);