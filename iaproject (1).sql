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
  `maxcandidate` int(11) NOT NULL,
  `offer` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `jobs`
--

INSERT INTO `jobs` (`id`, `qualifications`, `description`, `field`, `position`, `maxcandidate`, `offer`) VALUES
(2, 'experience: 2 years, required: react html css js', 'desc1lawdmwaldnadalwdlawndlandlawdnalndw', 'finance', 'financial manager 1000', 1, 'worktime : 3 hours, salary : 1000$ladjwlawdwjldlajdalwjdawljdajdljawdawljdajldjadda'),
(3, 'experience: 2 years, required: react html css js', 'desc2', 'finances to bedawdawad', 'financial', 90, 'worktime : 8 hours, salary : 2000$;sefeksfkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk'),
(5, 'experience: 2 years, required: react html css;andadwndlnawjdandljadnljandlajwdnaljdnajdnajwddnwjdwjddjwdjwdjdjwjwjdjdjwdjwjwdjdjwdjwjdjdwjdjwjdwjdjdjwjwjdjjwdjwjdjwjdjwjdwjwdjwjdjwdjwwjdjwjdjwdjdw', 'desc3', 'finances', 'financial n', 90, 'worktime : 8 hours, salary : 2000$'),
(9, 'awdwad', 'awddaw', 'awdawd', 'adw', 23, 'awdaw'),
(13, 'slemfse', 'jejlsf', 'nn', 'bmk', 10, 'selfsmfe');

-- --------------------------------------------------------

--
-- Table structure for table `qualifications`
--

CREATE TABLE `qualifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `job_id` int(11) NOT NULL,
  `description` text NOT NULL,
  `applicationreview` varchar(255) NOT NULL COMMENT 'accepted=>1\r\nrejected=>0',
  `date` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `qualifications`
--

INSERT INTO `qualifications` (`id`, `user_id`, `job_id`, `description`, `applicationreview`, `date`) VALUES
(56, 42, 2, 'CV:\nName:mohamed ramadan', 'Accepted', ''),
(57, 42, 5, 'nadnwadandadnwna', 'Rejected', ''),
(58, 42, 3, 'bbkbkbkkbkbkbkb', 'Accepted', 'Mon May 08 2023'),
(59, 42, 2, ',n,', 'Accepted', 'Mon May 08 2023'),
(60, 42, 2, 'how to', '', 'Tue May 09 2023');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` int(20) NOT NULL,
  `token` varchar(255) NOT NULL,
  `type` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'admin-> 1\r\napplicant->0',
  `status` varchar(255) NOT NULL DEFAULT 'in-active' COMMENT 'active->1\r\ninactive->0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `token`, `type`, `status`) VALUES
(39, 'mohamadwd', 'admin2023@admin.com', '$2b$10$W7wwgWmkRXUVEBY1LYNXzuwobmb1tkCLCNgkHQBi5Yv9lNen9fUUa', 2147483647, '551228f5943fa26010d05ca54fdc40cf', 1, 'active'),
(42, 'mdmeapeapjd', 'moha2023@gmail.com', '$2b$10$ZuMqzRjTqBLax1fkNFOdjugOX5.yO8vDWBZqzAvKKgdVc/r6AfUu.', 1000233333, '012355dee569d6e05791860bdefe9b38', 0, 'active'),
(43, 'olduser2020', 'olduser2020@gmail.com', '$2b$10$NDrfJpxQVP97yXFaAtLefe8.imUhNF2QHk329SfCJiBqkB5pSFmAS', 1002434334, '', 0, 'active');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `title` (`position`);

--
-- Indexes for table `qualifications`
--
ALTER TABLE `qualifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `job_request` (`job_id`),
  ADD KEY `user_request` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

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
