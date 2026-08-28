CREATE TABLE IF NOT EXISTS users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(320) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courses (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(160) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS groups (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR(40) NOT NULL UNIQUE,
    name VARCHAR(160) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_groups (
    student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE RESTRICT,
    PRIMARY KEY (student_id, group_id)
);

CREATE TABLE IF NOT EXISTS exams (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
    title VARCHAR(180) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes BETWEEN 1 AND 480),
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (starts_at < ends_at)
);

CREATE TABLE IF NOT EXISTS exam_groups (
    exam_id BIGINT NOT NULL REFERENCES exams(id) ON DELETE RESTRICT,
    group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE RESTRICT,
    PRIMARY KEY (exam_id, group_id)
);

CREATE TABLE IF NOT EXISTS questions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    exam_id BIGINT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    points NUMERIC(8, 2) NOT NULL DEFAULT 1 CHECK (points > 0),
    position INTEGER NOT NULL CHECK (position > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (exam_id, position)
);

CREATE TABLE IF NOT EXISTS choices (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    position INTEGER NOT NULL CHECK (position > 0),
    UNIQUE (question_id, position)
);

CREATE UNIQUE INDEX IF NOT EXISTS one_correct_choice_per_question
    ON choices(question_id) WHERE is_correct = TRUE;

CREATE TABLE IF NOT EXISTS attempts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    exam_id BIGINT NOT NULL REFERENCES exams(id) ON DELETE RESTRICT,
    student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    score NUMERIC(8, 2) CHECK (score IS NULL OR score >= 0),
    max_score NUMERIC(8, 2) CHECK (max_score IS NULL OR max_score > 0),
    percentage NUMERIC(6, 2) CHECK (percentage IS NULL OR (percentage >= 0 AND percentage <= 100)),
    UNIQUE (exam_id, student_id)
);

CREATE TABLE IF NOT EXISTS answers (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    attempt_id BIGINT NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
    choice_id BIGINT REFERENCES choices(id) ON DELETE RESTRICT,
    selected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (attempt_id, question_id)
);

CREATE INDEX IF NOT EXISTS exams_course_id_index ON exams(course_id);
CREATE INDEX IF NOT EXISTS exams_window_index ON exams(starts_at, ends_at);
CREATE INDEX IF NOT EXISTS questions_exam_id_index ON questions(exam_id);
CREATE INDEX IF NOT EXISTS choices_question_id_index ON choices(question_id);
CREATE INDEX IF NOT EXISTS attempts_student_id_index ON attempts(student_id);
CREATE INDEX IF NOT EXISTS answers_attempt_id_index ON answers(attempt_id);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS courses_set_updated_at ON courses;
CREATE TRIGGER courses_set_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS groups_set_updated_at ON groups;
CREATE TRIGGER groups_set_updated_at BEFORE UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS exams_set_updated_at ON exams;
CREATE TRIGGER exams_set_updated_at BEFORE UPDATE ON exams FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS questions_set_updated_at ON questions;
CREATE TRIGGER questions_set_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION reject_exam_change_after_attempt() RETURNS TRIGGER AS $$
DECLARE
    exam_id_value BIGINT;
BEGIN
    exam_id_value := CASE
        WHEN TG_TABLE_NAME = 'exams' THEN CASE WHEN TG_OP = 'INSERT' THEN NEW.id ELSE OLD.id END
        ELSE CASE WHEN TG_OP = 'INSERT' THEN NEW.exam_id ELSE OLD.exam_id END
    END;
    IF EXISTS (SELECT 1 FROM attempts WHERE exam_id = exam_id_value) THEN
        RAISE EXCEPTION 'Exam is locked after its first attempt';
    END IF;
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS exams_lock_after_attempt ON exams;
CREATE TRIGGER exams_lock_after_attempt BEFORE DELETE ON exams FOR EACH ROW EXECUTE FUNCTION reject_exam_change_after_attempt();
DROP TRIGGER IF EXISTS questions_lock_after_attempt ON questions;
CREATE TRIGGER questions_lock_after_attempt BEFORE INSERT OR UPDATE OR DELETE ON questions FOR EACH ROW EXECUTE FUNCTION reject_exam_change_after_attempt();

CREATE OR REPLACE FUNCTION reject_choice_change_after_attempt() RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM attempts a
        JOIN questions q ON q.exam_id = a.exam_id
        WHERE q.id = CASE WHEN TG_OP = 'INSERT' THEN NEW.question_id ELSE OLD.question_id END
    ) THEN
        RAISE EXCEPTION 'Question choices are locked after the first attempt';
    END IF;
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS choices_lock_after_attempt ON choices;
CREATE TRIGGER choices_lock_after_attempt BEFORE INSERT OR UPDATE OR DELETE ON choices FOR EACH ROW EXECUTE FUNCTION reject_choice_change_after_attempt();

CREATE OR REPLACE FUNCTION validate_question_choices() RETURNS TRIGGER AS $$
DECLARE
    question_id_value BIGINT;
    choice_count INTEGER;
    correct_count INTEGER;
BEGIN
    question_id_value := COALESCE(NEW.question_id, OLD.question_id);
    IF NOT EXISTS (SELECT 1 FROM questions WHERE id = question_id_value) THEN
        RETURN NULL;
    END IF;
    SELECT COUNT(*), COUNT(*) FILTER (WHERE is_correct) INTO choice_count, correct_count FROM choices WHERE question_id = question_id_value;
    IF choice_count < 2 OR choice_count > 6 OR correct_count <> 1 THEN
        RAISE EXCEPTION 'A question must have between 2 and 6 choices and exactly one correct choice';
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS choices_business_rule ON choices;
CREATE CONSTRAINT TRIGGER choices_business_rule AFTER INSERT OR UPDATE OR DELETE ON choices DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION validate_question_choices();

CREATE OR REPLACE FUNCTION validate_answer_links() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.choice_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM choices c WHERE c.id = NEW.choice_id AND c.question_id = NEW.question_id
    ) THEN
        RAISE EXCEPTION 'Selected choice does not belong to the question';
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM attempts a JOIN questions q ON q.exam_id = a.exam_id WHERE a.id = NEW.attempt_id AND q.id = NEW.question_id
    ) THEN
        RAISE EXCEPTION 'Question does not belong to the attempted exam';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS answers_links_validation ON answers;
CREATE TRIGGER answers_links_validation BEFORE INSERT OR UPDATE ON answers FOR EACH ROW EXECUTE FUNCTION validate_answer_links();

CREATE OR REPLACE FUNCTION validate_attempt_student() RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = NEW.student_id AND role = 'student' AND is_active = TRUE) THEN
        RAISE EXCEPTION 'Only active students can start an attempt';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS attempts_student_validation ON attempts;
CREATE TRIGGER attempts_student_validation BEFORE INSERT OR UPDATE ON attempts FOR EACH ROW EXECUTE FUNCTION validate_attempt_student();

CREATE OR REPLACE VIEW exam_result_summary AS
SELECT e.id AS exam_id, e.title, COUNT(a.id)::INTEGER AS attempt_count, COALESCE(ROUND(AVG(a.score), 2), 0) AS average_score,
       COALESCE(ROUND(AVG(a.percentage), 2), 0) AS average_percentage
FROM exams e
LEFT JOIN attempts a ON a.exam_id=e.id
GROUP BY e.id, e.title;
