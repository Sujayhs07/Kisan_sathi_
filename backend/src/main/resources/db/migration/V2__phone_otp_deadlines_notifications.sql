-- =============================================================================
-- Flyway V2: Additive Upgrade for Phone+OTP Auth, Verified Deadlines,
-- Reminders, In-App Notifications, and Application Snapshots (PostgreSQL)
-- =============================================================================

-- 1. Extend users table for username + E.164 phone authentication
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(60) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Kolkata';
ALTER TABLE users ADD COLUMN IF NOT EXISTS sms_reminders_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(30) NOT NULL DEFAULT 'PENDING_VERIFICATION';
ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uk_users_username ON users (username);
CREATE UNIQUE INDEX IF NOT EXISTS uk_users_phone_number ON users (phone_number);

-- 2. Cryptographically hashed SMS OTP verifications
CREATE TABLE IF NOT EXISTS otp_verifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NULL,
    phone_number VARCHAR(20) NOT NULL,
    purpose VARCHAR(40) NOT NULL,
    otp_hash VARCHAR(128) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 5,
    resend_count INT NOT NULL DEFAULT 0,
    last_sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NULL,
    invalidated BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_otp_phone_purpose ON otp_verifications(phone_number, purpose);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_verifications(expires_at);

-- 3. Extend saved_schemes with snapshot, deadline & reminder settings
ALTER TABLE saved_schemes ADD COLUMN IF NOT EXISTS scheme_name_snapshot VARCHAR(255) NULL;
ALTER TABLE saved_schemes ADD COLUMN IF NOT EXISTS application_deadline DATE NULL;
ALTER TABLE saved_schemes ADD COLUMN IF NOT EXISTS deadline_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE saved_schemes ADD COLUMN IF NOT EXISTS custom_deadline DATE NULL;
ALTER TABLE saved_schemes ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE saved_schemes ADD COLUMN IF NOT EXISTS reminder_days_before VARCHAR(64) NOT NULL DEFAULT '30,7,3,1';
ALTER TABLE saved_schemes ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NULL;
ALTER TABLE saved_schemes ADD COLUMN IF NOT EXISTS reminder_acknowledged_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NULL;
ALTER TABLE saved_schemes ADD COLUMN IF NOT EXISTS reminder_dismissed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE saved_schemes ADD COLUMN IF NOT EXISTS user_notes TEXT NULL;

CREATE INDEX IF NOT EXISTS idx_saved_deadline ON saved_schemes (application_deadline, reminder_enabled);

-- 4. Extend applications with scheme/readiness/eligibility snapshots
ALTER TABLE applications ADD COLUMN IF NOT EXISTS scheme_name_snapshot VARCHAR(255) NULL;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS readiness_snapshot INT NULL;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS eligibility_snapshot VARCHAR(40) NULL;

-- 5. In-app notification center records
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    scheme_id VARCHAR(100) NULL,
    type VARCHAR(40) NOT NULL DEFAULT 'DEADLINE_REMINDER',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    urgency VARCHAR(20) NOT NULL DEFAULT 'GREEN',
    days_remaining INT NULL,
    channel VARCHAR(20) NOT NULL DEFAULT 'IN_APP',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notif_user_read ON notifications(user_id, is_read, created_at);

-- 6. Reminder dispatch deduplication log
CREATE TABLE IF NOT EXISTS reminder_dispatch_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    scheme_id VARCHAR(100) NOT NULL,
    threshold_days INT NOT NULL,
    target_deadline DATE NOT NULL,
    channel VARCHAR(20) NOT NULL DEFAULT 'IN_APP',
    dispatched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_reminder_dedup UNIQUE (user_id, scheme_id, threshold_days, target_deadline, channel),
    CONSTRAINT fk_rdl_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);
