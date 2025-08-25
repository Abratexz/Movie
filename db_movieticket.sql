-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 20, 2025 at 01:55 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_movieticket`
--

-- --------------------------------------------------------

--
-- Table structure for table `favorite_movies`
--

CREATE TABLE `favorite_movies` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `movie_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `genres`
--

CREATE TABLE `genres` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `genres`
--

INSERT INTO `genres` (`id`, `name`) VALUES
(3, 'Action'),
(5, 'Fantasy'),
(1, 'Music'),
(4, 'Romance');

-- --------------------------------------------------------

--
-- Table structure for table `movies`
--

CREATE TABLE `movies` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(200) NOT NULL,
  `duration_min` int(11) NOT NULL,
  `rating` varchar(20) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `poster_url` varchar(1000) DEFAULT NULL,
  `trailer_url` varchar(1000) DEFAULT NULL,
  `release_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `movies`
--

INSERT INTO `movies` (`id`, `title`, `duration_min`, `rating`, `description`, `poster_url`, `trailer_url`, `release_date`, `created_at`) VALUES
(1, 'K-On! Live', 110, 'G', 'K-ON School Live!', 'K-ON.jpg', NULL, '2025-08-19', '2025-08-19 05:24:49');

-- --------------------------------------------------------

--
-- Table structure for table `movie_genres`
--

CREATE TABLE `movie_genres` (
  `movie_id` bigint(20) UNSIGNED NOT NULL,
  `genre_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `movie_genres`
--

