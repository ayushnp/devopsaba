--
-- PostgreSQL database dump
--

\restrict AEH2gqRqjWvKDXXGZcO3gLDzaU2r36G6ETyW9GUjIFrydvMWLG13HzqT8TelgJ0

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: leave_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.leave_status_enum AS ENUM (
    'pending',
    'approved',
    'rejected'
);


--
-- Name: user_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_type_enum AS ENUM (
    'admin',
    'faculty',
    'student',
    'department'
);


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin (
    admin_id integer NOT NULL,
    username character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'admin'::character varying NOT NULL,
    foreign_key_info text,
    login_timestamp timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: admin_admin_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_admin_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admin_admin_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_admin_id_seq OWNED BY public.admin.admin_id;


--
-- Name: admin_features; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_features (
    feature_id integer NOT NULL,
    feature_name character varying(200) NOT NULL,
    feature_type character varying(100) NOT NULL,
    description text,
    target_audience character varying(100),
    academic_year character varying(20),
    created_by integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: admin_features_feature_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_features_feature_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admin_features_feature_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_features_feature_id_seq OWNED BY public.admin_features.feature_id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    audit_id integer NOT NULL,
    user_id integer,
    user_type public.user_type_enum,
    action character varying(100) NOT NULL,
    entity character varying(100),
    entity_id integer,
    details jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: audit_logs_audit_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_logs_audit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_logs_audit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_logs_audit_id_seq OWNED BY public.audit_logs.audit_id;


--
-- Name: chat_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_history (
    chat_id integer NOT NULL,
    user_id integer NOT NULL,
    user_type character varying(20) NOT NULL,
    user_query text NOT NULL,
    generated_sql text,
    bot_response text,
    result_data jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: chat_history_chat_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chat_history_chat_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chat_history_chat_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.chat_history_chat_id_seq OWNED BY public.chat_history.chat_id;


--
-- Name: department; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.department (
    department_id integer NOT NULL,
    department_name character varying(150) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: department_activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.department_activities (
    event_id integer NOT NULL,
    department_id integer,
    event_title character varying(255) NOT NULL,
    event_details text,
    event_date date,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    created_by integer
);


--
-- Name: department_activities_event_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.department_activities_event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: department_activities_event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.department_activities_event_id_seq OWNED BY public.department_activities.event_id;


--
-- Name: department_circulars; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.department_circulars (
    circular_id integer NOT NULL,
    department_id integer,
    title character varying(255) NOT NULL,
    circular_details text,
    file_path text,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    created_by integer
);


--
-- Name: department_circulars_circular_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.department_circulars_circular_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: department_circulars_circular_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.department_circulars_circular_id_seq OWNED BY public.department_circulars.circular_id;


--
-- Name: department_department_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.department_department_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: department_department_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.department_department_id_seq OWNED BY public.department.department_id;


--
-- Name: faculty; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.faculty (
    faculty_id integer NOT NULL,
    faculty_name character varying(150) NOT NULL,
    email character varying(150),
    password_hash character varying(255),
    department_id integer,
    login_info jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: faculty_courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.faculty_courses (
    course_id integer NOT NULL,
    faculty_id integer,
    course_code character varying(50) NOT NULL,
    course_name character varying(200) NOT NULL,
    materials jsonb,
    notifications jsonb,
    semester integer,
    academic_year character varying(20),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: faculty_courses_course_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.faculty_courses_course_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: faculty_courses_course_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.faculty_courses_course_id_seq OWNED BY public.faculty_courses.course_id;


--
-- Name: faculty_faculty_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.faculty_faculty_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: faculty_faculty_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.faculty_faculty_id_seq OWNED BY public.faculty.faculty_id;


--
-- Name: faculty_profile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.faculty_profile (
    faculty_id integer NOT NULL,
    courses jsonb,
    department_id integer,
    time_details jsonb,
    bio text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: fee_structure; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fee_structure (
    fee_id integer NOT NULL,
    structure_details jsonb,
    department_id integer,
    academic_year character varying(20),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: fee_structure_fee_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fee_structure_fee_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fee_structure_fee_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fee_structure_fee_id_seq OWNED BY public.fee_structure.fee_id;


--
-- Name: hostel_routes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hostel_routes (
    route_id integer NOT NULL,
    transport_details jsonb,
    route_name character varying(150),
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: hostel_routes_route_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.hostel_routes_route_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hostel_routes_route_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.hostel_routes_route_id_seq OWNED BY public.hostel_routes.route_id;


--
-- Name: login_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.login_logs (
    log_id integer NOT NULL,
    user_id integer NOT NULL,
    user_type public.user_type_enum NOT NULL,
    login_date date DEFAULT CURRENT_DATE NOT NULL,
    login_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    ip_address inet,
    user_agent text
);


--
-- Name: login_logs_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.login_logs_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: login_logs_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.login_logs_log_id_seq OWNED BY public.login_logs.log_id;


--
-- Name: marks_student; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.marks_student (
    mark_id integer NOT NULL,
    student_id integer,
    usn character varying(50) NOT NULL,
    student_name character varying(150),
    semester integer,
    subject_code character varying(50) NOT NULL,
    subject_name character varying(200),
    internal_marks integer,
    external_marks integer,
    total_marks integer,
    result character varying(10),
    exam_type character varying(50) DEFAULT 'Semester Result'::character varying,
    exam_date date DEFAULT CURRENT_DATE,
    announced_date date,
    uploaded_by integer,
    academic_year character varying(20),
    marks_data jsonb DEFAULT '{}'::jsonb,
    performance_metrics jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    approval_status character varying(20) DEFAULT 'pending'::character varying,
    approved_by integer,
    approved_at timestamp with time zone,
    approval_remarks text
);


--
-- Name: marks_student_mark_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.marks_student_mark_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: marks_student_mark_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.marks_student_mark_id_seq OWNED BY public.marks_student.mark_id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    notification_id integer NOT NULL,
    user_id integer NOT NULL,
    user_type public.user_type_enum NOT NULL,
    title character varying(255) NOT NULL,
    message text,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: notifications_notification_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_notification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_notification_id_seq OWNED BY public.notifications.notification_id;


--
-- Name: student; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student (
    student_id integer NOT NULL,
    usn character varying(50) NOT NULL,
    name character varying(150) NOT NULL,
    address text,
    phone character varying(20),
    parent_phone character varying(20),
    email character varying(150),
    password_hash character varying(255),
    department_id integer,
    batch_year integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: student_attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_attendance (
    attendance_id integer NOT NULL,
    student_id integer,
    faculty_id integer,
    course_id integer,
    date date NOT NULL,
    status character varying(20) DEFAULT 'present'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: student_attendance_attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_attendance_attendance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_attendance_attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_attendance_attendance_id_seq OWNED BY public.student_attendance.attendance_id;


--
-- Name: student_certificates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_certificates (
    certificate_id integer NOT NULL,
    student_id integer,
    certificate_type character varying(100) NOT NULL,
    competition character varying(255),
    internship character varying(255),
    workshop character varying(255),
    file_path text,
    issued_by character varying(255),
    issue_date date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    approval_status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    approved_role public.user_type_enum,
    approved_by integer
);


--
-- Name: student_certificates_certificate_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_certificates_certificate_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_certificates_certificate_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_certificates_certificate_id_seq OWNED BY public.student_certificates.certificate_id;


--
-- Name: student_feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_feedback (
    feedback_id integer NOT NULL,
    student_id integer,
    feedback text NOT NULL,
    rating integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: student_feedback_feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_feedback_feedback_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_feedback_feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_feedback_feedback_id_seq OWNED BY public.student_feedback.feedback_id;


--
-- Name: student_internships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_internships (
    internship_id integer NOT NULL,
    student_id integer,
    stack_data jsonb,
    company character varying(255),
    start_date date,
    end_date date,
    stipend numeric(12,2),
    offer_letter_path text,
    completion_certificate_path text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    approval_status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    approved_role public.user_type_enum,
    approved_by integer
);


--
-- Name: student_internships_internship_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_internships_internship_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_internships_internship_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_internships_internship_id_seq OWNED BY public.student_internships.internship_id;


--
-- Name: student_leave_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_leave_requests (
    leave_id integer NOT NULL,
    student_id integer,
    leave_details text NOT NULL,
    from_date date,
    to_date date,
    status public.leave_status_enum DEFAULT 'pending'::public.leave_status_enum NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    reviewed_by integer,
    review_timestamp timestamp with time zone,
    remarks text
);


--
-- Name: student_leave_requests_leave_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_leave_requests_leave_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_leave_requests_leave_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_leave_requests_leave_id_seq OWNED BY public.student_leave_requests.leave_id;


--
-- Name: student_mark; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_mark (
);


--
-- Name: student_marks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_marks (
    mark_id integer NOT NULL,
    student_id integer,
    usn character varying(50) NOT NULL,
    student_name character varying(150),
    semester integer,
    subject_code character varying(50) NOT NULL,
    subject_name character varying(200) NOT NULL,
    internal_marks integer,
    external_marks integer,
    total_marks integer,
    result character varying(10),
    grade character varying(5),
    grade_points numeric(3,2),
    exam_type character varying(50) DEFAULT 'Semester Result'::character varying,
    exam_date date,
    announced_date date,
    course_id integer,
    uploaded_by integer,
    academic_year character varying(20),
    marks_data jsonb DEFAULT '{}'::jsonb,
    performance_metrics jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT student_marks_external_marks_check CHECK (((external_marks >= 0) AND (external_marks <= 100))),
    CONSTRAINT student_marks_internal_marks_check CHECK (((internal_marks >= 0) AND (internal_marks <= 100))),
    CONSTRAINT student_marks_result_check CHECK (((result)::text = ANY ((ARRAY['P'::character varying, 'F'::character varying, 'A'::character varying, 'W'::character varying, 'X'::character varying, 'NE'::character varying])::text[]))),
    CONSTRAINT student_marks_total_marks_check CHECK (((total_marks >= 0) AND (total_marks <= 200)))
);


--
-- Name: student_marks_mark_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_marks_mark_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_marks_mark_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_marks_mark_id_seq OWNED BY public.student_marks.mark_id;


--
-- Name: student_projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_projects (
    project_id integer NOT NULL,
    student_id integer,
    project_name character varying(255) NOT NULL,
    domain character varying(255),
    impact text,
    guide_id integer,
    start_date date,
    end_date date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: student_projects_project_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_projects_project_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_projects_project_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_projects_project_id_seq OWNED BY public.student_projects.project_id;


--
-- Name: student_student_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_student_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_student_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_student_id_seq OWNED BY public.student.student_id;


--
-- Name: admin admin_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin ALTER COLUMN admin_id SET DEFAULT nextval('public.admin_admin_id_seq'::regclass);


--
-- Name: admin_features feature_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_features ALTER COLUMN feature_id SET DEFAULT nextval('public.admin_features_feature_id_seq'::regclass);


--
-- Name: audit_logs audit_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN audit_id SET DEFAULT nextval('public.audit_logs_audit_id_seq'::regclass);


--
-- Name: chat_history chat_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_history ALTER COLUMN chat_id SET DEFAULT nextval('public.chat_history_chat_id_seq'::regclass);


--
-- Name: department department_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department ALTER COLUMN department_id SET DEFAULT nextval('public.department_department_id_seq'::regclass);


--
-- Name: department_activities event_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_activities ALTER COLUMN event_id SET DEFAULT nextval('public.department_activities_event_id_seq'::regclass);


--
-- Name: department_circulars circular_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_circulars ALTER COLUMN circular_id SET DEFAULT nextval('public.department_circulars_circular_id_seq'::regclass);


--
-- Name: faculty faculty_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faculty ALTER COLUMN faculty_id SET DEFAULT nextval('public.faculty_faculty_id_seq'::regclass);


--
-- Name: faculty_courses course_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faculty_courses ALTER COLUMN course_id SET DEFAULT nextval('public.faculty_courses_course_id_seq'::regclass);


--
-- Name: fee_structure fee_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_structure ALTER COLUMN fee_id SET DEFAULT nextval('public.fee_structure_fee_id_seq'::regclass);


--
-- Name: hostel_routes route_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hostel_routes ALTER COLUMN route_id SET DEFAULT nextval('public.hostel_routes_route_id_seq'::regclass);


--
-- Name: login_logs log_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.login_logs ALTER COLUMN log_id SET DEFAULT nextval('public.login_logs_log_id_seq'::regclass);


--
-- Name: marks_student mark_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marks_student ALTER COLUMN mark_id SET DEFAULT nextval('public.marks_student_mark_id_seq'::regclass);


--
-- Name: notifications notification_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN notification_id SET DEFAULT nextval('public.notifications_notification_id_seq'::regclass);


--
-- Name: student student_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student ALTER COLUMN student_id SET DEFAULT nextval('public.student_student_id_seq'::regclass);


--
-- Name: student_attendance attendance_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_attendance ALTER COLUMN attendance_id SET DEFAULT nextval('public.student_attendance_attendance_id_seq'::regclass);


--
-- Name: student_certificates certificate_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_certificates ALTER COLUMN certificate_id SET DEFAULT nextval('public.student_certificates_certificate_id_seq'::regclass);


--
-- Name: student_feedback feedback_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_feedback ALTER COLUMN feedback_id SET DEFAULT nextval('public.student_feedback_feedback_id_seq'::regclass);


--
-- Name: student_internships internship_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_internships ALTER COLUMN internship_id SET DEFAULT nextval('public.student_internships_internship_id_seq'::regclass);


--
-- Name: student_leave_requests leave_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_leave_requests ALTER COLUMN leave_id SET DEFAULT nextval('public.student_leave_requests_leave_id_seq'::regclass);


--
-- Name: student_marks mark_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_marks ALTER COLUMN mark_id SET DEFAULT nextval('public.student_marks_mark_id_seq'::regclass);


--
-- Name: student_projects project_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_projects ALTER COLUMN project_id SET DEFAULT nextval('public.student_projects_project_id_seq'::regclass);


--
-- Data for Name: admin; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin (admin_id, username, password_hash, role, foreign_key_info, login_timestamp, created_at, updated_at) FROM stdin;
1	dep1@gmail.com	$2a$10$L.5wFLLuLfy9fRkswOD3HePQKgZZ0fxcD2yKu8FnhL8H6DTP1SmNm	department	\N	\N	2025-11-21 14:50:21.254318+05:30	2025-11-21 14:50:21.254318+05:30
2	admin1@gmail.com	$2a$10$EseriBoGHMvECLfEvEp0tuR/H3cVhl5J.vMQgpC/YXLvN2N4QAGrC	admin	\N	\N	2025-11-21 14:52:07.174892+05:30	2025-11-21 14:52:07.174892+05:30
3	dep2@gmail.com	$2a$10$JLD2d2uGyEbf79/AoikPbOohnFi8SI7IDSCpsqdC/adjoJ4aRxd6i	department	\N	\N	2025-11-22 00:38:41.470174+05:30	2025-11-22 00:38:41.470174+05:30
\.


--
-- Data for Name: admin_features; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_features (feature_id, feature_name, feature_type, description, target_audience, academic_year, created_by, created_at, updated_at) FROM stdin;
1	bhg	jhg		student	78	2	2025-11-22 00:42:43.547428+05:30	2025-11-22 00:42:43.547428+05:30
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (audit_id, user_id, user_type, action, entity, entity_id, details, created_at) FROM stdin;
1	1	faculty	attendance_update	attendance	\N	{"records": [{"status": "present", "student_id": ""}]}	2025-11-21 22:20:46.18469+05:30
2	1	faculty	attendance_update	attendance	\N	{"records": [{"status": "present", "student_id": "1"}]}	2025-11-21 22:20:50.413918+05:30
3	1	faculty	attendance_update	attendance	\N	{"records": [{"status": "present", "student_id": "1"}]}	2025-11-21 22:20:51.262601+05:30
4	1	faculty	attendance_update	attendance	\N	{"records": [{"status": "present", "student_id": "1"}]}	2025-11-21 22:20:52.413076+05:30
5	1	faculty	attendance_update	attendance	\N	{"records": [{"status": "present", "student_id": "1"}]}	2025-11-21 22:20:52.635997+05:30
6	1	faculty	attendance_update	attendance	\N	{"records": [{"status": "present", "student_id": "1aa"}, {"status": "present", "student_id": "567"}]}	2025-11-21 22:22:38.921323+05:30
\.


--
-- Data for Name: chat_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_history (chat_id, user_id, user_type, user_query, generated_sql, bot_response, result_data, created_at) FROM stdin;
1	1	student	hey	\N	Error: Forbidden SQL keyword detected: END	\N	2025-11-22 00:44:00.619894+05:30
2	1	student	hey	SELECT s.student_id, s.usn, s.name AS student_name, s.email AS student_email, d.department_name, s.address, s.phone AS student_phone, s.parent_phone FROM student AS s JOIN department AS d ON s.department_id = d.department_id WHERE s.student_id = $1;	No records found for your query.	[]	2025-11-22 00:52:30.577123+05:30
3	1	student	give me student project list	SELECT sp.project_name, sp.domain, sp.impact FROM student_projects AS sp WHERE sp.student_id = $1 ORDER BY sp.project_name LIMIT 100;	Found 2 record(s). Here are the results.	[{"domain": "ai", "impact": "dfghjk", "project_name": "aiml"}, {"domain": "ml", "impact": "bhar", "project_name": "aimll"}]	2025-11-22 00:53:19.777505+05:30
4	1	student	show me the marks of all students	SELECT ms.semester, ms.subject_name, ms.internal_marks, ms.external_marks, ms.total_marks, ms.result, ms.approval_status FROM marks_student AS ms WHERE ms.student_id = $1 ORDER BY ms.semester, ms.subject_name LIMIT 100;	Found 6 record(s). Here are the results.	[{"result": "P", "semester": 3, "total_marks": 99, "subject_name": "bhagt", "external_marks": 9, "internal_marks": 90, "approval_status": "pending"}, {"result": "P", "semester": 4, "total_marks": 143, "subject_name": "analysis", "external_marks": 76, "internal_marks": 67, "approval_status": "approved"}, {"result": "P", "semester": 4, "total_marks": 46, "subject_name": "analysis", "external_marks": 23, "internal_marks": 23, "approval_status": "approved"}, {"result": "P", "semester": 4, "total_marks": 268, "subject_name": "asdfg", "external_marks": 234, "internal_marks": 34, "approval_status": "pending"}, {"result": "P", "semester": 4, "total_marks": 176, "subject_name": "nhy", "external_marks": 78, "internal_marks": 98, "approval_status": "pending"}, {"result": "P", "semester": 4, "total_marks": 369, "subject_name": "sffg", "external_marks": 24, "internal_marks": 345, "approval_status": "approved"}]	2025-11-22 00:53:49.580662+05:30
5	1	student	give me the average of the students marks	SELECT AVG(ms.total_marks) AS average_marks FROM marks_student AS ms WHERE ms.student_id = $1;	Found 1 record(s). Here are the results.	[{"average_marks": "183.5000000000000000"}]	2025-11-22 00:55:10.274748+05:30
6	1	student	"4VV23CS034" what is the marks of this usn?	SELECT ms.subject_name, ms.semester, ms.internal_marks, ms.external_marks, ms.total_marks, ms.result, ms.approval_status FROM marks_student AS ms JOIN student AS s ON ms.student_id = s.student_id WHERE s.student_id = $1 AND s.usn = $2 ORDER BY ms.semester, ms.subject_name LIMIT 100;	No records found for your query.	[]	2025-11-22 00:56:58.858272+05:30
7	1	student	what is the usn of "4VV23CS034"?	SELECT s.usn FROM student AS s WHERE s.student_id = $1 AND s.usn = '4VV23CS034';	Found 1 record(s). Here are the results.	[{"usn": "4VV23CS034"}]	2025-11-22 00:57:21.200588+05:30
8	1	student	what is the average marks of "4VV23CS034"?	SELECT AVG(ms.total_marks) AS average_marks FROM marks_student AS ms JOIN student AS s ON ms.student_id = s.student_id WHERE s.student_id = $1 AND s.usn = $2;	Found 1 record(s). Here are the results.	[{"average_marks": null}]	2025-11-22 00:57:44.789149+05:30
9	1	student	what is the average marks of 4VV23CS034?	SELECT AVG(ms.total_marks) AS average_marks FROM marks_student AS ms WHERE ms.student_id = $1 AND ms.usn = '4VV23CS034';	Found 1 record(s). Here are the results.	[{"average_marks": "183.5000000000000000"}]	2025-11-22 00:58:10.1222+05:30
10	1	student	4VV23CS034 what is the marks of this usn?	SELECT s.usn, s.name AS student_name, ms.semester, ms.subject_code, ms.subject_name, ms.internal_marks, ms.external_marks, ms.total_marks, ms.result, ms.approval_status FROM marks_student AS ms JOIN student AS s ON ms.student_id = s.student_id WHERE s.student_id = $1 AND s.usn = $2 ORDER BY ms.semester, ms.subject_code LIMIT 100;	No records found for your query.	[]	2025-11-22 00:58:38.017457+05:30
11	1	student	which student has scored the highest marks?	SELECT ms.student_id, ms.usn, ms.student_name, ms.subject_name, ms.total_marks FROM marks_student AS ms WHERE ms.student_id = $1 ORDER BY ms.total_marks DESC LIMIT 1;	Found 1 record(s). Here are the results.	[{"usn": "4VV23CS034", "student_id": 1, "total_marks": 369, "student_name": "Bhargavi", "subject_name": "sffg"}]	2025-11-22 00:59:25.194125+05:30
12	1	student	show me the marks of all students	SELECT ms.semester, ms.subject_name, ms.subject_code, ms.internal_marks, ms.external_marks, ms.total_marks, ms.result, ms.approval_status FROM marks_student AS ms WHERE ms.student_id = $1 ORDER BY ms.semester, ms.subject_name LIMIT 100;	Found 6 record(s). Here are the results.	[{"result": "P", "semester": 3, "total_marks": 99, "subject_code": "bvds", "subject_name": "bhagt", "external_marks": 9, "internal_marks": 90, "approval_status": "pending"}, {"result": "P", "semester": 4, "total_marks": 143, "subject_code": "BCS3", "subject_name": "analysis", "external_marks": 76, "internal_marks": 67, "approval_status": "approved"}, {"result": "P", "semester": 4, "total_marks": 46, "subject_code": "BCS34", "subject_name": "analysis", "external_marks": 23, "internal_marks": 23, "approval_status": "approved"}, {"result": "P", "semester": 4, "total_marks": 268, "subject_code": "BCS34", "subject_name": "asdfg", "external_marks": 234, "internal_marks": 34, "approval_status": "pending"}, {"result": "P", "semester": 4, "total_marks": 176, "subject_code": "bhg54", "subject_name": "nhy", "external_marks": 78, "internal_marks": 98, "approval_status": "pending"}, {"result": "P", "semester": 4, "total_marks": 369, "subject_code": "bh23", "subject_name": "sffg", "external_marks": 24, "internal_marks": 345, "approval_status": "approved"}]	2025-11-22 01:18:33.212406+05:30
13	1	student	SHOW ME THE MARKS OF ALL STUDENTS	SELECT ms.mark_id, ms.student_id, ms.usn, ms.student_name, ms.semester, ms.subject_code, ms.subject_name, ms.internal_marks, ms.external_marks, ms.total_marks, ms.result, ms.approval_status FROM marks_student AS ms WHERE ms.student_id = $1 ORDER BY ms.semester, ms.subject_name LIMIT 100;	Found 6 record(s). Here are the results.	[{"usn": "4VV23CS034", "result": "P", "mark_id": 10, "semester": 3, "student_id": 1, "total_marks": 99, "student_name": "Bhargavi Srinivas", "subject_code": "bvds", "subject_name": "bhagt", "external_marks": 9, "internal_marks": 90, "approval_status": "pending"}, {"usn": "4VV23CS034", "result": "P", "mark_id": 6, "semester": 4, "student_id": 1, "total_marks": 143, "student_name": "Bhargavi", "subject_code": "BCS3", "subject_name": "analysis", "external_marks": 76, "internal_marks": 67, "approval_status": "approved"}, {"usn": "4VV23CS034", "result": "P", "mark_id": 7, "semester": 4, "student_id": 1, "total_marks": 46, "student_name": "Bhargavi", "subject_code": "BCS34", "subject_name": "analysis", "external_marks": 23, "internal_marks": 23, "approval_status": "approved"}, {"usn": "4VV23CS034", "result": "P", "mark_id": 9, "semester": 4, "student_id": 1, "total_marks": 268, "student_name": "Bhargavi", "subject_code": "BCS34", "subject_name": "asdfg", "external_marks": 234, "internal_marks": 34, "approval_status": "pending"}, {"usn": "4VV23CS034", "result": "P", "mark_id": 11, "semester": 4, "student_id": 1, "total_marks": 176, "student_name": "Ashmita", "subject_code": "bhg54", "subject_name": "nhy", "external_marks": 78, "internal_marks": 98, "approval_status": "pending"}, {"usn": "4VV23CS034", "result": "P", "mark_id": 5, "semester": 4, "student_id": 1, "total_marks": 369, "student_name": "Bhargavi", "subject_code": "bh23", "subject_name": "sffg", "external_marks": 24, "internal_marks": 345, "approval_status": "approved"}]	2025-11-22 01:21:01.142063+05:30
14	1	faculty	give me student list	SELECT s.student_id, s.usn, s.name AS student_name, s.email AS student_email, d.department_name, s.address, s.phone AS student_phone, s.parent_phone FROM student AS s JOIN department AS d ON s.department_id = d.department_id WHERE s.department_id = (SELECT department_id FROM faculty WHERE faculty_id = $1) ORDER BY s.name LIMIT 100;	No records found for your query.	[]	2025-11-22 02:09:06.18703+05:30
15	1	faculty	give me students project list	SELECT sp.project_name, sp.domain, sp.impact, s.name AS student_name, s.usn AS student_usn, d.department_name FROM student_projects AS sp JOIN student AS s ON sp.student_id = s.student_id JOIN department AS d ON s.department_id = d.department_id WHERE s.department_id = ( SELECT department_id FROM faculty WHERE faculty_id = $1 ) ORDER BY s.name, sp.project_name LIMIT 100;	No records found for your query.	[]	2025-11-22 02:09:41.957867+05:30
16	1	faculty	give me faculty profile list	\N	Error: Failed to generate SQL query: [GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent: [404 Not Found] models/gemini-1.5-flash is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.	\N	2025-11-22 02:11:59.12673+05:30
17	1	faculty	give me faculty list	\N	Error: column f.phone does not exist	\N	2025-11-22 02:12:24.833908+05:30
18	1	student	show me marks of all students	SELECT ms.mark_id, ms.usn, ms.student_name, ms.semester, ms.subject_code, ms.subject_name, ms.internal_marks, ms.external_marks, ms.total_marks, ms.result, ms.approval_status FROM marks_student AS ms WHERE ms.student_id = $1 ORDER BY ms.semester, ms.subject_name LIMIT 100;	Found 7 record(s). Here are the results.	[{"usn": "4VV23CS034", "result": "P", "mark_id": 10, "semester": 3, "total_marks": 99, "student_name": "Bhargavi Srinivas", "subject_code": "bvds", "subject_name": "bhagt", "external_marks": 9, "internal_marks": 90, "approval_status": "pending"}, {"usn": "4VV23CS034", "result": "P", "mark_id": 12, "semester": 3, "total_marks": 120, "student_name": "aadya", "subject_code": "bh23", "subject_name": "lulo", "external_marks": 90, "internal_marks": 30, "approval_status": "pending"}, {"usn": "4VV23CS034", "result": "P", "mark_id": 6, "semester": 4, "total_marks": 143, "student_name": "Bhargavi", "subject_code": "BCS3", "subject_name": "analysis", "external_marks": 76, "internal_marks": 67, "approval_status": "approved"}, {"usn": "4VV23CS034", "result": "P", "mark_id": 7, "semester": 4, "total_marks": 46, "student_name": "Bhargavi", "subject_code": "BCS34", "subject_name": "analysis", "external_marks": 23, "internal_marks": 23, "approval_status": "approved"}, {"usn": "4VV23CS034", "result": "P", "mark_id": 9, "semester": 4, "total_marks": 268, "student_name": "Bhargavi", "subject_code": "BCS34", "subject_name": "asdfg", "external_marks": 234, "internal_marks": 34, "approval_status": "pending"}, {"usn": "4VV23CS034", "result": "P", "mark_id": 11, "semester": 4, "total_marks": 176, "student_name": "Ashmita", "subject_code": "bhg54", "subject_name": "nhy", "external_marks": 78, "internal_marks": 98, "approval_status": "pending"}, {"usn": "4VV23CS034", "result": "P", "mark_id": 5, "semester": 4, "total_marks": 369, "student_name": "Bhargavi", "subject_code": "bh23", "subject_name": "sffg", "external_marks": 24, "internal_marks": 345, "approval_status": "approved"}]	2025-11-22 02:13:06.783956+05:30
19	1	department	LIST ALL APPROVED LEAVE REQUESTS	\N	Error: invalid input value for enum leave_status_enum: "Approved"	\N	2025-11-22 02:44:48.239377+05:30
20	1	department	give me the students list	\N	Error: there is no parameter $1	\N	2025-11-22 02:45:11.632047+05:30
21	1	student	list all the faculties	\N	Error: column f.phone does not exist	\N	2025-11-22 02:50:56.845332+05:30
22	1	student	list all the students	SELECT s.student_id, s.usn, s.name, s.email, d.department_name, s.address, s.phone, s.parent_phone FROM student AS s JOIN department AS d ON s.department_id = d.department_id WHERE s.student_id = $1 LIMIT 100;	No records found for your query.	[]	2025-11-22 02:51:13.199835+05:30
23	1	student	show me marks of all students	SELECT ms.mark_id, ms.usn, ms.student_name, ms.semester, ms.subject_code, ms.subject_name, ms.internal_marks, ms.external_marks, ms.total_marks, ms.result, ms.approval_status FROM marks_student AS ms WHERE ms.student_id = $1 ORDER BY ms.semester, ms.subject_name LIMIT 100;	Found 7 record(s). Here are the results.	[{"usn": "4VV23CS034", "result": "P", "mark_id": 10, "semester": 3, "total_marks": 99, "student_name": "Bhargavi Srinivas", "subject_code": "bvds", "subject_name": "bhagt", "external_marks": 9, "internal_marks": 90, "approval_status": "rejected"}, {"usn": "4VV23CS034", "result": "P", "mark_id": 12, "semester": 3, "total_marks": 120, "student_name": "aadya", "subject_code": "bh23", "subject_name": "lulo", "external_marks": 90, "internal_marks": 30, "approval_status": "approved"}, {"usn": "4VV23CS034", "result": "P", "mark_id": 6, "semester": 4, "total_marks": 143, "student_name": "Bhargavi", "subject_code": "BCS3", "subject_name": "analysis", "external_marks": 76, "internal_marks": 67, "approval_status": "approved"}, {"usn": "4VV23CS034", "result": "P", "mark_id": 7, "semester": 4, "total_marks": 46, "student_name": "Bhargavi", "subject_code": "BCS34", "subject_name": "analysis", "external_marks": 23, "internal_marks": 23, "approval_status": "approved"}, {"usn": "4VV23CS034", "result": "P", "mark_id": 9, "semester": 4, "total_marks": 268, "student_name": "Bhargavi", "subject_code": "BCS34", "subject_name": "asdfg", "external_marks": 234, "internal_marks": 34, "approval_status": "pending"}, {"usn": "4VV23CS034", "result": "P", "mark_id": 11, "semester": 4, "total_marks": 176, "student_name": "Ashmita", "subject_code": "bhg54", "subject_name": "nhy", "external_marks": 78, "internal_marks": 98, "approval_status": "pending"}, {"usn": "4VV23CS034", "result": "P", "mark_id": 5, "semester": 4, "total_marks": 369, "student_name": "Bhargavi", "subject_code": "bh23", "subject_name": "sffg", "external_marks": 24, "internal_marks": 345, "approval_status": "approved"}]	2025-11-22 02:51:30.91636+05:30
24	1	student	list marks of all students	SELECT ms.semester, ms.subject_name, ms.internal_marks, ms.external_marks, ms.total_marks, ms.result, ms.approval_status FROM marks_student AS ms WHERE ms.student_id = $1 ORDER BY ms.semester, ms.subject_name LIMIT 100;	Found 7 record(s). Here are the results.	[{"result": "P", "semester": 3, "total_marks": 99, "subject_name": "bhagt", "external_marks": 9, "internal_marks": 90, "approval_status": "rejected"}, {"result": "P", "semester": 3, "total_marks": 120, "subject_name": "lulo", "external_marks": 90, "internal_marks": 30, "approval_status": "approved"}, {"result": "P", "semester": 4, "total_marks": 143, "subject_name": "analysis", "external_marks": 76, "internal_marks": 67, "approval_status": "approved"}, {"result": "P", "semester": 4, "total_marks": 46, "subject_name": "analysis", "external_marks": 23, "internal_marks": 23, "approval_status": "approved"}, {"result": "P", "semester": 4, "total_marks": 268, "subject_name": "asdfg", "external_marks": 234, "internal_marks": 34, "approval_status": "pending"}, {"result": "P", "semester": 4, "total_marks": 176, "subject_name": "nhy", "external_marks": 78, "internal_marks": 98, "approval_status": "pending"}, {"result": "P", "semester": 4, "total_marks": 369, "subject_name": "sffg", "external_marks": 24, "internal_marks": 345, "approval_status": "approved"}]	2025-11-22 02:52:01.488078+05:30
25	1	student	list all faculty profiles	\N	Error: column f.phone does not exist	\N	2025-11-22 02:52:20.029534+05:30
26	1	student	list all the course_name of the faculties	SELECT DISTINCT fc.course_name AS faculty_course_name FROM student AS s JOIN department AS d ON s.department_id = d.department_id JOIN faculty AS f ON d.department_id = f.department_id JOIN faculty_courses AS fc ON f.faculty_id = fc.faculty_id WHERE s.student_id = $1 ORDER BY fc.course_name LIMIT 100;	No records found for your query.	[]	2025-11-22 02:53:29.631266+05:30
27	1	student	what is the date of am event	SELECT da.event_title, da.event_date, d.department_name FROM department_activities AS da JOIN department AS d ON da.department_id = d.department_id JOIN student AS s ON s.department_id = d.department_id WHERE s.student_id = $1 ORDER BY da.event_date DESC LIMIT 100;	No records found for your query.	[]	2025-11-22 02:54:26.129692+05:30
28	1	student	give me all the department events	SELECT da.event_title, da.event_details, da.event_date, d.department_name FROM department_activities AS da JOIN department AS d ON da.department_id = d.department_id ORDER BY da.event_date DESC LIMIT 100;	Found 1 record(s). Here are the results.	[{"event_date": "2025-11-04T18:30:00.000Z", "event_title": "am", "event_details": "hjk", "department_name": "Computer Science"}]	2025-11-22 02:54:51.864335+05:30
29	1	student	give me the student with highest marks	\N	Error: AI Service Failed	\N	2025-11-22 02:59:08.543486+05:30
30	1	faculty	give me the faculty list	\N	Error: AI Service Failed	\N	2025-11-22 02:59:47.954803+05:30
31	1	faculty	give me faculty list	\N	Error: column f.phone does not exist	\N	2025-11-22 03:01:20.281873+05:30
48	1	faculty	list all pending leave requests	SELECT slr.leave_id, slr.student_id, s.name AS student_name, slr.leave_details, slr.status, slr.from_date FROM student_leave_requests slr JOIN student s ON slr.student_id = s.student_id JOIN department d ON s.department_id = d.department_id JOIN faculty f ON d.department_id = f.department_id WHERE f.faculty_id = $1 AND slr.status = 'pending'	No data available or access restricted.	[]	2025-11-22 03:40:04.658393+05:30
49	1	department	list all faculty data	SELECT faculty_id, faculty_name, email, department_id FROM faculty	Found 1 record(s).	[{"email": "faculty1@gmail.com", "faculty_id": 1, "faculty_name": "faculty1", "department_id": null}]	2025-11-22 03:40:25.919873+05:30
32	1	student	give me student marks list	SELECT ms.semester, ms.subject_name, ms.subject_code, ms.internal_marks, ms.external_marks, ms.total_marks, ms.result, ms.approval_status FROM marks_student AS ms WHERE ms.student_id = $1 ORDER BY ms.semester, ms.subject_name LIMIT 100;	Found 7 record(s). Here are the results.	[{"result": "P", "semester": 3, "total_marks": 99, "subject_code": "bvds", "subject_name": "bhagt", "external_marks": 9, "internal_marks": 90, "approval_status": "rejected"}, {"result": "P", "semester": 3, "total_marks": 120, "subject_code": "bh23", "subject_name": "lulo", "external_marks": 90, "internal_marks": 30, "approval_status": "approved"}, {"result": "P", "semester": 4, "total_marks": 143, "subject_code": "BCS3", "subject_name": "analysis", "external_marks": 76, "internal_marks": 67, "approval_status": "approved"}, {"result": "P", "semester": 4, "total_marks": 46, "subject_code": "BCS34", "subject_name": "analysis", "external_marks": 23, "internal_marks": 23, "approval_status": "approved"}, {"result": "P", "semester": 4, "total_marks": 268, "subject_code": "BCS34", "subject_name": "asdfg", "external_marks": 234, "internal_marks": 34, "approval_status": "pending"}, {"result": "P", "semester": 4, "total_marks": 176, "subject_code": "bhg54", "subject_name": "nhy", "external_marks": 78, "internal_marks": 98, "approval_status": "pending"}, {"result": "P", "semester": 4, "total_marks": 369, "subject_code": "bh23", "subject_name": "sffg", "external_marks": 24, "internal_marks": 345, "approval_status": "approved"}]	2025-11-22 03:01:52.907769+05:30
33	1	student	GIVE ME LIST OF STUDENT MARKS	SELECT * FROM marks_student WHERE student_id = $1;	Here are 7 marks records found for students, including Bhargavi.	[{"usn": "4VV23CS034", "result": "P", "mark_id": 5, "semester": 4, "exam_date": "2025-11-20T18:30:00.000Z", "exam_type": "Semester Result", "created_at": "2025-11-21T14:38:30.330Z", "marks_data": {}, "student_id": 1, "updated_at": "2025-11-21T14:38:30.330Z", "approved_at": null, "approved_by": null, "total_marks": 369, "uploaded_by": 1, "student_name": "Bhargavi", "subject_code": "bh23", "subject_name": "sffg", "academic_year": null, "announced_date": null, "external_marks": 24, "internal_marks": 345, "approval_status": "approved", "approval_remarks": null, "performance_metrics": {}}, {"usn": "4VV23CS034", "result": "P", "mark_id": 6, "semester": 4, "exam_date": "2025-11-20T18:30:00.000Z", "exam_type": "Semester Result", "created_at": "2025-11-21T14:45:01.747Z", "marks_data": {}, "student_id": 1, "updated_at": "2025-11-21T14:45:01.747Z", "approved_at": null, "approved_by": null, "total_marks": 143, "uploaded_by": 1, "student_name": "Bhargavi", "subject_code": "BCS3", "subject_name": "analysis", "academic_year": null, "announced_date": null, "external_marks": 76, "internal_marks": 67, "approval_status": "approved", "approval_remarks": null, "performance_metrics": {}}, {"usn": "4VV23CS034", "result": "P", "mark_id": 7, "semester": 4, "exam_date": "2025-11-20T18:30:00.000Z", "exam_type": "Semester Result", "created_at": "2025-11-21T14:52:27.217Z", "marks_data": {}, "student_id": 1, "updated_at": "2025-11-21T14:52:27.217Z", "approved_at": null, "approved_by": null, "total_marks": 46, "uploaded_by": 1, "student_name": "Bhargavi", "subject_code": "BCS34", "subject_name": "analysis", "academic_year": null, "announced_date": null, "external_marks": 23, "internal_marks": 23, "approval_status": "approved", "approval_remarks": null, "performance_metrics": {}}, {"usn": "4VV23CS034", "result": "P", "mark_id": 9, "semester": 4, "exam_date": "2025-11-20T18:30:00.000Z", "exam_type": "Semester Result", "created_at": "2025-11-21T15:03:05.221Z", "marks_data": {}, "student_id": 1, "updated_at": "2025-11-21T15:03:05.221Z", "approved_at": null, "approved_by": null, "total_marks": 268, "uploaded_by": 1, "student_name": "Bhargavi", "subject_code": "BCS34", "subject_name": "asdfg", "academic_year": null, "announced_date": null, "external_marks": 234, "internal_marks": 34, "approval_status": "pending", "approval_remarks": null, "performance_metrics": {}}, {"usn": "4VV23CS034", "result": "P", "mark_id": 11, "semester": 4, "exam_date": "2025-11-20T18:30:00.000Z", "exam_type": "Semester Result", "created_at": "2025-11-21T18:34:03.414Z", "marks_data": {}, "student_id": 1, "updated_at": "2025-11-21T18:34:03.414Z", "approved_at": null, "approved_by": null, "total_marks": 176, "uploaded_by": 1, "student_name": "Ashmita", "subject_code": "bhg54", "subject_name": "nhy", "academic_year": null, "announced_date": null, "external_marks": 78, "internal_marks": 98, "approval_status": "pending", "approval_remarks": null, "performance_metrics": {}}, {"usn": "4VV23CS034", "result": "P", "mark_id": 12, "semester": 3, "exam_date": "2025-11-20T18:30:00.000Z", "exam_type": "Semester Result", "created_at": "2025-11-21T20:25:23.728Z", "marks_data": {}, "student_id": 1, "updated_at": "2025-11-21T20:58:47.826Z", "approved_at": "2025-11-21T20:58:47.826Z", "approved_by": 1, "total_marks": 120, "uploaded_by": 1, "student_name": "aadya", "subject_code": "bh23", "subject_name": "lulo", "academic_year": "24", "announced_date": null, "external_marks": 90, "internal_marks": 30, "approval_status": "approved", "approval_remarks": "", "performance_metrics": {}}, {"usn": "4VV23CS034", "result": "P", "mark_id": 10, "semester": 3, "exam_date": "2025-11-20T18:30:00.000Z", "exam_type": "Semester Result", "created_at": "2025-11-21T16:32:44.778Z", "marks_data": {}, "student_id": 1, "updated_at": "2025-11-21T20:58:52.000Z", "approved_at": "2025-11-21T20:58:52.000Z", "approved_by": 1, "total_marks": 99, "uploaded_by": 1, "student_name": "Bhargavi Srinivas", "subject_code": "bvds", "subject_name": "bhagt", "academic_year": null, "announced_date": null, "external_marks": 9, "internal_marks": 90, "approval_status": "rejected", "approval_remarks": "", "performance_metrics": {}}]	2025-11-22 03:14:48.029021+05:30
34	1	faculty	LIST ALL FACULTY ID	SELECT faculty_id FROM faculty WHERE faculty_id = $1	I found 1 faculty ID.	[{"faculty_id": 1}]	2025-11-22 03:16:35.346691+05:30
35	1	faculty	Give me the name of the student who has scored highest marks	SELECT ms.student_name FROM marks_student ms JOIN student s ON ms.student_id = s.student_id WHERE s.department_id = (SELECT department_id FROM faculty WHERE faculty_id = $1) ORDER BY ms.total_marks DESC LIMIT 1	No student records were found to determine who scored the highest marks.	[]	2025-11-22 03:17:38.973211+05:30
36	1	department	list all rejected marks	SELECT\n    ms.mark_id,\n    ms.student_id,\n    ms.student_name,\n    ms.semester,\n    ms.subject_code,\n    ms.subject_name,\n    ms.internal_marks,\n    ms.external_marks,\n    ms.total_marks,\n    ms.result\nFROM\n    marks_student ms\nJOIN\n    student s ON ms.student_id = s.student_id\nWHERE\n    s.department_id = $1 AND ms.result = 'REJECTED';	No rejected marks were found.	[]	2025-11-22 03:18:59.249908+05:30
37	2	admin	list all student names	SELECT name FROM student;	I found one student named Aadya.	[{"name": "aadya"}]	2025-11-22 03:20:34.123338+05:30
38	2	admin	list the average student marks	SELECT AVG(total_marks) FROM marks_student;	The average student mark is 153.44.	[{"avg": "153.4444444444444444"}]	2025-11-22 03:21:09.463627+05:30
39	2	admin	List all faculty profiles	SELECT faculty_id, faculty_name, email, department_id FROM faculty;	One faculty profile was found, listing faculty_id, faculty_name, email, and a null department_id.	[{"email": "faculty1@gmail.com", "faculty_id": 1, "faculty_name": "faculty1", "department_id": null}]	2025-11-22 03:29:37.60002+05:30
40	2	admin	list all pending leave requests	SELECT * FROM student_leave_requests WHERE status = 'pending'	One pending leave request was found for a student due to illness, from November 21 to November 22, 2025.	[{"status": "pending", "remarks": null, "to_date": "2025-11-22T18:30:00.000Z", "leave_id": 1, "from_date": "2025-11-21T18:30:00.000Z", "timestamp": "2025-11-21T09:08:14.795Z", "student_id": 1, "reviewed_by": null, "leave_details": "I'm ill", "review_timestamp": null}]	2025-11-22 03:30:00.910299+05:30
41	1	department	list all faculty profiles	SELECT faculty_id, faculty_name, email, department_id FROM faculty;	One faculty profile was found.	[{"email": "faculty1@gmail.com", "faculty_id": 1, "faculty_name": "faculty1", "department_id": null}]	2025-11-22 03:30:25.805116+05:30
42	1	department	list all pending leave requests	SELECT leave_id, student_id, leave_details, status, from_date FROM student_leave_requests WHERE status = 'pending'	There is 1 pending leave request.	[{"status": "pending", "leave_id": 1, "from_date": "2025-11-21T18:30:00.000Z", "student_id": 1, "leave_details": "I'm ill"}]	2025-11-22 03:30:42.092818+05:30
43	1	faculty	list all faculty profiles	SELECT faculty_id, faculty_name, email, department_id FROM faculty WHERE faculty_id = $1	One faculty profile was found, including information for "faculty1".	[{"email": "faculty1@gmail.com", "faculty_id": 1, "faculty_name": "faculty1", "department_id": null}]	2025-11-22 03:31:03.817177+05:30
44	1	faculty	list all pending leave requests	SELECT slr.leave_id, slr.student_id, s.name AS student_name, slr.leave_details, slr.status, slr.from_date FROM student_leave_requests slr JOIN student s ON slr.student_id = s.student_id JOIN faculty f ON s.department_id = f.department_id WHERE slr.status = 'pending' AND f.faculty_id = $1	There are no pending leave requests.	[]	2025-11-22 03:31:41.585046+05:30
45	1	student	list all student data	SELECT student_id, usn, name, email, department_id, address FROM student WHERE student_id = $1	Found 1 record(s).	[{"usn": "4VV23CS034", "name": "aadya", "email": "bhargavi@gmail.com", "address": "87gy", "student_id": 1, "department_id": null}]	2025-11-22 03:38:28.121383+05:30
46	1	student	list all faculty data	SELECT faculty_id, faculty_name, email, department_id FROM faculty WHERE 1 = 0 AND EXISTS (SELECT 1 FROM student WHERE student_id = $1)	No data available or access restricted.	[]	2025-11-22 03:39:14.202897+05:30
47	1	faculty	list all faculty data	SELECT * FROM faculty WHERE faculty_id = $1;	Found 1 record(s).	[{"email": "faculty1@gmail.com", "created_at": "2025-11-21T09:16:06.320Z", "faculty_id": 1, "login_info": null, "updated_at": "2025-11-21T09:16:06.320Z", "faculty_name": "faculty1", "department_id": null, "password_hash": "$2a$10$YpFMPm06Doe7fEuUzogFpu7LKpLfEmGNerB7Pcj5sTZSQ5l4txMIy"}]	2025-11-22 03:39:39.381318+05:30
50	1	department	list all pending leave requests	SELECT * FROM student_leave_requests WHERE status = 'pending'	Found 1 record(s).	[{"status": "pending", "remarks": null, "to_date": "2025-11-22T18:30:00.000Z", "leave_id": 1, "from_date": "2025-11-21T18:30:00.000Z", "timestamp": "2025-11-21T09:08:14.795Z", "student_id": 1, "reviewed_by": null, "leave_details": "I'm ill", "review_timestamp": null}]	2025-11-22 03:40:36.180999+05:30
51	1	department	list the fee paid data of students	SELECT student_id, usn, name, email, department_id, address FROM student	Found 1 record(s).	[{"usn": "4VV23CS034", "name": "aadya", "email": "bhargavi@gmail.com", "address": "87gy", "student_id": 1, "department_id": null}]	2025-11-22 03:40:59.341579+05:30
52	1	department	list hostel data of students	SELECT student_id, usn, name, address\nFROM student;	Found 1 record(s).	[{"usn": "4VV23CS034", "name": "aadya", "address": "87gy", "student_id": 1}]	2025-11-22 03:41:23.742813+05:30
53	2	admin	list all faculty data and the data of fee paid students	SELECT * FROM faculty;	Found 1 record(s).	[{"email": "faculty1@gmail.com", "created_at": "2025-11-21T09:16:06.320Z", "faculty_id": 1, "login_info": null, "updated_at": "2025-11-21T09:16:06.320Z", "faculty_name": "faculty1", "department_id": null, "password_hash": "$2a$10$YpFMPm06Doe7fEuUzogFpu7LKpLfEmGNerB7Pcj5sTZSQ5l4txMIy"}]	2025-11-22 03:42:45.725392+05:30
54	1	student	give me average marks of all students	SELECT AVG(total_marks) FROM marks_student WHERE student_id = $1	Found 1 record(s).	[{"avg": "174.4285714285714286"}]	2025-11-22 04:02:29.812433+05:30
55	1	student	give all students list	SELECT * FROM student WHERE student_id = $1	Found 1 record(s).	[{"usn": "4VV23CS034", "name": "aadya", "email": "bhargavi@gmail.com", "phone": "+91123456799", "address": "bhat", "batch_year": null, "created_at": "2025-11-21T09:04:03.131Z", "student_id": 1, "updated_at": "2025-11-21T23:44:42.413Z", "parent_phone": "+91123456676", "department_id": null, "password_hash": "$2a$10$HEoc3oQP3p7TheYMUQieLuXapB0TWXIqmj/KoGO3G..29CzLKAm72"}]	2025-11-22 05:28:11.713075+05:30
56	1	student	give list of all facu;ties	SELECT F.faculty_id, F.faculty_name, F.email, F.department_id FROM faculty F JOIN student S ON F.department_id = S.department_id WHERE S.student_id = $1	No data available or access restricted.	[]	2025-11-22 05:28:37.720525+05:30
57	3	department	give list of all faculties	SELECT faculty_id, faculty_name, email, department_id FROM faculty	Found 1 record(s).	[{"email": "faculty1@gmail.com", "faculty_id": 1, "faculty_name": "faculty1", "department_id": null}]	2025-11-22 05:31:28.53831+05:30
58	3	department	show me marks approves	SELECT T1.mark_id, T1.student_id, T1.student_name, T1.semester, T1.subject_code, T1.subject_name, T1.internal_marks, T1.external_marks, T1.total_marks, T1.result FROM marks_student AS T1 JOIN student_leave_requests AS T2 ON T1.student_id = T2.student_id WHERE T2.status = 'approved'	Found 120 record(s).	[{"result": "P", "mark_id": 5, "semester": 4, "student_id": 1, "total_marks": 369, "student_name": "Bhargavi", "subject_code": "bh23", "subject_name": "sffg", "external_marks": 24, "internal_marks": 345}, {"result": "P", "mark_id": 5, "semester": 4, "student_id": 1, "total_marks": 369, "student_name": "Bhargavi", "subject_code": "bh23", "subject_name": "sffg", "external_marks": 24, "internal_marks": 345}, {"result": "P", "mark_id": 5, "semester": 4, "student_id": 1, "total_marks": 369, "student_name": "Bhargavi", "subject_code": "bh23", "subject_name": "sffg", "external_marks": 24, "internal_marks": 345}, {"result": "P", "mark_id": 5, "semester": 4, "student_id": 1, "total_marks": 369, "student_name": "Bhargavi", "subject_code": "bh23", "subject_name": "sffg", "external_marks": 24, "internal_marks": 345}, {"result": "P", "mark_id": 5, "semester": 4, "student_id": 1, "total_marks": 369, "student_name": "Bhargavi", "subject_code": "bh23", "subject_name": "sffg", "external_marks": 24, "internal_marks": 345}, {"result": "P", "mark_id": 5, "semester": 4, "student_id": 1, "total_marks": 369, "student_name": "Bhargavi", "subject_code": "bh23", "subject_name": "sffg", "external_marks": 24, "internal_marks": 345}, {"result": "P", "mark_id": 5, "semester": 4, "student_id": 1, "total_marks": 369, "student_name": "Bhargavi", "subject_code": "bh23", "subject_name": "sffg", "external_marks": 24, "internal_marks": 345}, {"result": "P", "mark_id": 5, "semester": 4, "student_id": 1, "total_marks": 369, "student_name": "Bhargavi", "subject_code": "bh23", "subject_name": "sffg", "external_marks": 24, "internal_marks": 345}, {"result": "P", "mark_id": 5, "semester": 4, "student_id": 1, "total_marks": 369, "student_name": "Bhargavi", "subject_code": "bh23", "subject_name": "sffg", "external_marks": 24, "internal_marks": 345}, {"result": "P", "mark_id": 5, "semester": 4, "student_id": 1, "total_marks": 369, "student_name": "Bhargavi", "subject_code": "bh23", "subject_name": "sffg", "external_marks": 24, "internal_marks": 345}, {"result": "P", "mark_id": 5, "semester": 4, "student_id": 1, "total_marks": 369, "student_name": "Bhargavi", "subject_code": "bh23", "subject_name": "sffg", "external_marks": 24, "internal_marks": 345}, {"result": "P", "mark_id": 5, "semester": 4, "student_id": 1, "total_marks": 369, "student_name": "Bhargavi", "subject_code": "bh23", "subject_name": "sffg", "external_marks": 24, "internal_marks": 345}, {"result": "P", "mark_id": 6, "semester": 4, "student_id": 1, "total_marks": 143, "student_name": "Bhargavi", "subject_code": "BCS3", "subject_name": "analysis", "external_marks": 76, "internal_marks": 67}, {"result": "P", "mark_id": 6, "semester": 4, "student_id": 1, "total_marks": 143, "student_name": "Bhargavi", "subject_code": "BCS3", "subject_name": "analysis", "external_marks": 76, "internal_marks": 67}, {"result": "P", "mark_id": 6, "semester": 4, "student_id": 1, "total_marks": 143, "student_name": "Bhargavi", "subject_code": "BCS3", "subject_name": "analysis", "external_marks": 76, "internal_marks": 67}, {"result": "P", "mark_id": 6, "semester": 4, "student_id": 1, "total_marks": 143, "student_name": "Bhargavi", "subject_code": "BCS3", "subject_name": "analysis", "external_marks": 76, "internal_marks": 67}, {"result": "P", "mark_id": 6, "semester": 4, "student_id": 1, "total_marks": 143, "student_name": "Bhargavi", "subject_code": "BCS3", "subject_name": "analysis", "external_marks": 76, "internal_marks": 67}, {"result": "P", "mark_id": 6, "semester": 4, "student_id": 1, "total_marks": 143, "student_name": "Bhargavi", "subject_code": "BCS3", "subject_name": "analysis", "external_marks": 76, "internal_marks": 67}, {"result": "P", "mark_id": 6, "semester": 4, "student_id": 1, "total_marks": 143, "student_name": "Bhargavi", "subject_code": "BCS3", "subject_name": "analysis", "external_marks": 76, "internal_marks": 67}, {"result": "P", "mark_id": 6, "semester": 4, "student_id": 1, "total_marks": 143, "student_name": "Bhargavi", "subject_code": "BCS3", "subject_name": "analysis", "external_marks": 76, "internal_marks": 67}, {"result": "P", "mark_id": 6, "semester": 4, "student_id": 1, "total_marks": 143, "student_name": "Bhargavi", "subject_code": "BCS3", "subject_name": "analysis", "external_marks": 76, "internal_marks": 67}, {"result": "P", "mark_id": 6, "semester": 4, "student_id": 1, "total_marks": 143, "student_name": "Bhargavi", "subject_code": "BCS3", "subject_name": "analysis", "external_marks": 76, "internal_marks": 67}, {"result": "P", "mark_id": 6, "semester": 4, "student_id": 1, "total_marks": 143, "student_name": "Bhargavi", "subject_code": "BCS3", "subject_name": "analysis", "external_marks": 76, "internal_marks": 67}, {"result": "P", "mark_id": 6, "semester": 4, "student_id": 1, "total_marks": 143, "student_name": "Bhargavi", "subject_code": "BCS3", "subject_name": "analysis", "external_marks": 76, "internal_marks": 67}, {"result": "P", "mark_id": 7, "semester": 4, "student_id": 1, "total_marks": 46, "student_name": "Bhargavi", "subject_code": "BCS34", "subject_name": "analysis", "external_marks": 23, "internal_marks": 23}, {"result": "P", "mark_id": 7, "semester": 4, "student_id": 1, "total_marks": 46, "student_name": "Bhargavi", "subject_code": "BCS34", "subject_name": "analysis", "external_marks": 23, "internal_marks": 23}, {"result": "P", "mark_id": 7, "semester": 4, "student_id": 1, "total_marks": 46, "student_name": "Bhargavi", "subject_code": "BCS34", "subject_name": "analysis", "external_marks": 23, "internal_marks": 23}, {"result": "P", "mark_id": 7, "semester": 4, "student_id": 1, "total_marks": 46, "student_name": "Bhargavi", "subject_code": "BCS34", "subject_name": "analysis", "external_marks": 23, "internal_marks": 23}, {"result": "P", "mark_id": 7, "semester": 4, "student_id": 1, "total_marks": 46, "student_name": "Bhargavi", "subject_code": "BCS34", "subject_name": "analysis", "external_marks": 23, "internal_marks": 23}, {"result": "P", "mark_id": 7, "semester": 4, "student_id": 1, "total_marks": 46, "student_name": "Bhargavi", "subject_code": "BCS34", "subject_name": "analysis", "external_marks": 23, "internal_marks": 23}, {"result": "P", "mark_id": 7, "semester": 4, "student_id": 1, "total_marks": 46, "student_name": "Bhargavi", "subject_code": "BCS34", "subject_name": "analysis", "external_marks": 23, "internal_marks": 23}, {"result": "P", "mark_id": 7, "semester": 4, "student_id": 1, "total_marks": 46, "student_name": "Bhargavi", "subject_code": "BCS34", "subject_name": "analysis", "external_marks": 23, "internal_marks": 23}, {"result": "P", "mark_id": 7, "semester": 4, "student_id": 1, "total_marks": 46, "student_name": "Bhargavi", "subject_code": "BCS34", "subject_name": "analysis", "external_marks": 23, "internal_marks": 23}, {"result": "P", "mark_id": 7, "semester": 4, "student_id": 1, "total_marks": 46, "student_name": "Bhargavi", "subject_code": "BCS34", "subject_name": "analysis", "external_marks": 23, "internal_marks": 23}, {"result": "P", "mark_id": 7, "semester": 4, "student_id": 1, "total_marks": 46, "student_name": "Bhargavi", "subject_code": "BCS34", "subject_name": "analysis", "external_marks": 23, "internal_marks": 23}, {"result": "P", "mark_id": 7, "semester": 4, "student_id": 1, "total_marks": 46, "student_name": "Bhargavi", "subject_code": "BCS34", "subject_name": "analysis", "external_marks": 23, "internal_marks": 23}, {"result": "P", "mark_id": 12, "semester": 3, "student_id": 1, "total_marks": 120, "student_name": "aadya", "subject_code": "bh23", "subject_name": "lulo", "external_marks": 90, "internal_marks": 30}, {"result": "P", "mark_id": 12, "semester": 3, "student_id": 1, "total_marks": 120, "student_name": "aadya", "subject_code": "bh23", "subject_name": "lulo", "external_marks": 90, "internal_marks": 30}, {"result": "P", "mark_id": 12, "semester": 3, "student_id": 1, "total_marks": 120, "student_name": "aadya", "subject_code": "bh23", "subject_name": "lulo", "external_marks": 90, "internal_marks": 30}, {"result": "P", "mark_id": 12, "semester": 3, "student_id": 1, "total_marks": 120, "student_name": "aadya", "subject_code": "bh23", "subject_name": "lulo", "external_marks": 90, "internal_marks": 30}, {"result": "P", "mark_id": 12, "semester": 3, "student_id": 1, "total_marks": 120, "student_name": "aadya", "subject_code": "bh23", "subject_name": "lulo", "external_marks": 90, "internal_marks": 30}, {"result": "P", "mark_id": 12, "semester": 3, "student_id": 1, "total_marks": 120, "student_name": "aadya", "subject_code": "bh23", "subject_name": "lulo", "external_marks": 90, "internal_marks": 30}, {"result": "P", "mark_id": 12, "semester": 3, "student_id": 1, "total_marks": 120, "student_name": "aadya", "subject_code": "bh23", "subject_name": "lulo", "external_marks": 90, "internal_marks": 30}, {"result": "P", "mark_id": 12, "semester": 3, "student_id": 1, "total_marks": 120, "student_name": "aadya", "subject_code": "bh23", "subject_name": "lulo", "external_marks": 90, "internal_marks": 30}, {"result": "P", "mark_id": 12, "semester": 3, "student_id": 1, "total_marks": 120, "student_name": "aadya", "subject_code": "bh23", "subject_name": "lulo", "external_marks": 90, "internal_marks": 30}, {"result": "P", "mark_id": 12, "semester": 3, "student_id": 1, "total_marks": 120, "student_name": "aadya", "subject_code": "bh23", "subject_name": "lulo", "external_marks": 90, "internal_marks": 30}, {"result": "P", "mark_id": 12, "semester": 3, "student_id": 1, "total_marks": 120, "student_name": "aadya", "subject_code": "bh23", "subject_name": "lulo", "external_marks": 90, "internal_marks": 30}, {"result": "P", "mark_id": 12, "semester": 3, "student_id": 1, "total_marks": 120, "student_name": "aadya", "subject_code": "bh23", "subject_name": "lulo", "external_marks": 90, "internal_marks": 30}, {"result": "P", "mark_id": 10, "semester": 3, "student_id": 1, "total_marks": 99, "student_name": "Bhargavi Srinivas", "subject_code": "bvds", "subject_name": "bhagt", "external_marks": 9, "internal_marks": 90}, {"result": "P", "mark_id": 10, "semester": 3, "student_id": 1, "total_marks": 99, "student_name": "Bhargavi Srinivas", "subject_code": "bvds", "subject_name": "bhagt", "external_marks": 9, "internal_marks": 90}, {"result": "P", "mark_id": 10, "semester": 3, "student_id": 1, "total_marks": 99, "student_name": "Bhargavi Srinivas", "subject_code": "bvds", "subject_name": "bhagt", "external_marks": 9, "internal_marks": 90}, {"result": "P", "mark_id": 10, "semester": 3, "student_id": 1, "total_marks": 99, "student_name": "Bhargavi Srinivas", "subject_code": "bvds", "subject_name": "bhagt", "external_marks": 9, "internal_marks": 90}, {"result": "P", "mark_id": 10, "semester": 3, "student_id": 1, "total_marks": 99, "student_name": "Bhargavi Srinivas", "subject_code": "bvds", "subject_name": "bhagt", "external_marks": 9, "internal_marks": 90}, {"result": "P", "mark_id": 10, "semester": 3, "student_id": 1, "total_marks": 99, "student_name": "Bhargavi Srinivas", "subject_code": "bvds", "subject_name": "bhagt", "external_marks": 9, "internal_marks": 90}, {"result": "P", "mark_id": 10, "semester": 3, "student_id": 1, "total_marks": 99, "student_name": "Bhargavi Srinivas", "subject_code": "bvds", "subject_name": "bhagt", "external_marks": 9, "internal_marks": 90}, {"result": "P", "mark_id": 10, "semester": 3, "student_id": 1, "total_marks": 99, "student_name": "Bhargavi Srinivas", "subject_code": "bvds", "subject_name": "bhagt", "external_marks": 9, "internal_marks": 90}, {"result": "P", "mark_id": 10, "semester": 3, "student_id": 1, "total_marks": 99, "student_name": "Bhargavi Srinivas", "subject_code": "bvds", "subject_name": "bhagt", "external_marks": 9, "internal_marks": 90}, {"result": "P", "mark_id": 10, "semester": 3, "student_id": 1, "total_marks": 99, "student_name": "Bhargavi Srinivas", "subject_code": "bvds", "subject_name": "bhagt", "external_marks": 9, "internal_marks": 90}, {"result": "P", "mark_id": 10, "semester": 3, "student_id": 1, "total_marks": 99, "student_name": "Bhargavi Srinivas", "subject_code": "bvds", "subject_name": "bhagt", "external_marks": 9, "internal_marks": 90}, {"result": "P", "mark_id": 10, "semester": 3, "student_id": 1, "total_marks": 99, "student_name": "Bhargavi Srinivas", "subject_code": "bvds", "subject_name": "bhagt", "external_marks": 9, "internal_marks": 90}, {"result": "P", "mark_id": 11, "semester": 4, "student_id": 1, "total_marks": 176, "student_name": "Ashmita", "subject_code": "bhg54", "subject_name": "nhy", "external_marks": 78, "internal_marks": 98}, {"result": "P", "mark_id": 11, "semester": 4, "student_id": 1, "total_marks": 176, "student_name": "Ashmita", "subject_code": "bhg54", "subject_name": "nhy", "external_marks": 78, "internal_marks": 98}, {"result": "P", "mark_id": 11, "semester": 4, "student_id": 1, "total_marks": 176, "student_name": "Ashmita", "subject_code": "bhg54", "subject_name": "nhy", "external_marks": 78, "internal_marks": 98}, {"result": "P", "mark_id": 11, "semester": 4, "student_id": 1, "total_marks": 176, "student_name": "Ashmita", "subject_code": "bhg54", "subject_name": "nhy", "external_marks": 78, "internal_marks": 98}, {"result": "P", "mark_id": 11, "semester": 4, "student_id": 1, "total_marks": 176, "student_name": "Ashmita", "subject_code": "bhg54", "subject_name": "nhy", "external_marks": 78, "internal_marks": 98}, {"result": "P", "mark_id": 11, "semester": 4, "student_id": 1, "total_marks": 176, "student_name": "Ashmita", "subject_code": "bhg54", "subject_name": "nhy", "external_marks": 78, "internal_marks": 98}, {"result": "P", "mark_id": 11, "semester": 4, "student_id": 1, "total_marks": 176, "student_name": "Ashmita", "subject_code": "bhg54", "subject_name": "nhy", "external_marks": 78, "internal_marks": 98}, {"result": "P", "mark_id": 11, "semester": 4, "student_id": 1, "total_marks": 176, "student_name": "Ashmita", "subject_code": "bhg54", "subject_name": "nhy", "external_marks": 78, "internal_marks": 98}, {"result": "P", "mark_id": 11, "semester": 4, "student_id": 1, "total_marks": 176, "student_name": "Ashmita", "subject_code": "bhg54", "subject_name": "nhy", "external_marks": 78, "internal_marks": 98}, {"result": "P", "mark_id": 11, "semester": 4, "student_id": 1, "total_marks": 176, "student_name": "Ashmita", "subject_code": "bhg54", "subject_name": "nhy", "external_marks": 78, "internal_marks": 98}, {"result": "P", "mark_id": 11, "semester": 4, "student_id": 1, "total_marks": 176, "student_name": "Ashmita", "subject_code": "bhg54", "subject_name": "nhy", "external_marks": 78, "internal_marks": 98}, {"result": "P", "mark_id": 11, "semester": 4, "student_id": 1, "total_marks": 176, "student_name": "Ashmita", "subject_code": "bhg54", "subject_name": "nhy", "external_marks": 78, "internal_marks": 98}, {"result": "P", "mark_id": 9, "semester": 4, "student_id": 1, "total_marks": 268, "student_name": "Bhargavi", "subject_code": "BCS34", "subject_name": "asdfg", "external_marks": 234, "internal_marks": 34}, {"result": "P", "mark_id": 9, "semester": 4, "student_id": 1, "total_marks": 268, "student_name": "Bhargavi", "subject_code": "BCS34", "subject_name": "asdfg", "external_marks": 234, "internal_marks": 34}, {"result": "P", "mark_id": 9, "semester": 4, "student_id": 1, "total_marks": 268, "student_name": "Bhargavi", "subject_code": "BCS34", "subject_name": "asdfg", "external_marks": 234, "internal_marks": 34}, {"result": "P", "mark_id": 9, "semester": 4, "student_id": 1, "total_marks": 268, "student_name": "Bhargavi", "subject_code": "BCS34", "subject_name": "asdfg", "external_marks": 234, "internal_marks": 34}, {"result": "P", "mark_id": 9, "semester": 4, "student_id": 1, "total_marks": 268, "student_name": "Bhargavi", "subject_code": "BCS34", "subject_name": "asdfg", "external_marks": 234, "internal_marks": 34}, {"result": "P", "mark_id": 9, "semester": 4, "student_id": 1, "total_marks": 268, "student_name": "Bhargavi", "subject_code": "BCS34", "subject_name": "asdfg", "external_marks": 234, "internal_marks": 34}, {"result": "P", "mark_id": 9, "semester": 4, "student_id": 1, "total_marks": 268, "student_name": "Bhargavi", "subject_code": "BCS34", "subject_name": "asdfg", "external_marks": 234, "internal_marks": 34}, {"result": "P", "mark_id": 9, "semester": 4, "student_id": 1, "total_marks": 268, "student_name": "Bhargavi", "subject_code": "BCS34", "subject_name": "asdfg", "external_marks": 234, "internal_marks": 34}, {"result": "P", "mark_id": 9, "semester": 4, "student_id": 1, "total_marks": 268, "student_name": "Bhargavi", "subject_code": "BCS34", "subject_name": "asdfg", "external_marks": 234, "internal_marks": 34}, {"result": "P", "mark_id": 9, "semester": 4, "student_id": 1, "total_marks": 268, "student_name": "Bhargavi", "subject_code": "BCS34", "subject_name": "asdfg", "external_marks": 234, "internal_marks": 34}, {"result": "P", "mark_id": 9, "semester": 4, "student_id": 1, "total_marks": 268, "student_name": "Bhargavi", "subject_code": "BCS34", "subject_name": "asdfg", "external_marks": 234, "internal_marks": 34}, {"result": "P", "mark_id": 9, "semester": 4, "student_id": 1, "total_marks": 268, "student_name": "Bhargavi", "subject_code": "BCS34", "subject_name": "asdfg", "external_marks": 234, "internal_marks": 34}, {"result": "F", "mark_id": 14, "semester": 1, "student_id": 1, "total_marks": 2, "student_name": "afreen", "subject_code": "5", "subject_name": "DSA", "external_marks": 1, "internal_marks": 1}, {"result": "F", "mark_id": 14, "semester": 1, "student_id": 1, "total_marks": 2, "student_name": "afreen", "subject_code": "5", "subject_name": "DSA", "external_marks": 1, "internal_marks": 1}, {"result": "F", "mark_id": 14, "semester": 1, "student_id": 1, "total_marks": 2, "student_name": "afreen", "subject_code": "5", "subject_name": "DSA", "external_marks": 1, "internal_marks": 1}, {"result": "F", "mark_id": 14, "semester": 1, "student_id": 1, "total_marks": 2, "student_name": "afreen", "subject_code": "5", "subject_name": "DSA", "external_marks": 1, "internal_marks": 1}, {"result": "F", "mark_id": 14, "semester": 1, "student_id": 1, "total_marks": 2, "student_name": "afreen", "subject_code": "5", "subject_name": "DSA", "external_marks": 1, "internal_marks": 1}, {"result": "F", "mark_id": 14, "semester": 1, "student_id": 1, "total_marks": 2, "student_name": "afreen", "subject_code": "5", "subject_name": "DSA", "external_marks": 1, "internal_marks": 1}, {"result": "F", "mark_id": 14, "semester": 1, "student_id": 1, "total_marks": 2, "student_name": "afreen", "subject_code": "5", "subject_name": "DSA", "external_marks": 1, "internal_marks": 1}, {"result": "F", "mark_id": 14, "semester": 1, "student_id": 1, "total_marks": 2, "student_name": "afreen", "subject_code": "5", "subject_name": "DSA", "external_marks": 1, "internal_marks": 1}, {"result": "F", "mark_id": 14, "semester": 1, "student_id": 1, "total_marks": 2, "student_name": "afreen", "subject_code": "5", "subject_name": "DSA", "external_marks": 1, "internal_marks": 1}, {"result": "F", "mark_id": 14, "semester": 1, "student_id": 1, "total_marks": 2, "student_name": "afreen", "subject_code": "5", "subject_name": "DSA", "external_marks": 1, "internal_marks": 1}, {"result": "F", "mark_id": 14, "semester": 1, "student_id": 1, "total_marks": 2, "student_name": "afreen", "subject_code": "5", "subject_name": "DSA", "external_marks": 1, "internal_marks": 1}, {"result": "F", "mark_id": 14, "semester": 1, "student_id": 1, "total_marks": 2, "student_name": "afreen", "subject_code": "5", "subject_name": "DSA", "external_marks": 1, "internal_marks": 1}, {"result": "F", "mark_id": 13, "semester": 1, "student_id": 1, "total_marks": 4, "student_name": "aadya", "subject_code": "2", "subject_name": "daa", "external_marks": 1, "internal_marks": 3}, {"result": "F", "mark_id": 13, "semester": 1, "student_id": 1, "total_marks": 4, "student_name": "aadya", "subject_code": "2", "subject_name": "daa", "external_marks": 1, "internal_marks": 3}, {"result": "F", "mark_id": 13, "semester": 1, "student_id": 1, "total_marks": 4, "student_name": "aadya", "subject_code": "2", "subject_name": "daa", "external_marks": 1, "internal_marks": 3}, {"result": "F", "mark_id": 13, "semester": 1, "student_id": 1, "total_marks": 4, "student_name": "aadya", "subject_code": "2", "subject_name": "daa", "external_marks": 1, "internal_marks": 3}, {"result": "F", "mark_id": 13, "semester": 1, "student_id": 1, "total_marks": 4, "student_name": "aadya", "subject_code": "2", "subject_name": "daa", "external_marks": 1, "internal_marks": 3}, {"result": "F", "mark_id": 13, "semester": 1, "student_id": 1, "total_marks": 4, "student_name": "aadya", "subject_code": "2", "subject_name": "daa", "external_marks": 1, "internal_marks": 3}, {"result": "F", "mark_id": 13, "semester": 1, "student_id": 1, "total_marks": 4, "student_name": "aadya", "subject_code": "2", "subject_name": "daa", "external_marks": 1, "internal_marks": 3}, {"result": "F", "mark_id": 13, "semester": 1, "student_id": 1, "total_marks": 4, "student_name": "aadya", "subject_code": "2", "subject_name": "daa", "external_marks": 1, "internal_marks": 3}, {"result": "F", "mark_id": 13, "semester": 1, "student_id": 1, "total_marks": 4, "student_name": "aadya", "subject_code": "2", "subject_name": "daa", "external_marks": 1, "internal_marks": 3}, {"result": "F", "mark_id": 13, "semester": 1, "student_id": 1, "total_marks": 4, "student_name": "aadya", "subject_code": "2", "subject_name": "daa", "external_marks": 1, "internal_marks": 3}, {"result": "F", "mark_id": 13, "semester": 1, "student_id": 1, "total_marks": 4, "student_name": "aadya", "subject_code": "2", "subject_name": "daa", "external_marks": 1, "internal_marks": 3}, {"result": "F", "mark_id": 13, "semester": 1, "student_id": 1, "total_marks": 4, "student_name": "aadya", "subject_code": "2", "subject_name": "daa", "external_marks": 1, "internal_marks": 3}, {"result": "P", "mark_id": 15, "semester": 3, "student_id": 1, "total_marks": 165, "student_name": "afreen", "subject_code": "Bcf5", "subject_name": "kjy", "external_marks": 98, "internal_marks": 67}, {"result": "P", "mark_id": 15, "semester": 3, "student_id": 1, "total_marks": 165, "student_name": "afreen", "subject_code": "Bcf5", "subject_name": "kjy", "external_marks": 98, "internal_marks": 67}, {"result": "P", "mark_id": 15, "semester": 3, "student_id": 1, "total_marks": 165, "student_name": "afreen", "subject_code": "Bcf5", "subject_name": "kjy", "external_marks": 98, "internal_marks": 67}, {"result": "P", "mark_id": 15, "semester": 3, "student_id": 1, "total_marks": 165, "student_name": "afreen", "subject_code": "Bcf5", "subject_name": "kjy", "external_marks": 98, "internal_marks": 67}, {"result": "P", "mark_id": 15, "semester": 3, "student_id": 1, "total_marks": 165, "student_name": "afreen", "subject_code": "Bcf5", "subject_name": "kjy", "external_marks": 98, "internal_marks": 67}, {"result": "P", "mark_id": 15, "semester": 3, "student_id": 1, "total_marks": 165, "student_name": "afreen", "subject_code": "Bcf5", "subject_name": "kjy", "external_marks": 98, "internal_marks": 67}, {"result": "P", "mark_id": 15, "semester": 3, "student_id": 1, "total_marks": 165, "student_name": "afreen", "subject_code": "Bcf5", "subject_name": "kjy", "external_marks": 98, "internal_marks": 67}, {"result": "P", "mark_id": 15, "semester": 3, "student_id": 1, "total_marks": 165, "student_name": "afreen", "subject_code": "Bcf5", "subject_name": "kjy", "external_marks": 98, "internal_marks": 67}, {"result": "P", "mark_id": 15, "semester": 3, "student_id": 1, "total_marks": 165, "student_name": "afreen", "subject_code": "Bcf5", "subject_name": "kjy", "external_marks": 98, "internal_marks": 67}, {"result": "P", "mark_id": 15, "semester": 3, "student_id": 1, "total_marks": 165, "student_name": "afreen", "subject_code": "Bcf5", "subject_name": "kjy", "external_marks": 98, "internal_marks": 67}, {"result": "P", "mark_id": 15, "semester": 3, "student_id": 1, "total_marks": 165, "student_name": "afreen", "subject_code": "Bcf5", "subject_name": "kjy", "external_marks": 98, "internal_marks": 67}, {"result": "P", "mark_id": 15, "semester": 3, "student_id": 1, "total_marks": 165, "student_name": "afreen", "subject_code": "Bcf5", "subject_name": "kjy", "external_marks": 98, "internal_marks": 67}]	2025-11-22 05:52:37.271336+05:30
\.


--
-- Data for Name: department; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.department (department_id, department_name, created_at, updated_at) FROM stdin;
1	Computer Science	2025-11-22 02:07:22.597948+05:30	2025-11-22 02:07:22.597948+05:30
\.


--
-- Data for Name: department_activities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.department_activities (event_id, department_id, event_title, event_details, event_date, "timestamp", created_by) FROM stdin;
11	1	am	hjk	2025-11-05	2025-11-22 02:22:11.859755+05:30	1
\.


--
-- Data for Name: department_circulars; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.department_circulars (circular_id, department_id, title, circular_details, file_path, "timestamp", created_by) FROM stdin;
20	1	bhy	lkjhgfds	\N	2025-11-22 02:22:20.946986+05:30	1
\.


--
-- Data for Name: faculty; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.faculty (faculty_id, faculty_name, email, password_hash, department_id, login_info, created_at, updated_at) FROM stdin;
1	faculty1	faculty1@gmail.com	$2a$10$YpFMPm06Doe7fEuUzogFpu7LKpLfEmGNerB7Pcj5sTZSQ5l4txMIy	\N	\N	2025-11-21 14:46:06.320416+05:30	2025-11-21 14:46:06.320416+05:30
\.


--
-- Data for Name: faculty_courses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.faculty_courses (course_id, faculty_id, course_code, course_name, materials, notifications, semester, academic_year, created_at, updated_at) FROM stdin;
3	1	1	bha	[{"path": "uploads/4674b9bbdda639abd135a2f3f775774f", "filename": "student-certificates.pdf"}]	\N	\N	\N	2025-11-22 01:54:05.488598+05:30	2025-11-22 01:54:05.488598+05:30
4	1	1	bha	[{"path": "uploads/020b5c806ba7e4c6750ea9328e739f21", "filename": "student-certificates.pdf"}]	\N	\N	\N	2025-11-22 02:05:38.531107+05:30	2025-11-22 02:05:38.531107+05:30
\.


--
-- Data for Name: faculty_profile; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.faculty_profile (faculty_id, courses, department_id, time_details, bio, created_at, updated_at) FROM stdin;
1	{"course_list": ["java"]}	1	{}	me	2025-11-22 02:07:47.398901+05:30	2025-11-22 02:15:52.637765+05:30
\.


--
-- Data for Name: fee_structure; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fee_structure (fee_id, structure_details, department_id, academic_year, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: hostel_routes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.hostel_routes (route_id, transport_details, route_name, active, created_at, updated_at) FROM stdin;
1	{"description": "dfg "}	yth	t	2025-11-21 22:35:00.271935+05:30	2025-11-21 22:35:00.271935+05:30
\.


--
-- Data for Name: login_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.login_logs (log_id, user_id, user_type, login_date, login_timestamp, ip_address, user_agent) FROM stdin;
1	1	student	2025-11-21	2025-11-21 14:34:08.283499+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
2	1	student	2025-11-21	2025-11-21 14:34:12.507362+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
3	1	student	2025-11-21	2025-11-21 14:36:49.713606+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
4	1	faculty	2025-11-21	2025-11-21 14:46:17.969913+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
5	1	faculty	2025-11-21	2025-11-21 14:47:12.46385+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
6	1	department	2025-11-21	2025-11-21 14:50:29.314747+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
7	1	admin	2025-11-21	2025-11-21 14:52:12.379286+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
8	1	student	2025-11-21	2025-11-21 14:55:26.56892+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
9	1	faculty	2025-11-21	2025-11-21 15:04:58.197021+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
10	1	student	2025-11-21	2025-11-21 15:09:37.276461+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
11	1	student	2025-11-21	2025-11-21 15:27:17.443643+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
12	1	department	2025-11-21	2025-11-21 15:29:35.62644+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
13	1	student	2025-11-21	2025-11-21 15:33:17.701842+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
14	1	student	2025-11-21	2025-11-21 15:34:45.376072+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
15	1	student	2025-11-21	2025-11-21 15:48:31.381777+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
16	1	department	2025-11-21	2025-11-21 15:49:40.671523+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
17	1	student	2025-11-21	2025-11-21 15:57:56.810981+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
18	1	student	2025-11-21	2025-11-21 18:02:59.566211+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
19	1	department	2025-11-21	2025-11-21 18:03:52.085126+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
20	1	faculty	2025-11-21	2025-11-21 18:04:38.803653+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
21	2	admin	2025-11-21	2025-11-21 18:06:21.188104+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
22	1	student	2025-11-21	2025-11-21 18:15:45.287595+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
23	1	student	2025-11-21	2025-11-21 18:51:35.808351+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
24	1	department	2025-11-21	2025-11-21 19:14:44.65592+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
25	1	department	2025-11-21	2025-11-21 19:22:16.032425+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
26	1	student	2025-11-21	2025-11-21 19:32:47.745233+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
27	1	department	2025-11-21	2025-11-21 19:35:08.81613+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
28	1	faculty	2025-11-21	2025-11-21 19:35:45.765879+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
29	1	student	2025-11-21	2025-11-21 19:42:50.686053+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
30	1	student	2025-11-21	2025-11-21 19:45:07.003047+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
31	1	department	2025-11-21	2025-11-21 19:59:22.649776+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
32	1	student	2025-11-21	2025-11-21 19:59:45.564573+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
33	1	department	2025-11-21	2025-11-21 20:09:16.671563+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
34	1	student	2025-11-21	2025-11-21 20:14:18.5937+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
35	1	department	2025-11-21	2025-11-21 20:15:18.923141+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
36	1	student	2025-11-21	2025-11-21 20:22:09.372307+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
37	1	department	2025-11-21	2025-11-21 20:22:35.89508+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
38	1	student	2025-11-21	2025-11-21 20:27:04.316346+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
39	1	student	2025-11-21	2025-11-21 20:38:05.416505+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
40	1	faculty	2025-11-21	2025-11-21 20:52:59.403669+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
41	1	student	2025-11-21	2025-11-21 21:51:33.119389+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
42	1	department	2025-11-21	2025-11-21 21:59:14.349523+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
43	1	faculty	2025-11-21	2025-11-21 22:00:42.208905+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
44	2	admin	2025-11-21	2025-11-21 22:01:06.296705+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
45	1	student	2025-11-21	2025-11-21 22:02:27.026909+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
46	1	department	2025-11-21	2025-11-21 22:02:58.887073+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
47	1	student	2025-11-21	2025-11-21 22:05:17.124284+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
48	1	department	2025-11-21	2025-11-21 22:07:24.106511+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
49	1	student	2025-11-21	2025-11-21 22:12:45.664392+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
50	1	faculty	2025-11-21	2025-11-21 22:13:08.446748+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
51	1	student	2025-11-21	2025-11-21 22:13:35.838938+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
52	1	faculty	2025-11-21	2025-11-21 22:17:50.771253+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
53	1	department	2025-11-21	2025-11-21 22:26:25.07972+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
54	2	admin	2025-11-21	2025-11-21 22:29:14.252492+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
55	1	student	2025-11-21	2025-11-21 23:24:21.359142+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
56	1	student	2025-11-21	2025-11-21 23:28:28.226718+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
57	1	faculty	2025-11-21	2025-11-21 23:28:44.681924+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
58	1	department	2025-11-21	2025-11-21 23:30:52.009288+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
59	2	admin	2025-11-21	2025-11-21 23:32:54.906266+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
60	2	admin	2025-11-21	2025-11-21 23:33:51.312773+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
61	2	admin	2025-11-21	2025-11-21 23:34:13.48466+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
62	1	student	2025-11-22	2025-11-22 00:02:47.582938+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
63	1	faculty	2025-11-22	2025-11-22 00:04:27.291905+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
64	1	department	2025-11-22	2025-11-22 00:05:38.660197+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
65	2	admin	2025-11-22	2025-11-22 00:06:27.663853+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
66	1	student	2025-11-22	2025-11-22 00:11:53.920653+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
67	1	student	2025-11-22	2025-11-22 00:14:01.000052+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
68	1	student	2025-11-22	2025-11-22 00:23:09.584233+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
69	1	student	2025-11-22	2025-11-22 00:35:47.606215+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
70	1	faculty	2025-11-22	2025-11-22 00:36:32.282491+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
71	3	department	2025-11-22	2025-11-22 00:38:48.81875+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
72	2	admin	2025-11-22	2025-11-22 00:41:47.313716+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
73	2	admin	2025-11-22	2025-11-22 00:42:23.720234+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
74	1	student	2025-11-22	2025-11-22 00:42:54.673255+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
75	1	student	2025-11-22	2025-11-22 00:43:10.240701+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
76	1	student	2025-11-22	2025-11-22 00:43:34.001121+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
77	1	student	2025-11-22	2025-11-22 00:52:18.656725+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
78	1	faculty	2025-11-22	2025-11-22 01:33:48.011677+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
79	1	faculty	2025-11-22	2025-11-22 01:53:17.229211+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
80	1	student	2025-11-22	2025-11-22 01:54:41.240227+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
81	1	faculty	2025-11-22	2025-11-22 01:56:08.723615+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
82	1	department	2025-11-22	2025-11-22 01:58:26.96759+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
83	1	faculty	2025-11-22	2025-11-22 02:00:00.02756+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
84	1	student	2025-11-22	2025-11-22 02:12:44.209857+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
85	1	faculty	2025-11-22	2025-11-22 02:13:33.18506+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
86	1	department	2025-11-22	2025-11-22 02:18:48.153362+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
87	1	student	2025-11-22	2025-11-22 02:50:39.514356+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
88	1	faculty	2025-11-22	2025-11-22 02:59:31.81605+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
89	1	student	2025-11-22	2025-11-22 03:01:32.871333+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
90	1	faculty	2025-11-22	2025-11-22 03:15:06.816914+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
91	1	department	2025-11-22	2025-11-22 03:18:20.510973+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
92	2	admin	2025-11-22	2025-11-22 03:20:22.545171+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
93	2	admin	2025-11-22	2025-11-22 03:27:38.434606+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
94	1	department	2025-11-22	2025-11-22 03:30:13.952055+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
95	1	faculty	2025-11-22	2025-11-22 03:30:52.949985+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
96	1	faculty	2025-11-22	2025-11-22 03:34:11.090648+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
97	1	student	2025-11-22	2025-11-22 03:34:29.401121+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
98	1	student	2025-11-22	2025-11-22 03:38:17.427901+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
99	1	faculty	2025-11-22	2025-11-22 03:39:29.106235+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
100	1	department	2025-11-22	2025-11-22 03:40:16.332027+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
101	2	admin	2025-11-22	2025-11-22 03:42:18.540138+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
102	1	student	2025-11-22	2025-11-22 03:59:55.256084+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
103	1	student	2025-11-22	2025-11-22 04:27:25.625325+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
104	1	student	2025-11-22	2025-11-22 04:31:18.987642+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
105	1	student	2025-11-22	2025-11-22 04:42:12.979164+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
106	1	student	2025-11-22	2025-11-22 04:42:54.698226+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
107	1	student	2025-11-22	2025-11-22 04:51:52.590532+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
108	1	student	2025-11-22	2025-11-22 04:56:01.506092+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
109	1	student	2025-11-22	2025-11-22 05:11:56.422914+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
110	1	student	2025-11-22	2025-11-22 05:12:15.542965+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
111	1	student	2025-11-22	2025-11-22 05:14:17.196891+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
112	1	student	2025-11-22	2025-11-22 05:23:52.550655+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
113	1	student	2025-11-22	2025-11-22 05:27:57.081783+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
114	3	department	2025-11-22	2025-11-22 05:29:46.852332+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
115	1	student	2025-11-22	2025-11-22 05:30:28.687486+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
116	1	student	2025-11-22	2025-11-22 05:30:44.73275+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
117	3	department	2025-11-22	2025-11-22 05:31:12.950434+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
118	1	student	2025-11-22	2025-11-22 05:46:50.952943+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
119	3	department	2025-11-22	2025-11-22 05:47:18.522442+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
120	1	student	2025-11-22	2025-11-22 05:47:38.809124+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
121	3	department	2025-11-22	2025-11-22 05:48:07.066431+05:30	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0
\.


--
-- Data for Name: marks_student; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.marks_student (mark_id, student_id, usn, student_name, semester, subject_code, subject_name, internal_marks, external_marks, total_marks, result, exam_type, exam_date, announced_date, uploaded_by, academic_year, marks_data, performance_metrics, created_at, updated_at, approval_status, approved_by, approved_at, approval_remarks) FROM stdin;
1	\N	4GW23CS125	VIJETHA K	4	BCS401	ANALYSIS & DESIGN OF ALGORITHMS	43	40	83	P	Semester Result	2025-11-21	\N	\N	\N	{}	{}	2025-11-21 17:57:40.867949+05:30	2025-11-21 17:57:40.867949+05:30	approved	\N	\N	\N
2	\N	4GW23CS125	VIJETHA K	4	BCS402	MICROCONTROLLERS	44	33	77	P	Semester Result	2025-11-21	\N	\N	\N	{}	{}	2025-11-21 17:57:40.867949+05:30	2025-11-21 17:57:40.867949+05:30	approved	\N	\N	\N
5	1	4VV23CS034	Bhargavi	4	bh23	sffg	345	24	369	P	Semester Result	2025-11-21	\N	1	\N	{}	{}	2025-11-21 20:08:30.330235+05:30	2025-11-21 20:08:30.330235+05:30	approved	\N	\N	\N
6	1	4VV23CS034	Bhargavi	4	BCS3	analysis	67	76	143	P	Semester Result	2025-11-21	\N	1	\N	{}	{}	2025-11-21 20:15:01.747136+05:30	2025-11-21 20:15:01.747136+05:30	approved	\N	\N	\N
7	1	4VV23CS034	Bhargavi	4	BCS34	analysis	23	23	46	P	Semester Result	2025-11-21	\N	1	\N	{}	{}	2025-11-21 20:22:27.217896+05:30	2025-11-21 20:22:27.217896+05:30	approved	\N	\N	\N
12	1	4VV23CS034	aadya	3	bh23	lulo	30	90	120	P	Semester Result	2025-11-21	\N	1	24	{}	{}	2025-11-22 01:55:23.728936+05:30	2025-11-22 02:28:47.826797+05:30	approved	1	2025-11-22 02:28:47.826797+05:30	
10	1	4VV23CS034	Bhargavi Srinivas	3	bvds	bhagt	90	9	99	P	Semester Result	2025-11-21	\N	1	\N	{}	{}	2025-11-21 22:02:44.778255+05:30	2025-11-22 02:28:52.000941+05:30	rejected	1	2025-11-22 02:28:52.000941+05:30	
11	1	4VV23CS034	Ashmita	4	bhg54	nhy	98	78	176	P	Semester Result	2025-11-21	\N	1	\N	{}	{}	2025-11-22 00:04:03.414569+05:30	2025-11-22 03:19:10.096239+05:30	rejected	1	2025-11-22 03:19:10.096239+05:30	
9	1	4VV23CS034	Bhargavi	4	BCS34	asdfg	34	234	268	P	Semester Result	2025-11-21	\N	1	\N	{}	{}	2025-11-21 20:33:05.221237+05:30	2025-11-22 03:19:15.900751+05:30	approved	1	2025-11-22 03:19:15.900751+05:30	
14	1	4VV23CS034	afreen	1	5	DSA	1	1	2	F	Semester Result	2025-11-21	\N	1	24	{}	{}	2025-11-22 05:29:14.315762+05:30	2025-11-22 05:45:44.103095+05:30	approved	3	2025-11-22 05:45:44.103095+05:30	
13	1	4VV23CS034	aadya	1	2	daa	3	1	4	F	Semester Result	2025-11-21	\N	1	2024-25	{}	{}	2025-11-22 05:15:18.337475+05:30	2025-11-22 05:46:31.487279+05:30	approved	3	2025-11-22 05:46:31.487279+05:30	
15	1	4VV23CS034	afreen	3	Bcf5	kjy	67	98	165	P	Semester Result	2025-11-22	\N	1	23	{}	{}	2025-11-22 05:47:58.531121+05:30	2025-11-22 05:47:58.531121+05:30	pending	\N	\N	\N
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (notification_id, user_id, user_type, title, message, is_read, created_at) FROM stdin;
1	1	student	New Activity: am	hjk	f	2025-11-22 02:22:11.886721+05:30
2	1	faculty	New Activity: am	hjk	f	2025-11-22 02:22:11.896212+05:30
3	1	admin	New Activity: am	hjk	f	2025-11-22 02:22:11.89914+05:30
4	2	admin	New Activity: am	hjk	f	2025-11-22 02:22:11.899917+05:30
5	3	admin	New Activity: am	hjk	f	2025-11-22 02:22:11.900857+05:30
6	1	student	New Circular: bhy	lkjhgfds	f	2025-11-22 02:22:20.950562+05:30
7	1	faculty	New Circular: bhy	lkjhgfds	f	2025-11-22 02:22:20.951222+05:30
8	1	admin	New Circular: bhy	lkjhgfds	f	2025-11-22 02:22:20.951829+05:30
9	2	admin	New Circular: bhy	lkjhgfds	f	2025-11-22 02:22:20.952197+05:30
10	3	admin	New Circular: bhy	lkjhgfds	f	2025-11-22 02:22:20.952859+05:30
\.


--
-- Data for Name: student; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.student (student_id, usn, name, address, phone, parent_phone, email, password_hash, department_id, batch_year, created_at, updated_at) FROM stdin;
1	4VV23CS034	afreen	bhat	+91123456666	+91123456676	bhargavi@gmail.com	$2a$10$HEoc3oQP3p7TheYMUQieLuXapB0TWXIqmj/KoGO3G..29CzLKAm72	\N	\N	2025-11-21 14:34:03.131819+05:30	2025-11-22 05:28:52.390905+05:30
\.


--
-- Data for Name: student_attendance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.student_attendance (attendance_id, student_id, faculty_id, course_id, date, status, created_at) FROM stdin;
2	1	1	\N	2025-11-21	present	2025-11-22 01:56:33.799388+05:30
3	1	1	\N	2025-11-21	present	2025-11-22 02:05:53.367871+05:30
4	1	1	\N	2025-11-21	absent	2025-11-22 02:18:13.098754+05:30
\.


--
-- Data for Name: student_certificates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.student_certificates (certificate_id, student_id, certificate_type, competition, internship, workshop, file_path, issued_by, issue_date, created_at, updated_at, approval_status, approved_role, approved_by) FROM stdin;
1	1	pdf	aiml	\N	\N	uploads\\ae041a14c87357e92fd5bf8004ebde29	\N	\N	2025-11-21 22:07:08.519635+05:30	2025-11-21 22:07:08.519635+05:30	pending	\N	\N
2	1	acse	bha	\N	\N	uploads\\33a3e097e801498ea6fd831a70de6411	\N	\N	2025-11-21 23:27:08.929855+05:30	2025-11-21 23:27:08.929855+05:30	pending	\N	\N
3	1	yu	\N	\N	\N	uploads\\edf7d35c55004e9fe3629eaf8cc859b5	\N	\N	2025-11-22 01:55:42.746884+05:30	2025-11-22 01:55:42.746884+05:30	pending	\N	\N
4	1	cghcf	awf	eafg	fcjc	uploads\\eba71783bd0a5647b123c5db26ab7529	\N	\N	2025-11-22 05:16:09.620365+05:30	2025-11-22 05:16:09.620365+05:30	pending	\N	\N
\.


--
-- Data for Name: student_feedback; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.student_feedback (feedback_id, student_id, feedback, rating, created_at) FROM stdin;
1	1	all good	5	2025-11-21 22:12:53.950057+05:30
2	1	thjm,	5	2025-11-21 22:17:33.813407+05:30
3	1	 vvh	5	2025-11-22 05:17:14.846302+05:30
\.


--
-- Data for Name: student_internships; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.student_internships (internship_id, student_id, stack_data, company, start_date, end_date, stipend, offer_letter_path, completion_certificate_path, created_at, updated_at, approval_status, approved_role, approved_by) FROM stdin;
1	1	{"technologies": ["jb"]}	lnt	2025-11-20	2025-11-26	\N	\N	\N	2025-11-22 00:36:03.797281+05:30	2025-11-22 00:36:03.797281+05:30	pending	\N	\N
2	1	{"technologies": ["fh"]}	gjcfcfj	2025-11-21	2025-11-27	\N	\N	\N	2025-11-22 05:16:46.719595+05:30	2025-11-22 05:16:46.719595+05:30	pending	\N	\N
\.


--
-- Data for Name: student_leave_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.student_leave_requests (leave_id, student_id, leave_details, from_date, to_date, status, "timestamp", reviewed_by, review_timestamp, remarks) FROM stdin;
1	1	I'm ill	2025-11-22	2025-11-23	pending	2025-11-21 14:38:14.795757+05:30	\N	\N	\N
2	1	i'm feeling old	2025-11-07	2025-11-19	approved	2025-11-21 15:28:10.982878+05:30	1	2025-11-21 15:33:10.290965+05:30	\N
4	1	fucntion	2025-11-11	2025-11-27	approved	2025-11-21 18:03:38.242736+05:30	1	2025-11-21 18:03:56.40156+05:30	\N
14	1	bjj	2025-11-14	2025-11-25	approved	2025-11-22 05:17:09.163298+05:30	\N	2025-11-22 05:53:54.19209+05:30	(Approved by department)
8	1	fggh	2025-11-22	2025-11-22	approved	2025-11-21 20:14:33.154624+05:30	1	2025-11-21 20:19:38.297004+05:30	\N
7	1	bhar	2025-11-26	2025-11-22	approved	2025-11-21 20:08:50.299447+05:30	1	2025-11-21 20:19:39.299404+05:30	\N
9	1	dfbnm	2025-11-20	2025-11-22	approved	2025-11-21 20:28:43.035918+05:30	1	2025-11-22 01:59:02.405807+05:30	\N
10	1	hgf	2025-11-22	2025-11-23	approved	2025-11-21 20:38:22.718128+05:30	1	2025-11-22 01:59:03.510846+05:30	\N
11	1	NDSJWOKW	2025-11-15	2025-11-17	approved	2025-11-21 21:58:44.108223+05:30	1	2025-11-22 01:59:04.603408+05:30	\N
12	1	bhar	2025-11-22	2025-11-24	approved	2025-11-21 23:25:29.190227+05:30	1	2025-11-22 01:59:05.399051+05:30	\N
13	1	pop	2025-11-21	2025-11-28	approved	2025-11-22 00:03:32.311327+05:30	1	2025-11-22 01:59:07.540493+05:30	\N
6	1	wdcsdfg	2025-11-13	2025-11-25	approved	2025-11-21 19:59:11.157052+05:30	1	2025-11-22 01:59:08.572832+05:30	\N
5	1	hyiod	2025-11-14	2025-11-22	approved	2025-11-21 19:53:19.373458+05:30	1	2025-11-22 02:19:06.179612+05:30	\N
3	1	I'm not good	2025-11-22	2025-11-24	approved	2025-11-21 15:49:27.374014+05:30	1	2025-11-22 02:28:57.567566+05:30	\N
15	1	not welllll	2025-11-13	2025-11-20	pending	2025-11-22 05:47:07.922045+05:30	\N	\N	\N
\.


--
-- Data for Name: student_mark; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.student_mark  FROM stdin;
\.


--
-- Data for Name: student_marks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.student_marks (mark_id, student_id, usn, student_name, semester, subject_code, subject_name, internal_marks, external_marks, total_marks, result, grade, grade_points, exam_type, exam_date, announced_date, course_id, uploaded_by, academic_year, marks_data, performance_metrics, created_at, updated_at) FROM stdin;
1	\N	4GW23CS125	VIJETHA K	4	BCS401	ANALYSIS & DESIGN OF ALGORITHMS	43	40	83	P	\N	\N	Semester Result	\N	2025-07-31	\N	\N	\N	{}	{}	2025-11-21 17:40:22.283016+05:30	2025-11-21 17:40:22.283016+05:30
2	\N	4GW23CS125	VIJETHA K	4	BCS402	MICROCONTROLLERS	44	33	77	P	\N	\N	Semester Result	\N	2025-07-31	\N	\N	\N	{}	{}	2025-11-21 17:40:22.283016+05:30	2025-11-21 17:40:22.283016+05:30
3	\N	4GW23CS125	VIJETHA K	4	BCS403	DATABASE MANAGEMENT SYSTEMS	48	21	69	P	\N	\N	Semester Result	\N	2025-07-31	\N	\N	\N	{}	{}	2025-11-21 17:40:22.283016+05:30	2025-11-21 17:40:22.283016+05:30
\.


--
-- Data for Name: student_projects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.student_projects (project_id, student_id, project_name, domain, impact, guide_id, start_date, end_date, created_at, updated_at) FROM stdin;
1	1	aiml	ai	dfghjk	\N	\N	\N	2025-11-21 22:14:26.660766+05:30	2025-11-21 22:14:26.660766+05:30
2	1	aimll	ml	bhar	\N	\N	\N	2025-11-21 23:26:13.584303+05:30	2025-11-21 23:26:13.584303+05:30
3	1	fchcfkvg	cfhdcfj	fvhfh	\N	\N	\N	2025-11-22 05:16:30.227249+05:30	2025-11-22 05:16:30.227249+05:30
\.


--
-- Name: admin_admin_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.admin_admin_id_seq', 3, true);


--
-- Name: admin_features_feature_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.admin_features_feature_id_seq', 1, true);


--
-- Name: audit_logs_audit_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_logs_audit_id_seq', 6, true);


--
-- Name: chat_history_chat_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.chat_history_chat_id_seq', 58, true);


--
-- Name: department_activities_event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.department_activities_event_id_seq', 11, true);


--
-- Name: department_circulars_circular_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.department_circulars_circular_id_seq', 20, true);


--
-- Name: department_department_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.department_department_id_seq', 1, false);


--
-- Name: faculty_courses_course_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.faculty_courses_course_id_seq', 4, true);


--
-- Name: faculty_faculty_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.faculty_faculty_id_seq', 1, true);


--
-- Name: fee_structure_fee_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.fee_structure_fee_id_seq', 3, true);


--
-- Name: hostel_routes_route_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.hostel_routes_route_id_seq', 1, true);


--
-- Name: login_logs_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.login_logs_log_id_seq', 121, true);


--
-- Name: marks_student_mark_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.marks_student_mark_id_seq', 15, true);


--
-- Name: notifications_notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_notification_id_seq', 10, true);


--
-- Name: student_attendance_attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.student_attendance_attendance_id_seq', 4, true);


--
-- Name: student_certificates_certificate_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.student_certificates_certificate_id_seq', 4, true);


--
-- Name: student_feedback_feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.student_feedback_feedback_id_seq', 3, true);


--
-- Name: student_internships_internship_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.student_internships_internship_id_seq', 2, true);


--
-- Name: student_leave_requests_leave_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.student_leave_requests_leave_id_seq', 15, true);


--
-- Name: student_marks_mark_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.student_marks_mark_id_seq', 3, true);


--
-- Name: student_projects_project_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.student_projects_project_id_seq', 3, true);


--
-- Name: student_student_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.student_student_id_seq', 4, true);


--
-- Name: admin_features admin_features_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_features
    ADD CONSTRAINT admin_features_pkey PRIMARY KEY (feature_id);


--
-- Name: admin admin_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_pkey PRIMARY KEY (admin_id);


--
-- Name: admin admin_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_username_key UNIQUE (username);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (audit_id);


--
-- Name: chat_history chat_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_history
    ADD CONSTRAINT chat_history_pkey PRIMARY KEY (chat_id);


--
-- Name: department_activities department_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_activities
    ADD CONSTRAINT department_activities_pkey PRIMARY KEY (event_id);


--
-- Name: department_circulars department_circulars_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_circulars
    ADD CONSTRAINT department_circulars_pkey PRIMARY KEY (circular_id);


--
-- Name: department department_department_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department
    ADD CONSTRAINT department_department_name_key UNIQUE (department_name);


--
-- Name: department department_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department
    ADD CONSTRAINT department_pkey PRIMARY KEY (department_id);


--
-- Name: faculty_courses faculty_courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faculty_courses
    ADD CONSTRAINT faculty_courses_pkey PRIMARY KEY (course_id);


--
-- Name: faculty faculty_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faculty
    ADD CONSTRAINT faculty_email_key UNIQUE (email);


--
-- Name: faculty faculty_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faculty
    ADD CONSTRAINT faculty_pkey PRIMARY KEY (faculty_id);


--
-- Name: faculty_profile faculty_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faculty_profile
    ADD CONSTRAINT faculty_profile_pkey PRIMARY KEY (faculty_id);


--
-- Name: fee_structure fee_structure_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_structure
    ADD CONSTRAINT fee_structure_pkey PRIMARY KEY (fee_id);


--
-- Name: hostel_routes hostel_routes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hostel_routes
    ADD CONSTRAINT hostel_routes_pkey PRIMARY KEY (route_id);


--
-- Name: login_logs login_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.login_logs
    ADD CONSTRAINT login_logs_pkey PRIMARY KEY (log_id);


--
-- Name: marks_student marks_student_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marks_student
    ADD CONSTRAINT marks_student_pkey PRIMARY KEY (mark_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);


--
-- Name: student_attendance student_attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_attendance
    ADD CONSTRAINT student_attendance_pkey PRIMARY KEY (attendance_id);


--
-- Name: student_attendance student_attendance_student_id_course_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_attendance
    ADD CONSTRAINT student_attendance_student_id_course_id_date_key UNIQUE (student_id, course_id, date);


--
-- Name: student_certificates student_certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_certificates
    ADD CONSTRAINT student_certificates_pkey PRIMARY KEY (certificate_id);


--
-- Name: student student_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT student_email_key UNIQUE (email);


--
-- Name: student_feedback student_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_feedback
    ADD CONSTRAINT student_feedback_pkey PRIMARY KEY (feedback_id);


--
-- Name: student_internships student_internships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_internships
    ADD CONSTRAINT student_internships_pkey PRIMARY KEY (internship_id);


--
-- Name: student_leave_requests student_leave_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_leave_requests
    ADD CONSTRAINT student_leave_requests_pkey PRIMARY KEY (leave_id);


--
-- Name: student_marks student_marks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_marks
    ADD CONSTRAINT student_marks_pkey PRIMARY KEY (mark_id);


--
-- Name: student student_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT student_pkey PRIMARY KEY (student_id);


--
-- Name: student_projects student_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_projects
    ADD CONSTRAINT student_projects_pkey PRIMARY KEY (project_id);


--
-- Name: student student_usn_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT student_usn_key UNIQUE (usn);


--
-- Name: idx_chat_history_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_history_user ON public.chat_history USING btree (user_id, user_type, created_at);


--
-- Name: idx_faculty_department; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_faculty_department ON public.faculty USING btree (department_id);


--
-- Name: idx_login_logs_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_login_logs_user ON public.login_logs USING btree (user_id, user_type);


--
-- Name: idx_marks_student_approval; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_marks_student_approval ON public.marks_student USING btree (approval_status);


--
-- Name: idx_marks_student_semester; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_marks_student_semester ON public.marks_student USING btree (semester);


--
-- Name: idx_marks_student_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_marks_student_status ON public.marks_student USING btree (approval_status);


--
-- Name: idx_marks_student_subject_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_marks_student_subject_code ON public.marks_student USING btree (subject_code);


--
-- Name: idx_marks_student_usn; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_marks_student_usn ON public.marks_student USING btree (usn);


--
-- Name: idx_notifications_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id, user_type, is_read);


--
-- Name: idx_student_department; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_student_department ON public.student USING btree (department_id);


--
-- Name: idx_student_leave_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_student_leave_status ON public.student_leave_requests USING btree (status);


--
-- Name: idx_student_marks_academic_year; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_student_marks_academic_year ON public.student_marks USING btree (academic_year);


--
-- Name: idx_student_marks_result; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_student_marks_result ON public.student_marks USING btree (result);


--
-- Name: idx_student_marks_semester; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_student_marks_semester ON public.student_marks USING btree (semester);


--
-- Name: idx_student_marks_student_course; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_student_marks_student_course ON public.student_marks USING btree (student_id, course_id);


--
-- Name: idx_student_marks_student_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_student_marks_student_id ON public.student_marks USING btree (student_id);


--
-- Name: idx_student_marks_subject_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_student_marks_subject_code ON public.student_marks USING btree (subject_code);


--
-- Name: idx_student_marks_usn; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_student_marks_usn ON public.student_marks USING btree (usn);


--
-- Name: idx_student_marks_usn_semester; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_student_marks_usn_semester ON public.student_marks USING btree (usn, semester);


--
-- Name: idx_unique_student_subject_semester; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_unique_student_subject_semester ON public.student_marks USING btree (usn, subject_code, semester, exam_type);


--
-- Name: student_marks update_student_marks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_student_marks_updated_at BEFORE UPDATE ON public.student_marks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: admin_features admin_features_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_features
    ADD CONSTRAINT admin_features_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.admin(admin_id) ON DELETE SET NULL;


--
-- Name: department_activities department_activities_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_activities
    ADD CONSTRAINT department_activities_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.faculty(faculty_id) ON DELETE SET NULL;


--
-- Name: department_activities department_activities_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_activities
    ADD CONSTRAINT department_activities_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.department(department_id) ON DELETE CASCADE;


--
-- Name: department_circulars department_circulars_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_circulars
    ADD CONSTRAINT department_circulars_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.faculty(faculty_id) ON DELETE SET NULL;


--
-- Name: department_circulars department_circulars_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_circulars
    ADD CONSTRAINT department_circulars_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.department(department_id) ON DELETE CASCADE;


--
-- Name: faculty_courses faculty_courses_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faculty_courses
    ADD CONSTRAINT faculty_courses_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculty(faculty_id) ON DELETE SET NULL;


--
-- Name: faculty faculty_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faculty
    ADD CONSTRAINT faculty_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.department(department_id) ON DELETE SET NULL;


--
-- Name: faculty_profile faculty_profile_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faculty_profile
    ADD CONSTRAINT faculty_profile_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.department(department_id) ON DELETE SET NULL;


--
-- Name: faculty_profile faculty_profile_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faculty_profile
    ADD CONSTRAINT faculty_profile_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculty(faculty_id) ON DELETE CASCADE;


--
-- Name: fee_structure fee_structure_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_structure
    ADD CONSTRAINT fee_structure_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.department(department_id) ON DELETE SET NULL;


--
-- Name: student_attendance student_attendance_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_attendance
    ADD CONSTRAINT student_attendance_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.faculty_courses(course_id) ON DELETE CASCADE;


--
-- Name: student_attendance student_attendance_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_attendance
    ADD CONSTRAINT student_attendance_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculty(faculty_id) ON DELETE CASCADE;


--
-- Name: student_attendance student_attendance_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_attendance
    ADD CONSTRAINT student_attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student(student_id) ON DELETE CASCADE;


--
-- Name: student_certificates student_certificates_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_certificates
    ADD CONSTRAINT student_certificates_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student(student_id) ON DELETE CASCADE;


--
-- Name: student student_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT student_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.department(department_id) ON DELETE SET NULL;


--
-- Name: student_feedback student_feedback_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_feedback
    ADD CONSTRAINT student_feedback_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student(student_id) ON DELETE CASCADE;


--
-- Name: student_internships student_internships_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_internships
    ADD CONSTRAINT student_internships_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student(student_id) ON DELETE CASCADE;


--
-- Name: student_leave_requests student_leave_requests_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_leave_requests
    ADD CONSTRAINT student_leave_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.faculty(faculty_id) ON DELETE SET NULL;


--
-- Name: student_leave_requests student_leave_requests_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_leave_requests
    ADD CONSTRAINT student_leave_requests_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student(student_id) ON DELETE CASCADE;


--
-- Name: student_marks student_marks_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_marks
    ADD CONSTRAINT student_marks_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.faculty_courses(course_id) ON DELETE SET NULL;


--
-- Name: student_marks student_marks_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_marks
    ADD CONSTRAINT student_marks_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student(student_id) ON DELETE CASCADE;


--
-- Name: student_marks student_marks_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_marks
    ADD CONSTRAINT student_marks_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.faculty(faculty_id) ON DELETE SET NULL;


--
-- Name: student_projects student_projects_guide_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_projects
    ADD CONSTRAINT student_projects_guide_id_fkey FOREIGN KEY (guide_id) REFERENCES public.faculty(faculty_id) ON DELETE SET NULL;


--
-- Name: student_projects student_projects_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_projects
    ADD CONSTRAINT student_projects_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student(student_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict AEH2gqRqjWvKDXXGZcO3gLDzaU2r36G6ETyW9GUjIFrydvMWLG13HzqT8TelgJ0

