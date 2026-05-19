-- убираем старый составной уникальный индекс
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_user_id_event_id_child_id_key;

-- два раздельных индекса для NULL и NOT NULL случаев
CREATE UNIQUE INDEX idx_applications_unique_no_child
    ON applications(user_id, event_id)
    WHERE child_id IS NULL;

CREATE UNIQUE INDEX idx_applications_unique_with_child
    ON applications(user_id, event_id, child_id)
    WHERE child_id IS NOT NULL;