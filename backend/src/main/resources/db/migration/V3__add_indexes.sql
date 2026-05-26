-- ============================================================
-- V3__add_indexes.sql — Full-text & performance indexes
-- ============================================================

-- Composite indexes for common query patterns
ALTER TABLE jobs    ADD INDEX idx_jobs_status_created   (status, created_at DESC);
ALTER TABLE proposals ADD INDEX idx_proposals_job_expert (job_id, expert_id);
ALTER TABLE transactions ADD INDEX idx_tx_type_status   (type, status);
ALTER TABLE messages ADD INDEX idx_messages_unread      (contract_id, is_read);
ALTER TABLE notifications ADD INDEX idx_notif_user_unread (user_id, is_read, created_at DESC);
