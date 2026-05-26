-- ============================================================
-- V1__init_schema.sql — AI Freelance Marketplace
-- Full schema with 18 tables in FK dependency order
-- ============================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ─── 1. skills ─────────────────────────────────────────────
CREATE TABLE skills (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    category   VARCHAR(100) NOT NULL,
    name       VARCHAR(100) NOT NULL,
    created_at DATETIME     DEFAULT NOW(),
    PRIMARY KEY (id),
    UNIQUE KEY uq_skill_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 2. users ──────────────────────────────────────────────
CREATE TABLE users (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    email          VARCHAR(255) NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    role           ENUM('CLIENT','EXPERT','ADMIN') NOT NULL,
    status         ENUM('ACTIVE','SUSPENDED','PENDING') DEFAULT 'PENDING',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at     DATETIME DEFAULT NOW(),
    updated_at     DATETIME DEFAULT NOW() ON UPDATE NOW(),
    PRIMARY KEY (id),
    UNIQUE KEY uq_user_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 3. user_profiles ──────────────────────────────────────
CREATE TABLE user_profiles (
    id                BIGINT        NOT NULL AUTO_INCREMENT,
    user_id           BIGINT        NOT NULL,
    full_name         VARCHAR(255),
    bio               TEXT,
    avatar_url        VARCHAR(500),
    portfolio_url     VARCHAR(500),
    hourly_rate       DECIMAL(10,2),
    rating            DECIMAL(3,2)  DEFAULT 0.00,
    total_reviews     INT           DEFAULT 0,
    completion_rate   DECIMAL(5,2)  DEFAULT 0.00,
    is_available      BOOLEAN       DEFAULT TRUE,
    skills_embedding  JSON          COMMENT 'Vector embedding (1536 dims) for AI recommendation',
    created_at        DATETIME,
    updated_at        DATETIME,
    PRIMARY KEY (id),
    UNIQUE KEY uq_profile_user (user_id),
    CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 4. user_skills ────────────────────────────────────────
CREATE TABLE user_skills (
    user_id  BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, skill_id),
    CONSTRAINT fk_us_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    CONSTRAINT fk_us_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 5. jobs ───────────────────────────────────────────────
CREATE TABLE jobs (
    id           BIGINT        NOT NULL AUTO_INCREMENT,
    client_id    BIGINT        NOT NULL,
    title        VARCHAR(255)  NOT NULL,
    description  TEXT          NOT NULL,
    budget_min   DECIMAL(15,2),
    budget_max   DECIMAL(15,2),
    deadline     DATE,
    status       ENUM('DRAFT','OPEN','IN_PROGRESS','COMPLETED','CANCELLED') DEFAULT 'DRAFT',
    ai_enhanced  BOOLEAN       DEFAULT FALSE,
    view_count   INT           DEFAULT 0,
    created_at   DATETIME,
    updated_at   DATETIME,
    PRIMARY KEY (id),
    CONSTRAINT fk_job_client FOREIGN KEY (client_id) REFERENCES users(id),
    FULLTEXT INDEX idx_jobs_search (title, description),
    INDEX idx_jobs_client_id (client_id),
    INDEX idx_jobs_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 6. job_skills ─────────────────────────────────────────
CREATE TABLE job_skills (
    job_id   BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    PRIMARY KEY (job_id, skill_id),
    CONSTRAINT fk_js_job   FOREIGN KEY (job_id)   REFERENCES jobs(id)   ON DELETE CASCADE,
    CONSTRAINT fk_js_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 7. services ───────────────────────────────────────────
CREATE TABLE services (
    id               BIGINT        NOT NULL AUTO_INCREMENT,
    expert_id        BIGINT        NOT NULL,
    title            VARCHAR(255)  NOT NULL,
    description      TEXT,
    price            DECIMAL(15,2) NOT NULL,
    delivery_days    INT           NOT NULL,
    status           ENUM('ACTIVE','INACTIVE','PENDING_REVIEW') DEFAULT 'PENDING_REVIEW',
    tags             JSON,
    rating           DECIMAL(3,2)  DEFAULT 0.00,
    order_count      INT           DEFAULT 0,
    skills_embedding JSON,
    created_at       DATETIME,
    updated_at       DATETIME,
    PRIMARY KEY (id),
    CONSTRAINT fk_service_expert FOREIGN KEY (expert_id) REFERENCES users(id),
    INDEX idx_services_expert (expert_id),
    INDEX idx_services_status (status),
    FULLTEXT INDEX idx_services_search (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 8. proposals ──────────────────────────────────────────
CREATE TABLE proposals (
    id            BIGINT        NOT NULL AUTO_INCREMENT,
    job_id        BIGINT        NOT NULL,
    expert_id     BIGINT        NOT NULL,
    price         DECIMAL(15,2) NOT NULL,
    timeline_days INT           NOT NULL,
    cover_letter  TEXT,
    status        ENUM('PENDING','ACCEPTED','REJECTED','WITHDRAWN') DEFAULT 'PENDING',
    created_at    DATETIME,
    updated_at    DATETIME,
    PRIMARY KEY (id),
    UNIQUE KEY uq_proposal (job_id, expert_id),
    CONSTRAINT fk_proposal_job    FOREIGN KEY (job_id)    REFERENCES jobs(id),
    CONSTRAINT fk_proposal_expert FOREIGN KEY (expert_id) REFERENCES users(id),
    INDEX idx_proposals_job_status (job_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 9. contracts ──────────────────────────────────────────
CREATE TABLE contracts (
    id           BIGINT        NOT NULL AUTO_INCREMENT,
    job_id       BIGINT        NOT NULL,
    proposal_id  BIGINT        NOT NULL,
    client_id    BIGINT        NOT NULL,
    expert_id    BIGINT        NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    status       ENUM('ACTIVE','COMPLETED','DISPUTED','CANCELLED') DEFAULT 'ACTIVE',
    started_at   DATETIME,
    completed_at DATETIME,
    created_at   DATETIME,
    PRIMARY KEY (id),
    UNIQUE KEY uq_contract_proposal (proposal_id),
    CONSTRAINT fk_contract_job      FOREIGN KEY (job_id)      REFERENCES jobs(id),
    CONSTRAINT fk_contract_proposal FOREIGN KEY (proposal_id) REFERENCES proposals(id),
    CONSTRAINT fk_contract_client   FOREIGN KEY (client_id)   REFERENCES users(id),
    CONSTRAINT fk_contract_expert   FOREIGN KEY (expert_id)   REFERENCES users(id),
    INDEX idx_contracts_client (client_id, status),
    INDEX idx_contracts_expert (expert_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 10. milestones ────────────────────────────────────────
CREATE TABLE milestones (
    id               BIGINT        NOT NULL AUTO_INCREMENT,
    contract_id      BIGINT        NOT NULL,
    name             VARCHAR(255)  NOT NULL,
    description      TEXT,
    amount           DECIMAL(15,2) NOT NULL,
    due_date         DATE,
    status           ENUM('PENDING','IN_PROGRESS','SUBMITTED','APPROVED','REJECTED') DEFAULT 'PENDING',
    deliverable_url  VARCHAR(500),
    deliverable_note TEXT,
    order_index      INT           DEFAULT 0,
    created_at       DATETIME,
    updated_at       DATETIME,
    PRIMARY KEY (id),
    CONSTRAINT fk_milestone_contract FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    INDEX idx_milestones_contract (contract_id, order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 11. escrow_accounts ───────────────────────────────────
CREATE TABLE escrow_accounts (
    id              BIGINT        NOT NULL AUTO_INCREMENT,
    user_id         BIGINT        NOT NULL,
    balance         DECIMAL(15,2) DEFAULT 0.00,
    locked_amount   DECIMAL(15,2) DEFAULT 0.00,
    total_deposited DECIMAL(15,2) DEFAULT 0.00,
    total_released  DECIMAL(15,2) DEFAULT 0.00,
    currency        CHAR(3)       DEFAULT 'USD',
    updated_at      DATETIME,
    PRIMARY KEY (id),
    UNIQUE KEY uq_escrow_user (user_id),
    CONSTRAINT fk_escrow_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 12. transactions ──────────────────────────────────────
CREATE TABLE transactions (
    id           BIGINT        NOT NULL AUTO_INCREMENT,
    user_id      BIGINT        NOT NULL,
    contract_id  BIGINT,
    milestone_id BIGINT,
    type         ENUM('DEPOSIT','ESCROW_LOCK','RELEASE','REFUND','FEE','WITHDRAW') NOT NULL,
    amount       DECIMAL(15,2) NOT NULL,
    currency     CHAR(3)       DEFAULT 'USD',
    status       ENUM('PENDING','SUCCESS','FAILED') DEFAULT 'PENDING',
    ref_code     VARCHAR(100),
    note         TEXT,
    created_at   DATETIME,
    PRIMARY KEY (id),
    CONSTRAINT fk_tx_user     FOREIGN KEY (user_id)      REFERENCES users(id),
    CONSTRAINT fk_tx_contract FOREIGN KEY (contract_id)  REFERENCES contracts(id),
    CONSTRAINT fk_tx_milestone FOREIGN KEY (milestone_id) REFERENCES milestones(id),
    INDEX idx_transactions_user_created (user_id, created_at DESC),
    INDEX idx_transactions_ref_code (ref_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 13. messages ──────────────────────────────────────────
CREATE TABLE messages (
    id          BIGINT   NOT NULL AUTO_INCREMENT,
    contract_id BIGINT   NOT NULL,
    sender_id   BIGINT   NOT NULL,
    content     TEXT     NOT NULL,
    is_read     BOOLEAN  DEFAULT FALSE,
    created_at  DATETIME,
    PRIMARY KEY (id),
    CONSTRAINT fk_msg_contract FOREIGN KEY (contract_id) REFERENCES contracts(id),
    CONSTRAINT fk_msg_sender   FOREIGN KEY (sender_id)   REFERENCES users(id),
    INDEX idx_messages_contract_created (contract_id, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 14. reviews ───────────────────────────────────────────
CREATE TABLE reviews (
    id          BIGINT  NOT NULL AUTO_INCREMENT,
    contract_id BIGINT  NOT NULL,
    reviewer_id BIGINT  NOT NULL,
    reviewee_id BIGINT  NOT NULL,
    rating      TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  DATETIME,
    PRIMARY KEY (id),
    UNIQUE KEY uq_review_contract_reviewer (contract_id, reviewer_id),
    CONSTRAINT fk_review_contract  FOREIGN KEY (contract_id)  REFERENCES contracts(id),
    CONSTRAINT fk_review_reviewer  FOREIGN KEY (reviewer_id)  REFERENCES users(id),
    CONSTRAINT fk_review_reviewee  FOREIGN KEY (reviewee_id)  REFERENCES users(id),
    INDEX idx_reviews_reviewee (reviewee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 15. disputes ──────────────────────────────────────────
CREATE TABLE disputes (
    id          BIGINT NOT NULL AUTO_INCREMENT,
    contract_id BIGINT NOT NULL,
    opened_by   BIGINT NOT NULL,
    reason      TEXT   NOT NULL,
    status      ENUM('OPEN','INVESTIGATING','RESOLVED') DEFAULT 'OPEN',
    admin_note  TEXT,
    resolution  ENUM('REFUND_CLIENT','RELEASE_EXPERT','PARTIAL'),
    resolved_at DATETIME,
    created_at  DATETIME,
    PRIMARY KEY (id),
    CONSTRAINT fk_dispute_contract  FOREIGN KEY (contract_id) REFERENCES contracts(id),
    CONSTRAINT fk_dispute_opener    FOREIGN KEY (opened_by)   REFERENCES users(id),
    INDEX idx_disputes_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 16. notifications ─────────────────────────────────────
CREATE TABLE notifications (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    user_id      BIGINT       NOT NULL,
    type         VARCHAR(50)  NOT NULL,
    title        VARCHAR(255),
    content      TEXT,
    is_read      BOOLEAN      DEFAULT FALSE,
    reference_id BIGINT COMMENT 'contract_id, job_id, etc.',
    created_at   DATETIME,
    PRIMARY KEY (id),
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notifications_user_read (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 17. audit_logs ────────────────────────────────────────
CREATE TABLE audit_logs (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    user_id     BIGINT,
    action      VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id   BIGINT,
    details     JSON,
    ip_address  VARCHAR(45),
    created_at  DATETIME,
    PRIMARY KEY (id),
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_entity (entity_type, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 18. refresh_tokens ────────────────────────────────────
CREATE TABLE refresh_tokens (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    user_id    BIGINT       NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME     NOT NULL,
    revoked    BOOLEAN      DEFAULT FALSE,
    created_at DATETIME,
    PRIMARY KEY (id),
    UNIQUE KEY uq_token_hash (token_hash),
    CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_rt_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 19. ai_usage_logs ─────────────────────────────────────
CREATE TABLE ai_usage_logs (
    id          BIGINT        NOT NULL AUTO_INCREMENT,
    user_id     BIGINT,
    module      VARCHAR(50)   NOT NULL COMMENT 'JOB_ASSISTANT, SERVICE_GENERATOR, RECOMMENDATION',
    tokens_used INT           DEFAULT 0,
    cost_usd    DECIMAL(10,6) DEFAULT 0.000000,
    created_at  DATETIME,
    PRIMARY KEY (id),
    INDEX idx_ai_usage_user (user_id),
    INDEX idx_ai_usage_module (module)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
