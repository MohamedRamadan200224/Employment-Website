-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 09, 2023 at 01:38 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `iaproject`
--

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` int(11) NOT NULL,
  `qualifications` text NOT NULL,
  `description` text NOT NULL,
  `field` varchar(255) NOT NULL,
  `position` varchar(255) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `maxcandidate` int(11) NOT NULL,
  `offer` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `jobs`
--

-- Realistic jobs (2026-11-21): the seeded rows were placeholder text
-- with no meaning ("bmk", "adw", "financial n" ...). The five seeded
-- jobs keep their ids, so existing applications keep pointing at the
-- same jobs; ids 14-16 are new. Slugs match migration 004.
INSERT INTO `jobs` (`id`, `qualifications`, `description`, `field`, `position`, `slug`, `maxcandidate`, `offer`) VALUES
(2, '3+ years of experience with MongoDB, Express.js, React and Node.js. Strong understanding of REST APIs, Git and agile workflows. BSc in Computer Science or a related field.', 'We are looking for a Full-Stack Developer to build and maintain modern web applications using the MERN stack (MongoDB, Express.js, React and Node.js). You will work with our product team to design features, build REST APIs and deliver responsive user interfaces.', 'Software Development', 'Full-Stack Developer (MERN)', 'full-stack-developer-mern', 3, 'Work type: Full-time (Remote), Salary: 30,000 EGP/month'),
(3, '2+ years of experience with Node.js and Express. Experience with SQL or NoSQL databases and REST API design. Familiarity with Docker and automated testing is a plus.', 'We are looking for a Backend Developer to design and build reliable server-side applications and APIs. You will work on database design, authentication, performance optimisation and integrations with third-party services.', 'Software Engineering', 'Backend Developer (Node.js)', 'backend-developer-nodejs', 2, 'Work type: Full-time (Hybrid - Cairo), Salary: 28,000 EGP/month'),
(5, '2+ years of experience with React, JavaScript, HTML and CSS. Experience with responsive design and state management (Redux or Context API). Familiarity with TypeScript is a plus.', 'We are looking for a Frontend Developer to build responsive and accessible user interfaces with React. You will turn designs into pixel-perfect components, work with backend developers on API integration and keep our UI consistent and fast.', 'Web Development', 'Frontend Developer (React)', 'frontend-developer-react', 2, 'Work type: Full-time (Remote), Salary: 25,000 EGP/month'),
(9, 'Portfolio of UI/UX work. Proficiency in Figma. Understanding of user research, wireframing and design systems.', 'We are looking for a UI/UX Designer to design clean and user-friendly interfaces for our web platform. You will run user research, create wireframes and prototypes, and work closely with developers to ship polished experiences.', 'Design', 'UI/UX Designer', 'ui-ux-designer', 1, 'Work type: Full-time (On-site - Cairo), Salary: 22,000 EGP/month'),
(13, 'Experience with Excel, SQL and data visualisation tools (Power BI or Tableau). Strong analytical thinking and communication skills.', 'We are looking for a Data Analyst to turn data into clear reports and recommendations. You will build dashboards, analyse product and hiring data, and help teams make decisions based on evidence.', 'Data Analysis', 'Data Analyst', 'data-analyst', 2, 'Work type: Full-time (Hybrid - Giza), Salary: 24,000 EGP/month'),
(14, 'Experience with Docker, CI/CD pipelines and a cloud platform (AWS or similar). Familiarity with Linux, Git and monitoring tools. Strong troubleshooting skills.', 'We are looking for a DevOps Engineer to build and maintain our deployment pipelines and cloud infrastructure. You will automate builds and releases, monitor services and help developers ship safely and quickly.', 'Infrastructure', 'DevOps Engineer', 'devops-engineer', 1, 'Work type: Full-time (Remote), Salary: 32,000 EGP/month'),
(15, 'Experience with Flutter and Dart. Understanding of mobile UI patterns and REST API integration. Experience publishing apps to Google Play or the App Store is a plus.', 'We are looking for a Mobile Developer to build cross-platform apps with Flutter. You will work with designers and backend developers to deliver smooth, reliable mobile experiences on Android and iOS.', 'Mobile Development', 'Mobile Developer (Flutter)', 'mobile-developer-flutter', 2, 'Work type: Full-time (Remote), Salary: 27,000 EGP/month'),
(16, 'Experience in manual testing of web applications. Ability to write clear test cases and bug reports. Familiarity with automated testing tools is a plus.', 'We are looking for a QA Engineer to test our web platform and keep releases reliable. You will write test cases, report bugs clearly and work with developers to verify fixes before release.', 'Quality Assurance', 'QA Engineer', 'qa-engineer', 2, 'Work type: Full-time (Hybrid - Cairo), Salary: 23,000 EGP/month');

-- --------------------------------------------------------

--
-- Table structure for table `qualifications`
--

CREATE TABLE `qualifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `job_id` int(11) NOT NULL,
  `description` text NOT NULL,
  `applicationreview` varchar(255) NOT NULL DEFAULT '' COMMENT 'accepted=>1\r\nrejected=>0',
  `date` varchar(255) NOT NULL,
  `cv_pdf` mediumblob DEFAULT NULL,
  `cv_filename` varchar(255) DEFAULT NULL,
  `cv_mimetype` varchar(100) DEFAULT NULL,
  `cv_size` int(10) unsigned DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `qualifications`
