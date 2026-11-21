-- Job slugs + realistic job seeds + one application per user per job.
--
-- Run once against an EXISTING database (fresh installs get the same
-- state from "iaproject (1).sql", which now carries the slug column,
-- the realistic jobs and the unique keys):
--
--   mysql -u root iaproject < BackEnd/db/migrations/004-job-slugs-realistic-jobs.sql
--
-- The script is idempotent: the column / keys are added only if they do
-- not already exist, the job UPDATEs set the same values on re-run,
-- and the de-duplication deletes nothing once the table is clean.
-- Safe to re-run.
--
-- Why:
--   jobs.slug         - job-details URLs use a readable slug
--                       (/full-stack-developer-mern) instead of the
--                       numeric id. The backend generates it from the
--                       job title on create / update (see
--                       BackEnd/utils/slugify.js) and falls back to
--                       the id for old links.
--   realistic jobs    - the seeded jobs were placeholder text with no
--                       meaning ("bmk", "adw", "financial n" ...).
--                       The five seeded jobs are replaced in place by
--                       id, so existing applications keep pointing at
--                       the same jobs.
--   UNIQUE(user, job) - one application per user per job. The seeded
--                       data itself had three applications from user
--                       42 for job 2, so the duplicates are removed
--                       (keeping the earliest) before the key is added.
--                       POST /jobs/request also answers 409 when the
--                       application already exists.

-- jobs(slug): the URL slug, generated from `position` by the backend.
SET @col := (SELECT COUNT(*) FROM information_schema.columns
             WHERE table_schema = DATABASE() AND table_name = 'jobs'
               AND column_name = 'slug');
SET @sql := IF(@col = 0, 'ALTER TABLE jobs ADD COLUMN slug VARCHAR(255) NULL AFTER `position`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Realistic content for the five seeded jobs, replaced in place by id.
-- (The three extra jobs in the dump — ids 14, 15, 16 — are new rows,
-- so they need no UPDATE here.)
UPDATE jobs SET
  position = 'Full-Stack Developer (MERN)',
  slug = 'full-stack-developer-mern',
  field = 'Software Development',
  description = 'We are looking for a Full-Stack Developer to build and maintain modern web applications using the MERN stack (MongoDB, Express.js, React and Node.js). You will work with our product team to design features, build REST APIs and deliver responsive user interfaces.',
  qualifications = '3+ years of experience with MongoDB, Express.js, React and Node.js. Strong understanding of REST APIs, Git and agile workflows. BSc in Computer Science or a related field.',
  maxcandidate = 3,
  offer = 'Work type: Full-time (Remote), Salary: 30,000 EGP/month'
WHERE id = 2;

UPDATE jobs SET
  position = 'Backend Developer (Node.js)',
  slug = 'backend-developer-nodejs',
  field = 'Software Engineering',
  description = 'We are looking for a Backend Developer to design and build reliable server-side applications and APIs. You will work on database design, authentication, performance optimisation and integrations with third-party services.',
  qualifications = '2+ years of experience with Node.js and Express. Experience with SQL or NoSQL databases and REST API design. Familiarity with Docker and automated testing is a plus.',
  maxcandidate = 2,
  offer = 'Work type: Full-time (Hybrid - Cairo), Salary: 28,000 EGP/month'
WHERE id = 3;

UPDATE jobs SET
  position = 'Frontend Developer (React)',
  slug = 'frontend-developer-react',
  field = 'Web Development',
  description = 'We are looking for a Frontend Developer to build responsive and accessible user interfaces with React. You will turn designs into pixel-perfect components, work with backend developers on API integration and keep our UI consistent and fast.',
  qualifications = '2+ years of experience with React, JavaScript, HTML and CSS. Experience with responsive design and state management (Redux or Context API). Familiarity with TypeScript is a plus.',
  maxcandidate = 2,
  offer = 'Work type: Full-time (Remote), Salary: 25,000 EGP/month'
WHERE id = 5;

UPDATE jobs SET
  position = 'UI/UX Designer',
  slug = 'ui-ux-designer',
  field = 'Design',
  description = 'We are looking for a UI/UX Designer to design clean and user-friendly interfaces for our web platform. You will run user research, create wireframes and prototypes, and work closely with developers to ship polished experiences.',
  qualifications = 'Portfolio of UI/UX work. Proficiency in Figma. Understanding of user research, wireframing and design systems.',
  maxcandidate = 1,
  offer = 'Work type: Full-time (On-site - Cairo), Salary: 22,000 EGP/month'
WHERE id = 9;

UPDATE jobs SET
  position = 'Data Analyst',
  slug = 'data-analyst',
  field = 'Data Analysis',
  description = 'We are looking for a Data Analyst to turn data into clear reports and recommendations. You will build dashboards, analyse product and hiring data, and help teams make decisions based on evidence.',
  qualifications = 'Experience with Excel, SQL and data visualisation tools (Power BI or Tableau). Strong analytical thinking and communication skills.',
  maxcandidate = 2,
  offer = 'Work type: Full-time (Hybrid - Giza), Salary: 24,000 EGP/month'
WHERE id = 13;

-- De-duplicate applications before the UNIQUE key below: keep the
-- earliest application (lowest id) of each (user_id, job_id) pair.
-- The double-nested subquery is the MySQL / MariaDB / TiDB workaround
-- for "you cannot specify target table for update in FROM clause".
DELETE FROM qualifications
WHERE id NOT IN (
  SELECT min_id FROM (
    SELECT MIN(id) AS min_id FROM qualifications GROUP BY user_id, job_id
  ) AS keepers
);

-- qualifications(user_id, job_id) UNIQUE: one application per user
-- per job. The route also checks first and answers 409; this key is
-- the guard against two requests racing past that check.
SET @idx := (SELECT COUNT(*) FROM information_schema.statistics
             WHERE table_schema = DATABASE() AND table_name = 'qualifications'
               AND index_name = 'uq_qualifications_user_job');
SET @sql := IF(@idx = 0, 'CREATE UNIQUE INDEX uq_qualifications_user_job ON qualifications (user_id, job_id)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- jobs(slug) UNIQUE: two jobs must never share a URL slug. The
-- backend appends -2, -3, ... when a generated slug is taken.
SET @idx := (SELECT COUNT(*) FROM information_schema.statistics
             WHERE table_schema = DATABASE() AND table_name = 'jobs'
               AND index_name = 'uq_jobs_slug');
SET @sql := IF(@idx = 0, 'CREATE UNIQUE INDEX uq_jobs_slug ON jobs (slug)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
