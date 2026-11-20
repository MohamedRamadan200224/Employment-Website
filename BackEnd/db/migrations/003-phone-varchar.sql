-- Phone numbers must hold E.164-style values (a leading "+" plus
-- digits), e.g. +201234567890.
--
-- Run once against an EXISTING database (fresh installs get the new
-- column type from "iaproject (1).sql", which now defines phone as
-- varchar(20)):
--
--   mysql -u root iaproject < BackEnd/db/migrations/003-phone-varchar.sql
--
-- The script is idempotent: the column is altered only while it is
-- still an int. Safe to re-run.
--
-- Why this is needed: users.phone was int(20). A "+" phone passed the
-- old isNumeric() validation, but the INSERT then failed (a 13-digit
-- international number is far out of range for a signed int), so
-- registration answered 500 {"status":"error","message":"..."} — a
-- shape with no `errors` array — and the register form crashed on
-- .map() instead of showing the error. Storing phones as text also
-- keeps leading zeros (a digits-only "0123..." was silently stored
-- as "123...").
--
-- users(phone)
SET @type := (SELECT DATA_TYPE FROM information_schema.columns
              WHERE table_schema = DATABASE() AND table_name = 'users'
                AND column_name = 'phone');
SET @sql := IF(@type = 'int', 'ALTER TABLE users MODIFY COLUMN phone VARCHAR(20) NOT NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
