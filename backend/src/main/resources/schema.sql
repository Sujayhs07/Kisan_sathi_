-- =============================================================================
-- KISAN SCHEME SAATHI — POSTGRESQL 14+ AUTHORITATIVE ENTERPRISE SCHEMA
-- Phone (+91 E.164) + Username + SMS OTP Auth, Saved Schemes & Deadlines,
-- Reminders, In-App Notifications, and Farmer Application Snapshots.
-- =============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(60) UNIQUE,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'kn',
    timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Kolkata',
    sms_reminders_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    account_status VARCHAR(30) NOT NULL DEFAULT 'PENDING_VERIFICATION',
    terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    terms_accepted_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NULL,
    district VARCHAR(100) NULL,
    phone_number VARCHAR(20) UNIQUE NULL,
    phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_district ON users(district);

-- 2. Email Verification Tokens (Legacy Support)
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_evt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_evt_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_evt_user_id ON email_verification_tokens(user_id);

-- 3. Cryptographically Hashed SMS OTP Verifications
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

-- 4. Saved Schemes & Deadline Tracker
CREATE TABLE IF NOT EXISTS saved_schemes (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    scheme_id VARCHAR(100) NOT NULL,
    scheme_name_snapshot VARCHAR(255) NULL,
    application_deadline DATE NULL,
    deadline_verified BOOLEAN NOT NULL DEFAULT FALSE,
    custom_deadline DATE NULL,
    reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    reminder_days_before VARCHAR(64) NOT NULL DEFAULT '30,7,3,1',
    last_reminder_sent_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NULL,
    reminder_acknowledged_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NULL,
    reminder_dismissed BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT NULL,
    user_notes TEXT NULL,
    saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_scheme UNIQUE (user_id, scheme_id),
    CONSTRAINT fk_saved_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_saved_schemes_user ON saved_schemes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_deadline ON saved_schemes(application_deadline, reminder_enabled);

-- 5. Farmer Scheme Applications
CREATE TABLE IF NOT EXISTS applications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    scheme_id VARCHAR(100) NOT NULL,
    scheme_name_snapshot VARCHAR(255) NULL,
    readiness_snapshot INT NULL,
    eligibility_snapshot VARCHAR(40) NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'INTERESTED',
    application_date TIMESTAMP WITH TIME ZONE NULL DEFAULT NULL,
    applied_through_portal VARCHAR(255) NULL,
    acknowledgement_number VARCHAR(150) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_applications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- 6. Application Timeline Events
CREATE TABLE IF NOT EXISTS application_timeline_events (
    id VARCHAR(36) PRIMARY KEY,
    application_id VARCHAR(36) NOT NULL,
    status VARCHAR(30) NOT NULL,
    note TEXT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_timeline_app FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_timeline_application ON application_timeline_events(application_id);

-- 7. In-App Notification Center
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

-- 8. Reminder Dispatch Deduplication Logs
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

-- Automatic Timestamp Update Function & Triggers for PostgreSQL
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_applications_updated_at ON applications;
CREATE TRIGGER trigger_applications_updated_at
BEFORE UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Seed Demo Verified Farmer Account (basavaraj_patil / +919845012345 / Kisan@123)
INSERT INTO users (
    id, username, email, password_hash, full_name, preferred_language,
    timezone, sms_reminders_enabled, account_status, terms_accepted, terms_accepted_at,
    district, phone_number, phone_verified, email_verified, created_at, updated_at
)
VALUES (
    'usr_seed_karnataka_demo',
    'basavaraj_patil',
    NULL,
    '$2a$12$l4vOQh5qY6y9nF9zG0L9J.1E8dV4l5k1p3r5t7v9x1z3b5d7f9h1j',
    'Basavaraj Patil',
    'kn',
    'Asia/Kolkata',
    FALSE,
    'ACTIVE',
    TRUE,
    CURRENT_TIMESTAMP,
    'Dharwad',
    '+919845012345',
    TRUE,
    FALSE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;
