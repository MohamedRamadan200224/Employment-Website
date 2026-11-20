-- CV (PDF) storage for job applications.
--
-- Run once against an EXISTING database (fresh installs get the same
-- columns from "iaproject (1).sql", which now includes them):
--
--   mysql -u root iaproject < BackEnd/db/migrations/002-add-cv-columns.sql
--
-- The script is idempotent: each column is added only if it does not
-- already exist (MySQL / MariaDB have no ALTER TABLE ... ADD COLUMN IF
-- NOT EXISTS, so the existence check is done against
-- information_schema.columns). Safe to re-run.
--
-- Why a MEDIUMBLOB in the row instead of a file on disk: the backend
-- runs on Vercel serverless, where the filesystem is ephemeral — a
-- file written to disk in one invocation is gone in the next. The
-- database is the only durable storage this deployment already has.
-- The 5 MB cap (enforced by the upload middleware and the client)
-- keeps rows small; a high-volume production app should move CVs to
-- object storage instead. TiDB / MySQL: MEDIUMBLOB holds up to 16 MB.

-- qualifications(cv_pdf)
SET @col := (SELECT COUNT(*) FROM information_schema.columns
             WHERE table_schema = DATABASE() AND table_name = 'qualifications'
               AND column_name = 'cv_pdf');
SET @sql := IF(@col = 0, 'ALTER TABLE qualifications ADD COLUMN cv_pdf MEDIUMBLOB NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- qualifications(cv_filename)
SET @col := (SELECT COUNT(*) FROM information_schema.columns
             WHERE table_schema = DATABASE() AND table_name = 'qualifications'
               AND column_name = 'cv_filename');
SET @sql := IF(@col = 0, 'ALTER TABLE qualifications ADD COLUMN cv_filename VARCHAR(255) NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- qualifications(cv_mimetype)
SET @col := (SELECT COUNT(*) FROM information_schema.columns
             WHERE table_schema = DATABASE() AND table_name = 'qualifications'
               AND column_name = 'cv_mimetype');
SET @sql := IF(@col = 0, 'ALTER TABLE qualifications ADD COLUMN cv_mimetype VARCHAR(100) NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- qualifications(applicationreview) — default ''.
-- Pre-existing bug: the column is NOT NULL with no default, and the
-- POST /jobs/request insert never set it, so every application failed
-- with 500 (ER_NO_DEFAULT_FOR_FIELD) on strict-mode MySQL/MariaDB and
-- TiDB. The route now sets it explicitly; this default is defence in
-- depth so any other insert path cannot hit the same error.

SET @def := (SELECT COLUMN_DEFAULT FROM information_schema.columns
             WHERE table_schema = DATABASE() AND table_name = 'qualifications'
               AND column_name = 'applicationreview');
SET @sql := IF(@def IS NULL, 'ALTER TABLE qualifications ALTER COLUMN applicationreview SET DEFAULT \'\'', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- qualifications(cv_size)
SET @col := (SELECT COUNT(*) FROM information_schema.columns
             WHERE table_schema = DATABASE() AND table_name = 'qualifications'
               AND column_name = 'cv_size');
SET @sql := IF(@col = 0, 'ALTER TABLE qualifications ADD COLUMN cv_size INT UNSIGNED NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
