-- ============================================================
-- V11__add_cv_screening_and_interview.sql
-- Thêm hệ thống AI CV Screening và vòng phỏng vấn
-- ============================================================

-- ─── 1. Cập nhật jobs: thêm cột AI screening ────────────────
ALTER TABLE jobs
    ADD COLUMN max_shortlist          INT           DEFAULT 5    COMMENT 'Số ứng viên tối đa cho vòng phỏng vấn',
    ADD COLUMN ai_screening_threshold DECIMAL(3,2)  DEFAULT 0.60 COMMENT 'Ngưỡng điểm AI tối thiểu (0.00–1.00)',
    MODIFY COLUMN status ENUM(
        'DRAFT','OPEN','INTERVIEWING','IN_PROGRESS','COMPLETED','CANCELLED'
    ) DEFAULT 'DRAFT';

-- ─── 2. Cập nhật proposals: thêm cột AI + interview ─────────
ALTER TABLE proposals
    ADD COLUMN ai_score        DECIMAL(5,4) NULL COMMENT 'Điểm AI chấm CV (0.0000–1.0000)',
    ADD COLUMN ai_feedback     TEXT         NULL COMMENT 'Nhận xét chi tiết của AI',
    ADD COLUMN interview_notes TEXT         NULL COMMENT 'Ghi chú của Client sau phỏng vấn',
    MODIFY COLUMN status ENUM(
        'PENDING',
        'AI_SCREENING',
        'AI_PASSED',
        'AI_FAILED',
        'SHORTLISTED',
        'INTERVIEWED',
        'ACCEPTED',
        'REJECTED',
        'WITHDRAWN'
    ) DEFAULT 'PENDING';

-- Index hỗ trợ query sắp xếp theo điểm AI
CREATE INDEX idx_proposals_job_ai ON proposals (job_id, status, ai_score DESC);

-- ─── 3. Tạo bảng expert_cvs ──────────────────────────────────
CREATE TABLE expert_cvs (
    id                  BIGINT        NOT NULL AUTO_INCREMENT,
    user_id             BIGINT        NOT NULL,
    summary             TEXT          NULL COMMENT 'Tóm tắt bản thân / mục tiêu nghề nghiệp',
    work_experiences    JSON          NULL COMMENT 'Mảng JSON các WorkExperience',
    educations          JSON          NULL COMMENT 'Mảng JSON các Education',
    certifications      JSON          NULL COMMENT 'Mảng JSON các Certification',
    languages           VARCHAR(500)  NULL COMMENT 'Ngôn ngữ sử dụng được',
    github_url          VARCHAR(500)  NULL,
    portfolio_url       VARCHAR(500)  NULL,
    years_of_experience INT           NULL COMMENT 'Số năm kinh nghiệm tổng cộng',
    created_at          DATETIME      DEFAULT NOW(),
    updated_at          DATETIME      DEFAULT NOW() ON UPDATE NOW(),
    PRIMARY KEY (id),
    UNIQUE KEY uq_expert_cv_user (user_id),
    CONSTRAINT fk_expert_cv_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT 'CV do Expert tự nhập vào hệ thống — AI đọc để sàng lọc ứng viên';
