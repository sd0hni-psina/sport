DROP INDEX IF EXISTS idx_applications_unique_no_child;
DROP INDEX IF EXISTS idx_applications_unique_with_child;

ALTER TABLE applications
    ADD CONSTRAINT applications_user_id_event_id_child_id_key
    UNIQUE (user_id, event_id, child_id);