INSERT INTO `movie_genres` (`movie_id`, `genre_id`) VALUES
(1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `showtime_id` bigint(20) UNSIGNED NOT NULL,
  `currency` char(3) NOT NULL DEFAULT 'THB',
  `subtotal` int(11) NOT NULL,
  `discount` int(11) NOT NULL DEFAULT 0,
  `total` int(11) NOT NULL,
  `status` enum('pending','paid','cancelled','expired','refunded') NOT NULL DEFAULT 'pending',
  `coupon_code` varchar(32) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `token` varchar(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `password_resets`
--

INSERT INTO `password_resets` (`id`, `user_id`, `token`, `expires_at`, `used_at`, `created_at`) VALUES
(12, 12, 'f9d8075e9c2d27619b034567b955c10345cce57d', '2025-08-19 21:01:51', '2025-08-19 20:01:53', '2025-08-19 13:01:51');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `provider` enum('mock','stripe','omise','cash') NOT NULL DEFAULT 'mock',
  `provider_payment_id` varchar(100) DEFAULT NULL,
  `amount` int(11) NOT NULL,
  `currency` char(3) NOT NULL DEFAULT 'THB',
  `status` enum('requires_action','pending','succeeded','failed','cancelled','refunded') NOT NULL,
  `failure_code` varchar(50) DEFAULT NULL,
  `failure_message` varchar(255) DEFAULT NULL,
  `raw_response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`raw_response`)),
  `paid_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `screens`
--

CREATE TABLE `screens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `theater_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(60) NOT NULL,
  `seat_map_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`seat_map_json`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `screens`
--

INSERT INTO `screens` (`id`, `theater_id`, `name`, `seat_map_json`, `is_active`, `created_at`) VALUES
(1, 1, 'Screen 1', '{\r\n  \"rows\": [\r\n    {\"row\":\"A\",\"count\":10},\r\n    {\"row\":\"B\",\"count\":10},\r\n    {\"row\":\"C\",\"count\":10},\r\n    {\"row\":\"D\",\"count\":10},\r\n    {\"row\":\"E\",\"count\":10}\r\n  ],\r\n  \"aisles\": [6]\r\n}', 1, '2025-08-19 05:24:49');

-- --------------------------------------------------------

--
-- Table structure for table `seat_inventory`
--

CREATE TABLE `seat_inventory` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `showtime_id` bigint(20) UNSIGNED NOT NULL,
  `seat_code` varchar(10) NOT NULL,
  `seat_class` varchar(20) DEFAULT 'standard',
  `status` enum('available','booked') NOT NULL DEFAULT 'available',
  `hold_expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `seat_inventory`
--

INSERT INTO `seat_inventory` (`id`, `showtime_id`, `seat_code`, `seat_class`, `status`, `hold_expires_at`) VALUES
(1, 1, 'A1', 'standard', 'available', NULL),
(2, 2, 'A1', 'standard', 'available', NULL),
(3, 5, 'A1', 'standard', 'available', NULL),
(4, 6, 'A1', 'standard', 'booked', NULL),
(6, 1, 'B1', 'standard', 'available', NULL),
(7, 2, 'B1', 'standard', 'available', NULL),
(8, 5, 'B1', 'standard', 'available', NULL),
(9, 6, 'B1', 'standard', 'available', NULL),
(11, 1, 'C1', 'standard', 'available', NULL),
(12, 2, 'C1', 'standard', 'available', NULL),
(13, 5, 'C1', 'standard', 'available', NULL),
(14, 6, 'C1', 'standard', 'available', NULL),
(16, 1, 'D1', 'standard', 'available', NULL),
(17, 2, 'D1', 'standard', 'available', NULL),
(18, 5, 'D1', 'standard', 'available', NULL),
(19, 6, 'D1', 'standard', 'available', NULL),
(21, 1, 'E1', 'standard', 'available', NULL),
(22, 2, 'E1', 'standard', 'available', NULL),
(23, 5, 'E1', 'standard', 'available', NULL),
(24, 6, 'E1', 'standard', 'available', NULL),
(26, 1, 'A2', 'standard', 'available', NULL),
(27, 2, 'A2', 'standard', 'available', NULL),
(28, 5, 'A2', 'standard', 'available', NULL),
(29, 6, 'A2', 'standard', 'available', NULL),
(31, 1, 'B2', 'standard', 'available', NULL),
(32, 2, 'B2', 'standard', 'available', NULL),
(33, 5, 'B2', 'standard', 'available', NULL),
(34, 6, 'B2', 'standard', 'available', NULL),
(36, 1, 'C2', 'standard', 'available', NULL),
(37, 2, 'C2', 'standard', 'available', NULL),
(38, 5, 'C2', 'standard', 'available', NULL),
(39, 6, 'C2', 'standard', 'available', NULL),
(41, 1, 'D2', 'standard', 'available', NULL),
(42, 2, 'D2', 'standard', 'available', NULL),
(43, 5, 'D2', 'standard', 'available', NULL),
(44, 6, 'D2', 'standard', 'available', NULL),
(46, 1, 'E2', 'standard', 'available', NULL),
(47, 2, 'E2', 'standard', 'available', NULL),
(48, 5, 'E2', 'standard', 'available', NULL),
(49, 6, 'E2', 'standard', 'available', NULL),
(51, 1, 'A3', 'standard', 'available', NULL),
(52, 2, 'A3', 'standard', 'available', NULL),
(53, 5, 'A3', 'standard', 'available', NULL),
(54, 6, 'A3', 'standard', 'available', NULL),
(56, 1, 'B3', 'standard', 'available', NULL),
(57, 2, 'B3', 'standard', 'available', NULL),
(58, 5, 'B3', 'standard', 'available', NULL),
(59, 6, 'B3', 'standard', 'available', NULL),
(61, 1, 'C3', 'standard', 'available', NULL),
(62, 2, 'C3', 'standard', 'available', NULL),
(63, 5, 'C3', 'standard', 'available', NULL),
(64, 6, 'C3', 'standard', 'booked', NULL),
(66, 1, 'D3', 'standard', 'available', NULL),
(67, 2, 'D3', 'standard', 'available', NULL),
(68, 5, 'D3', 'standard', 'available', NULL),
(69, 6, 'D3', 'standard', 'available', NULL),
(71, 1, 'E3', 'standard', 'available', NULL),
(72, 2, 'E3', 'standard', 'available', NULL),
(73, 5, 'E3', 'standard', 'available', NULL),
(74, 6, 'E3', 'standard', 'available', NULL),
(76, 1, 'A4', 'standard', 'available', NULL),
(77, 2, 'A4', 'standard', 'available', NULL),
(78, 5, 'A4', 'standard', 'available', NULL),
(79, 6, 'A4', 'standard', 'available', NULL),
(81, 1, 'B4', 'standard', 'available', NULL),
(82, 2, 'B4', 'standard', 'available', NULL),
(83, 5, 'B4', 'standard', 'available', NULL),
(84, 6, 'B4', 'standard', 'available', NULL),
(86, 1, 'C4', 'standard', 'available', NULL),
(87, 2, 'C4', 'standard', 'available', NULL),
(88, 5, 'C4', 'standard', 'available', NULL),
(89, 6, 'C4', 'standard', 'available', NULL),
(91, 1, 'D4', 'standard', 'available', NULL),
(92, 2, 'D4', 'standard', 'available', NULL),
(93, 5, 'D4', 'standard', 'available', NULL),
(94, 6, 'D4', 'standard', 'available', NULL),
(96, 1, 'E4', 'standard', 'available', NULL),
(97, 2, 'E4', 'standard', 'available', NULL),
(98, 5, 'E4', 'standard', 'available', NULL),
(99, 6, 'E4', 'standard', 'available', NULL),
(101, 1, 'A5', 'standard', 'available', NULL),
(102, 2, 'A5', 'standard', 'available', NULL),
(103, 5, 'A5', 'standard', 'available', NULL),
(104, 6, 'A5', 'standard', 'available', NULL),
(106, 1, 'B5', 'standard', 'available', NULL),
(107, 2, 'B5', 'standard', 'available', NULL),
(108, 5, 'B5', 'standard', 'available', NULL),
(109, 6, 'B5', 'standard', 'booked', NULL),
(111, 1, 'C5', 'standard', 'available', NULL),
(112, 2, 'C5', 'standard', 'available', NULL),
(113, 5, 'C5', 'standard', 'available', NULL),
(114, 6, 'C5', 'standard', 'available', NULL),
(116, 1, 'D5', 'standard', 'available', NULL),
(117, 2, 'D5', 'standard', 'available', NULL),
(118, 5, 'D5', 'standard', 'available', NULL),
(119, 6, 'D5', 'standard', 'available', NULL),
(121, 1, 'E5', 'standard', 'available', NULL),
(122, 2, 'E5', 'standard', 'available', NULL),
(123, 5, 'E5', 'standard', 'available', NULL),
(124, 6, 'E5', 'standard', 'available', NULL),
(126, 1, 'A6', 'standard', 'available', NULL),
(127, 2, 'A6', 'standard', 'available', NULL),
(128, 5, 'A6', 'standard', 'available', NULL),
(129, 6, 'A6', 'standard', 'available', NULL),
(131, 1, 'B6', 'standard', 'available', NULL),
(132, 2, 'B6', 'standard', 'available', NULL),
(133, 5, 'B6', 'standard', 'available', NULL),
(134, 6, 'B6', 'standard', 'available', NULL),
(136, 1, 'C6', 'standard', 'available', NULL),
(137, 2, 'C6', 'standard', 'available', NULL),
(138, 5, 'C6', 'standard', 'available', NULL),
(139, 6, 'C6', 'standard', 'available', NULL),
(141, 1, 'D6', 'standard', 'available', NULL),
(142, 2, 'D6', 'standard', 'available', NULL),
(143, 5, 'D6', 'standard', 'available', NULL),
(144, 6, 'D6', 'standard', 'available', NULL),
(146, 1, 'E6', 'standard', 'available', NULL),
(147, 2, 'E6', 'standard', 'available', NULL),
(148, 5, 'E6', 'standard', 'available', NULL),
(149, 6, 'E6', 'standard', 'available', NULL),
(151, 1, 'A7', 'standard', 'available', NULL),
(152, 2, 'A7', 'standard', 'available', NULL),
(153, 5, 'A7', 'standard', 'available', NULL),
(154, 6, 'A7', 'standard', 'available', NULL),
(156, 1, 'B7', 'standard', 'available', NULL),
(157, 2, 'B7', 'standard', 'available', NULL),
(158, 5, 'B7', 'standard', 'available', NULL),
(159, 6, 'B7', 'standard', 'available', NULL),
(161, 1, 'C7', 'standard', 'available', NULL),
(162, 2, 'C7', 'standard', 'available', NULL),
(163, 5, 'C7', 'standard', 'available', NULL),
(164, 6, 'C7', 'standard', 'available', NULL),
(166, 1, 'D7', 'standard', 'available', NULL),
(167, 2, 'D7', 'standard', 'available', NULL),
(168, 5, 'D7', 'standard', 'available', NULL),
(169, 6, 'D7', 'standard', 'available', NULL),
(171, 1, 'E7', 'standard', 'available', NULL),
(172, 2, 'E7', 'standard', 'available', NULL),
(173, 5, 'E7', 'standard', 'available', NULL),
(174, 6, 'E7', 'standard', 'available', NULL),
(176, 1, 'A8', 'standard', 'available', NULL),
(177, 2, 'A8', 'standard', 'available', NULL),
(178, 5, 'A8', 'standard', 'available', NULL),
(179, 6, 'A8', 'standard', 'available', NULL),
(181, 1, 'B8', 'standard', 'available', NULL),
(182, 2, 'B8', 'standard', 'available', NULL),
(183, 5, 'B8', 'standard', 'available', NULL),
(184, 6, 'B8', 'standard', 'available', NULL),
(186, 1, 'C8', 'standard', 'available', NULL),
(187, 2, 'C8', 'standard', 'available', NULL),
(188, 5, 'C8', 'standard', 'available', NULL),
(189, 6, 'C8', 'standard', 'available', NULL),
(191, 1, 'D8', 'standard', 'available', NULL),
(192, 2, 'D8', 'standard', 'available', NULL),
(193, 5, 'D8', 'standard', 'available', NULL),
(194, 6, 'D8', 'standard', 'available', NULL),
(196, 1, 'E8', 'standard', 'available', NULL),
(197, 2, 'E8', 'standard', 'available', NULL),
(198, 5, 'E8', 'standard', 'available', NULL),
(199, 6, 'E8', 'standard', 'available', NULL),
(201, 1, 'A9', 'standard', 'available', NULL),
(202, 2, 'A9', 'standard', 'available', NULL),
(203, 5, 'A9', 'standard', 'available', NULL),
(204, 6, 'A9', 'standard', 'available', NULL),
(206, 1, 'B9', 'standard', 'available', NULL),
(207, 2, 'B9', 'standard', 'available', NULL),
(208, 5, 'B9', 'standard', 'available', NULL),
(209, 6, 'B9', 'standard', 'available', NULL),
(211, 1, 'C9', 'standard', 'available', NULL),
(212, 2, 'C9', 'standard', 'available', NULL),
(213, 5, 'C9', 'standard', 'available', NULL),
(214, 6, 'C9', 'standard', 'available', NULL),
(216, 1, 'D9', 'standard', 'available', NULL),
(217, 2, 'D9', 'standard', 'available', NULL),
(218, 5, 'D9', 'standard', 'available', NULL),
(219, 6, 'D9', 'standard', 'available', NULL),
(221, 1, 'E9', 'standard', 'available', NULL),
(222, 2, 'E9', 'standard', 'available', NULL),
(223, 5, 'E9', 'standard', 'available', NULL),
(224, 6, 'E9', 'standard', 'available', NULL),
(226, 1, 'A10', 'standard', 'available', NULL),
(227, 2, 'A10', 'standard', 'available', NULL),
(228, 5, 'A10', 'standard', 'available', NULL),
(229, 6, 'A10', 'standard', 'available', NULL),
(231, 1, 'B10', 'standard', 'available', NULL),
(232, 2, 'B10', 'standard', 'available', NULL),
(233, 5, 'B10', 'standard', 'available', NULL),
(234, 6, 'B10', 'standard', 'available', NULL),
(236, 1, 'C10', 'standard', 'available', NULL),
(237, 2, 'C10', 'standard', 'available', NULL),
(238, 5, 'C10', 'standard', 'available', NULL),
(239, 6, 'C10', 'standard', 'available', NULL),
(241, 1, 'D10', 'standard', 'available', NULL),
(242, 2, 'D10', 'standard', 'available', NULL),
(243, 5, 'D10', 'standard', 'available', NULL),
(244, 6, 'D10', 'standard', 'available', NULL),
(246, 1, 'E10', 'standard', 'available', NULL),
(247, 2, 'E10', 'standard', 'available', NULL),
(248, 5, 'E10', 'standard', 'available', NULL),
(249, 6, 'E10', 'standard', 'available', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('J3y76kayPHRcaLw7CglewMK6iT-Ykj7i', 1755777271, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"flash\":{},\"user\":{\"id\":12,\"name\":\"PANNAWAT KHOOKAEW\",\"email\":\"darknightkung@gmail.com\",\"role\":\"admin\"}}'),
('S5OSvhhMafrkIrLJzLBfwjJQ1Z3o_pwW', 1755718507, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"flash\":{},\"user\":{\"id\":12,\"name\":\"PANNAWAT KHOOKAEW\",\"email\":\"darknightkung@gmail.com\",\"role\":\"customer\"}}');

-- --------------------------------------------------------

--
-- Table structure for table `showtimes`
--

CREATE TABLE `showtimes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `movie_id` bigint(20) UNSIGNED NOT NULL,
  `screen_id` bigint(20) UNSIGNED NOT NULL,
  `start_utc` datetime NOT NULL,
  `base_price` int(11) NOT NULL,
  `currency` char(3) NOT NULL DEFAULT 'THB',
  `format` varchar(40) DEFAULT NULL,
  `language` varchar(40) DEFAULT NULL,
  `status` enum('scheduled','cancelled') NOT NULL DEFAULT 'scheduled',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `showtimes`
--

INSERT INTO `showtimes` (`id`, `movie_id`, `screen_id`, `start_utc`, `base_price`, `currency`, `format`, `language`, `status`, `created_at`) VALUES
(1, 1, 1, '2025-08-19 17:24:49', 180, 'THB', '2D', 'TH-Sub', 'scheduled', '2025-08-19 05:24:49'),
(2, 1, 1, '2025-08-19 20:24:49', 180, 'THB', '2D', 'TH-Sub', 'scheduled', '2025-08-19 05:24:49'),
(5, 1, 1, '2025-08-20 11:45:00', 180, 'THB', '2D', 'TH-Sub', 'scheduled', '2025-08-19 18:15:57'),
(6, 1, 1, '2025-08-20 14:30:00', 180, 'THB', '2D', 'TH-Sub', 'scheduled', '2025-08-19 18:15:57');

-- --------------------------------------------------------

--
-- Table structure for table `theaters`
--

CREATE TABLE `theaters` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(120) NOT NULL,
  `city` varchar(80) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `theaters`
--

INSERT INTO `theaters` (`id`, `name`, `city`, `address`, `created_at`) VALUES
(1, 'Central Cinema', 'Bangkok', 'Downtown', '2025-08-19 05:24:49');

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `seat_code` varchar(10) NOT NULL,
  `seat_class` varchar(20) DEFAULT 'standard',
  `price_at_purchase` int(11) NOT NULL,
  `qr_token` varchar(64) NOT NULL,
  `used_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(191) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `role` enum('customer','staff','admin') NOT NULL DEFAULT 'customer',
  `password` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `role`, `password`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'admin@example.com', NULL, 'admin', 'admin123', '2025-08-19 05:24:49', '2025-08-19 05:24:49'),
(12, 'PANNAWAT KHOOKAEW', 'darknightkung@gmail.com', '1928890424', 'admin', '123', '2025-08-19 13:01:48', '2025-08-20 05:43:47');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `favorite_movies`
--
ALTER TABLE `favorite_movies`
  ADD PRIMARY KEY (`user_id`,`movie_id`),
  ADD KEY `fk_fav_movie` (`movie_id`);

--
-- Indexes for table `genres`
--
ALTER TABLE `genres`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_genres_name` (`name`);

--
-- Indexes for table `movies`
--
ALTER TABLE `movies`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `movie_genres`
--
ALTER TABLE `movie_genres`
  ADD PRIMARY KEY (`movie_id`,`genre_id`),
  ADD KEY `genre_id` (`genre_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_user` (`user_id`),
  ADD KEY `idx_order_showtime` (`showtime_id`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `fk_pr_user` (`user_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pay_order_status` (`order_id`,`status`);

--
-- Indexes for table `screens`
--
ALTER TABLE `screens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_screen_theater` (`theater_id`);

--
-- Indexes for table `seat_inventory`
--
ALTER TABLE `seat_inventory`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_showtime_seat` (`showtime_id`,`seat_code`),
  ADD UNIQUE KEY `uq_showtime_seat` (`showtime_id`,`seat_code`),
  ADD KEY `idx_si_st_status` (`showtime_id`,`status`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indexes for table `showtimes`
--
ALTER TABLE `showtimes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_st_movie_start` (`movie_id`,`start_utc`),
  ADD KEY `idx_st_screen_start` (`screen_id`,`start_utc`);

--
-- Indexes for table `theaters`
--
ALTER TABLE `theaters`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `qr_token` (`qr_token`),
  ADD UNIQUE KEY `uniq_order_seat` (`order_id`,`seat_code`),
  ADD KEY `idx_ticket_order` (`order_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `genres`
--
ALTER TABLE `genres`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `movies`
--
ALTER TABLE `movies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `screens`
--
ALTER TABLE `screens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `seat_inventory`
--
ALTER TABLE `seat_inventory`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=256;

--
-- AUTO_INCREMENT for table `showtimes`
--
ALTER TABLE `showtimes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `theaters`
--
ALTER TABLE `theaters`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `favorite_movies`
--
ALTER TABLE `favorite_movies`
  ADD CONSTRAINT `fk_fav_movie` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_fav_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `movie_genres`
--
ALTER TABLE `movie_genres`
  ADD CONSTRAINT `movie_genres_ibfk_1` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `movie_genres_ibfk_2` FOREIGN KEY (`genre_id`) REFERENCES `genres` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_order_showtime` FOREIGN KEY (`showtime_id`) REFERENCES `showtimes` (`id`),
  ADD CONSTRAINT `fk_order_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD CONSTRAINT `fk_pr_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payment_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `screens`
--
ALTER TABLE `screens`
  ADD CONSTRAINT `fk_screen_theater` FOREIGN KEY (`theater_id`) REFERENCES `theaters` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `seat_inventory`
--
ALTER TABLE `seat_inventory`
  ADD CONSTRAINT `fk_seat_showtime` FOREIGN KEY (`showtime_id`) REFERENCES `showtimes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `showtimes`
--
ALTER TABLE `showtimes`
  ADD CONSTRAINT `fk_st_movie` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_st_screen` FOREIGN KEY (`screen_id`) REFERENCES `screens` (`id`);

--
-- Constraints for table `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `fk_ticket_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
