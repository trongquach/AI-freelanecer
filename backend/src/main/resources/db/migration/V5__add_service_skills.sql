-- ============================================================
-- V5__add_service_skills.sql
-- Create proper join table for Service ↔ Skill relationship
-- ============================================================

CREATE TABLE IF NOT EXISTS service_skills (
    service_id BIGINT NOT NULL,
    skill_id   BIGINT NOT NULL,
    PRIMARY KEY (service_id, skill_id),
    CONSTRAINT fk_ss_service FOREIGN KEY (service_id) REFERENCES services (id)  ON DELETE CASCADE,
    CONSTRAINT fk_ss_skill   FOREIGN KEY (skill_id)   REFERENCES skills   (id)  ON DELETE CASCADE
);
