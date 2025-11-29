-- =========================
-- Database Schema for College Management System
-- =========================

-- Connect to college-management database
\c "college-management"

-- =========================
-- Enums
-- =========================

CREATE TYPE user_type_enum AS ENUM ('admin', 'faculty', 'student', 'department');
CREATE TYPE leave_status_enum AS ENUM ('pending', 'approved', 'rejected');

-- =========================
-- Users & Authentication
-- =========================

CREATE TABLE admin (
    admin_id         SERIAL PRIMARY KEY,
    username         VARCHAR(100) UNIQUE NOT NULL,
    password_hash    VARCHAR(255) NOT NULL,
    role             VARCHAR(50) NOT NULL DEFAULT 'admin',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE faculty (
    faculty_id       SERIAL PRIMARY KEY,
    faculty_name     VARCHAR(150) NOT NULL,
    email            VARCHAR(150) UNIQUE NOT NULL,
    password_hash    VARCHAR(255) NOT NULL,
    department_id    INT,
    phone            VARCHAR(20),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student (
    student_id       SERIAL PRIMARY KEY,
    usn              VARCHAR(50) UNIQUE NOT NULL,
    name             VARCHAR(150) NOT NULL,
    email            VARCHAR(150) UNIQUE NOT NULL,
    password_hash    VARCHAR(255) NOT NULL,
    department_id    INT,
    address          TEXT,
    phone            VARCHAR(20),
    parent_phone     VARCHAR(20),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE department (
    department_id    SERIAL PRIMARY KEY,
    department_name  VARCHAR(150) UNIQUE NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE login_logs (
    log_id           SERIAL PRIMARY KEY,
    user_id          INT NOT NULL,
    user_type        user_type_enum NOT NULL,
    login_date       DATE NOT NULL DEFAULT CURRENT_DATE,
    login_timestamp  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address       VARCHAR(45),
    user_agent       TEXT
);

-- =========================
-- Academic Data
-- =========================

CREATE TABLE faculty_profile (
    profile_id       SERIAL PRIMARY KEY,
    faculty_id       INT REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    courses          JSONB,
    department       VARCHAR(150),
    time_details     JSONB,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE faculty_courses (
    course_id        SERIAL PRIMARY KEY,
    faculty_id       INT REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    course_name      VARCHAR(255),
    materials        JSONB,
    notifications    JSONB,
    semester         INT,
    academic_year    VARCHAR(20),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_marks (
    mark_id        SERIAL PRIMARY KEY,
    student_id     INT REFERENCES student(student_id) ON DELETE CASCADE,
    course_id      INT REFERENCES faculty_courses(course_id) ON DELETE CASCADE,
    marks_data     JSONB,
    performance_metrics JSONB,
    exam_type      VARCHAR(50),
    exam_date      DATE,
    uploaded_by    INT REFERENCES faculty(faculty_id) ON DELETE SET NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE marks_student (
    mark_id          SERIAL PRIMARY KEY,
    student_id       INT,
    usn              VARCHAR(50) NOT NULL,
    student_name     VARCHAR(150),
    semester         INT,
    subject_code     VARCHAR(50) NOT NULL,
    subject_name     VARCHAR(200),
    internal_marks   INT,
    external_marks   INT,
    total_marks      INT,
    result           VARCHAR(10),
    exam_type        VARCHAR(50) DEFAULT 'Semester Result',
    exam_date        DATE DEFAULT CURRENT_DATE,
    announced_date   DATE,
    uploaded_by      INT,
    academic_year    VARCHAR(20),
    marks_data       JSONB DEFAULT '{}',
    performance_metrics JSONB DEFAULT '{}',
    approval_status  VARCHAR(20) NOT NULL DEFAULT 'pending',
    approved_by      INT,
    approved_at      TIMESTAMPTZ,
    approval_remarks TEXT,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE student_certificates (
    certificate_id   SERIAL PRIMARY KEY,
    student_id       INT REFERENCES student(student_id) ON DELETE CASCADE,
    certificate_type VARCHAR(100) NOT NULL,
    competition      VARCHAR(255),
    internship       VARCHAR(255),
    workshop         VARCHAR(255),
    file_path        TEXT,
    approval_status  VARCHAR(20) NOT NULL DEFAULT 'pending',
    approved_by      INT,
    approved_role    user_type_enum,
    approved_at      TIMESTAMPTZ,
    approval_remarks TEXT,
    issued_by        VARCHAR(255),
    issue_date       DATE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- Activities & Requests
-- =========================

CREATE TABLE department_activities (
    event_id      SERIAL PRIMARY KEY,
    department_id INT REFERENCES department(department_id) ON DELETE CASCADE,
    event_title   VARCHAR(255) NOT NULL,
    event_details TEXT,
    event_date    DATE,
    timestamp     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by    INT REFERENCES faculty(faculty_id) ON DELETE SET NULL
);

CREATE TABLE department_circulars (
    circular_id     SERIAL PRIMARY KEY,
    department_id   INT REFERENCES department(department_id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    circular_details TEXT,
    file_path       TEXT,
    timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      INT REFERENCES faculty(faculty_id) ON DELETE SET NULL
);

CREATE TABLE student_projects (
    project_id   SERIAL PRIMARY KEY,
    student_id   INT REFERENCES student(student_id) ON DELETE CASCADE,
    project_name VARCHAR(255) NOT NULL,
    domain       VARCHAR(255),
    impact       TEXT,
    guide_id     INT REFERENCES faculty(faculty_id) ON DELETE SET NULL,
    start_date   DATE,
    end_date     DATE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_internships (
    internship_id SERIAL PRIMARY KEY,
    student_id    INT REFERENCES student(student_id) ON DELETE CASCADE,
    stack_data    JSONB,
    company       VARCHAR(255),
    start_date    DATE,
    end_date      DATE,
    stipend       NUMERIC(12,2),
    offer_letter_path TEXT,
    completion_certificate_path TEXT,
    approval_status  VARCHAR(20) NOT NULL DEFAULT 'pending',
    approved_by      INT,
    approved_role    user_type_enum,
    approved_at      TIMESTAMPTZ,
    approval_remarks TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_leave_requests (
    leave_id      SERIAL PRIMARY KEY,
    student_id    INT REFERENCES student(student_id) ON DELETE CASCADE,
    leave_details TEXT NOT NULL,
    from_date     DATE,
    to_date       DATE,
    status        leave_status_enum NOT NULL DEFAULT 'pending',
    reviewed_by   INT REFERENCES faculty(faculty_id) ON DELETE SET NULL,
    review_timestamp TIMESTAMPTZ,
    remarks       TEXT,
    timestamp     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_feedback (
    feedback_id   SERIAL PRIMARY KEY,
    student_id    INT REFERENCES student(student_id) ON DELETE CASCADE,
    feedback      TEXT NOT NULL,
    rating        INT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_attendance (
    attendance_id SERIAL PRIMARY KEY,
    student_id    INT REFERENCES student(student_id) ON DELETE CASCADE,
    faculty_id    INT REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    course_id    INT REFERENCES faculty_courses(course_id) ON DELETE CASCADE,
    date         DATE NOT NULL,
    status       VARCHAR(20) NOT NULL DEFAULT 'present',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, course_id, date)
);

-- =========================
-- Master Data
-- =========================

CREATE TABLE hostel_routes (
    route_id         SERIAL PRIMARY KEY,
    transport_details JSONB,
    route_name       VARCHAR(150),
    active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE fee_structure (
    fee_id           SERIAL PRIMARY KEY,
    structure_details JSONB,
    department_id    INT REFERENCES department(department_id) ON DELETE SET NULL,
    academic_year    VARCHAR(20),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- Audit & Notifications
-- =========================

CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id         INT NOT NULL,
    user_type       user_type_enum NOT NULL,
    title           VARCHAR(255) NOT NULL,
    message         TEXT,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
    audit_id    SERIAL PRIMARY KEY,
    user_id     INT,
    user_type   user_type_enum,
    action      VARCHAR(100) NOT NULL,
    entity      VARCHAR(100),
    entity_id   INT,
    details     JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- Admin Features
-- =========================

CREATE TABLE admin_features (
    feature_id        SERIAL PRIMARY KEY,
    feature_name      VARCHAR(200) NOT NULL,
    feature_type      VARCHAR(100) NOT NULL,
    description       TEXT,
    target_audience   VARCHAR(100),
    academic_year     VARCHAR(20),
    created_by        INT REFERENCES admin(admin_id) ON DELETE SET NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- Chat History
-- =========================

CREATE TABLE chat_history (
    chat_id       SERIAL PRIMARY KEY,
    user_id       INT NOT NULL,
    user_type     VARCHAR(20) NOT NULL,
    user_query    TEXT NOT NULL,
    generated_sql TEXT,
    bot_response  TEXT,
    result_data   JSONB,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- Indexes
-- =========================

CREATE INDEX idx_student_department ON student(department_id);
CREATE INDEX idx_faculty_department ON faculty(department_id);
CREATE INDEX idx_login_logs_user ON login_logs(user_id, user_type);
CREATE INDEX idx_student_marks_student_course ON student_marks(student_id, course_id);
CREATE INDEX idx_student_leave_status ON student_leave_requests(status);
CREATE INDEX idx_notifications_user ON notifications(user_id, user_type, is_read);
CREATE INDEX idx_marks_student_status ON marks_student(approval_status);
CREATE INDEX idx_internships_status ON student_internships(approval_status);
CREATE INDEX idx_certificates_status ON student_certificates(approval_status);
CREATE INDEX idx_marks_student_usn ON marks_student(usn);
CREATE INDEX idx_marks_student_semester ON marks_student(semester);
CREATE INDEX idx_marks_student_subject_code ON marks_student(subject_code);
CREATE INDEX idx_marks_student_approval ON marks_student(approval_status);
CREATE INDEX idx_chat_history_user ON chat_history(user_id, user_type, created_at);

-- =========================
-- Minimal migration helpers
-- =========================

ALTER TABLE marks_student
    ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) NOT NULL DEFAULT 'pending';
ALTER TABLE marks_student
    ADD COLUMN IF NOT EXISTS approved_by INT;
ALTER TABLE marks_student
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE marks_student
    ADD COLUMN IF NOT EXISTS approval_remarks TEXT;

ALTER TABLE student_internships
    ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) NOT NULL DEFAULT 'pending';
ALTER TABLE student_internships
    ADD COLUMN IF NOT EXISTS approved_role user_type_enum;
ALTER TABLE student_internships
    ADD COLUMN IF NOT EXISTS approved_by INT;

ALTER TABLE student_certificates
    ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) NOT NULL DEFAULT 'pending';
ALTER TABLE student_certificates
    ADD COLUMN IF NOT EXISTS approved_role user_type_enum;
ALTER TABLE student_certificates
    ADD COLUMN IF NOT EXISTS approved_by INT;

CREATE TABLE IF NOT EXISTS admin_features (
    feature_id        SERIAL PRIMARY KEY,
    feature_name      VARCHAR(200) NOT NULL,
    feature_type      VARCHAR(100) NOT NULL,
    description       TEXT,
    target_audience   VARCHAR(100),
    academic_year     VARCHAR(20),
    created_by        INT REFERENCES admin(admin_id) ON DELETE SET NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_history (
    chat_id       SERIAL PRIMARY KEY,
    user_id       INT NOT NULL,
    user_type     VARCHAR(20) NOT NULL,
    user_query    TEXT NOT NULL,
    generated_sql TEXT,
    bot_response  TEXT,
    result_data   JSONB,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);
