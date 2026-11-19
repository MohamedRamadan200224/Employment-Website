-- Perf P0: indexes for the Employment-Website database.
--
-- Run once against an EXISTING database (fresh installs get the same
-- indexes from "iaproject (1).sql", which now includes them):
--
--   mysql -u root iaproject < BackEnd/db/migrations/001-add-indexes.sql
--
-- The script is idempotent: each index is created only if it does not
-- already exist (MySQL / MariaDB have no CREATE INDEX IF NOT EXISTS, so
-- the existence check is done against information_schema.statistics).
-- Safe to re-run.
--
-- Why these four:
--   idx_users_email  - login / register look up users by email on every
--                      attempt; without it every login is a full scan.
--   idx_users_token  - the authorize/admin middleware look up users by
--                      token on EVERY protected request; without it every
--                      request is a full scan.
--   idx_jobs_field   - job lists / search filter on `field`, which had
--                      no index (`position` already had a UNIQUE key).
--   idx_jobs_position_field (FULLTEXT) - the job search now uses
--                      MATCH(position, field) AGAINST (? IN BOOLEAN MODE)
--                      instead of LIKE '%...%', which no index can serve.
--                      InnoDB FULLTEXT needs MySQL 5.6+ / MariaDB 10.0.5+;
--                      the seed dump targets MariaDB 10.4, so it applies.
--                      Until this migration is run, the search in
--                      BackEnd/routes/Jobs.js falls back to a parameterised
--                      prefix LIKE search.

-- users(email)
SET @idx := (SELECT COUNT(*) FROM information_schema.statistics
             WHERE table_schema = DATABASE() AND table_name = 'users'
               AND index_name = 'idx_users_email');
SET @sql := IF(@idx = 0, 'CREATE INDEX idx_users_email ON users (email)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- users(token)
SET @idx := (SELECT COUNT(*) FROM information_schema.statistics
             WHERE table_schema = DATABASE() AND table_name = 'users'
               AND index_name = 'idx_users_token');
SET @sql := IF(@idx = 0, 'CREATE INDEX idx_users_token ON users (token)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- jobs(field)
SET @idx := (SELECT COUNT(*) FROM information_schema.statistics
             WHERE table_schema = DATABASE() AND table_name = 'jobs'
               AND index_name = 'idx_jobs_field');
SET @sql := IF(@idx = 0, 'CREATE INDEX idx_jobs_field ON jobs (field)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- jobs(position, field) FULLTEXT
SET @idx := (SELECT COUNT(*) FROM information_schema.statistics
             WHERE table_schema = DATABASE() AND table_name = 'jobs'
               AND index_name = 'idx_jobs_position_field');
SET @sql := IF(@idx = 0, 'CREATE FULLTEXT INDEX idx_jobs_position_field ON jobs (position, field)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
