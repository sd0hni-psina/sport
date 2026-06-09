-- Заявки — частые запросы по пользователю и статусу
CREATE INDEX IF NOT EXISTS idx_applications_user_status
    ON applications(user_id, status);

CREATE INDEX IF NOT EXISTS idx_applications_event_status
    ON applications(event_id, status);

-- Новости — публичный список только опубликованных
CREATE INDEX IF NOT EXISTS idx_posts_published
    ON posts(published_at DESC)
    WHERE published_at IS NOT NULL;

-- Мероприятия — фильтрация по статусу и дате
CREATE INDEX IF NOT EXISTS idx_events_status_time
    ON events(status, time_start ASC)
    WHERE status = 'published';

-- Пользователи — поиск по email (простой индекс без функции)
CREATE INDEX IF NOT EXISTS idx_users_email
    ON users(email)
    WHERE email IS NOT NULL;

-- Награды — по заявке
CREATE INDEX IF NOT EXISTS idx_awards_application
    ON awards(application_id);

-- Галерея — по дате создания
CREATE INDEX IF NOT EXISTS idx_gallery_created_at
    ON gallery(created_at DESC);