-- ============================================================
-- V14: Add vector embedding columns for CV Screening
-- 
-- Adds:
--   expert_cvs.cv_embedding   - dense vector of full CV content
--   jobs.jd_embedding         - cached dense vector of job description
--
-- Both columns are JSON arrays (serialized List<Double>) generated
-- by OpenAI text-embedding-3-small (1536 dimensions).
-- ============================================================

ALTER TABLE expert_cvs
    ADD COLUMN cv_embedding JSON NULL COMMENT 'OpenAI text-embedding-3-small vector of CV content. Used by AICVScreeningService for cosine similarity scoring.';

ALTER TABLE jobs
    ADD COLUMN jd_embedding JSON NULL COMMENT 'Cached OpenAI text-embedding-3-small vector of job description + skills. Generated on job publish to avoid repeated API calls per proposal.';