--

INSERT INTO `qualifications` (`id`, `user_id`, `job_id`, `description`, `applicationreview`, `date`) VALUES
(56, 42, 2, 'CV:\nName:mohamed ramadan', 'Accepted', ''),
(57, 42, 5, 'nadnwadandadnwna', 'Rejected', ''),
(58, 42, 3, 'bbkbkbkkbkbkbkb', 'Accepted', 'Mon May 08 2023');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `token` varchar(255) NOT NULL,
  `type` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'admin-> 1\r\napplicant->0',
  `status` varchar(255) NOT NULL DEFAULT 'in-active' COMMENT 'active->1\r\ninactive->0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

-- Security (2026-11-19): auth tokens are NEVER seeded. Tokens are
-- issued by the API at login (Auth.js rotates a fresh token on every
-- successful login) and invalidated by /auth/logout. The seeded users
-- below therefore have an empty token and cannot authenticate until
-- they log in with their password. If you seeded a database from an
-- older dump, rotate the tokens there too (UPDATE users SET token = ''
-- or a fresh random value) — the values in the old dump are public.
INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `token`, `type`, `status`) VALUES
(39, 'mohamadwd', 'admin2023@admin.com', '$2b$10$W7wwgWmkRXUVEBY1LYNXzuwobmb1tkCLCNgkHQBi5Yv9lNen9fUUa', 2147483647, '', 1, 'active'),
(42, 'mdmeapeapjd', 'moha2023@gmail.com', '$2b$10$ZuMqzRjTqBLax1fkNFOdjugOX5.yO8vDWBZqzAvKKgdVc/r6AfUu.', 1000233333, '', 0, 'active'),
(43, 'olduser2020', 'olduser2020@gmail.com', '$2b$10$NDrfJpxQVP97yXFaAtLefe8.imUhNF2QHk329SfCJiBqkB5pSFmAS', 1002434334, '', 0, 'active');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `jobs`
--
-- Indexes added 2026-11-19 (perf P0): idx_jobs_field for job lists /
-- search on `field`, and idx_jobs_position_field (FULLTEXT) for the
-- MATCH(position, field) job search in BackEnd/routes/Jobs.js.
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `title` (`position`),
  ADD UNIQUE KEY `uq_jobs_slug` (`slug`),
  ADD KEY `idx_jobs_field` (`field`),
  ADD FULLTEXT KEY `idx_jobs_position_field` (`position`, `field`);

--
-- Indexes for table `qualifications`
--
ALTER TABLE `qualifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `job_request` (`job_id`),
  ADD KEY `user_request` (`user_id`),
  ADD UNIQUE KEY `uq_qualifications_user_job` (`user_id`, `job_id`);

--
-- Indexes for table `users`
--
-- Indexes added 2026-11-19 (perf P0): idx_users_email for login /
-- register lookups and idx_users_token for the authorize/admin
-- middleware, which looks users up by token on every request.
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_users_email` (`email`),
  ADD KEY `idx_users_token` (`token`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `qualifications`
--
ALTER TABLE `qualifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `qualifications`
--
ALTER TABLE `qualifications`
  ADD CONSTRAINT `job_request` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_request` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
