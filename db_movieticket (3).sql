-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 26, 2025 at 12:21 AM
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

--
-- Dumping data for table `favorite_movies`
--

INSERT INTO `favorite_movies` (`user_id`, `movie_id`, `created_at`) VALUES
(12, 4, '2025-08-25 22:17:43'),
(12, 5, '2025-08-25 22:09:16'),
(14, 3, '2025-08-25 20:04:04'),
(14, 6, '2025-08-25 20:25:03'),
(14, 7, '2025-08-25 20:25:02');

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
(6, 'Horror'),
(7, 'Music'),
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
(1, 'K-On! Live', 110, 'G', 'K-ON School Live!', 'posters/K-ON.jpg', NULL, '2025-08-23', '2025-08-19 05:24:49'),
(2, 'Big Hero 6', 128, 'G', 'Big Hero 6', 'posters/BigHero6.jpeg', NULL, '2025-08-23', '2025-08-19 05:24:49'),
(3, 'Harry Potter', 130, 'G', 'Harry Potter!', 'posters/harrypotter.jpeg', NULL, '2025-08-23', '2025-08-19 05:24:49'),
(4, 'Loki', 123, 'G', 'Loki', 'posters/loki.jpeg', NULL, '2025-08-23', '2025-08-19 05:24:49'),
(5, 'Halloween', 140, 'G', 'Halloween', 'posters/Halloween.jpeg', NULL, '2025-08-23', '2025-08-19 05:24:49'),
(6, 'It', 120, 'G', 'IT is a book', 'posters/it.jpeg', NULL, '2025-08-23', '2025-08-19 05:24:49'),
(7, 'The Nun', 128, 'G', 'The nun', 'posters/thenun.jpeg', NULL, '2025-09-17', '2025-08-19 05:24:49');

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
(7, 6);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `seat_id` bigint(20) UNSIGNED NOT NULL,
  `showtime_id` bigint(20) UNSIGNED NOT NULL,
  `total_amount` int(11) NOT NULL,
  `status` enum('hold','paid','cancelled','expired','failed') NOT NULL DEFAULT 'hold',
  `expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `seat_id`, `showtime_id`, `total_amount`, `status`, `expires_at`, `created_at`, `updated_at`) VALUES
(19, 12, 0, 8, 120, 'paid', '2025-08-26 01:45:44', '2025-08-25 18:35:44', '2025-08-25 18:36:09'),
(20, 14, 0, 10, 200, 'paid', '2025-08-26 01:45:44', '2025-08-25 18:35:44', '2025-08-25 18:36:09'),
(21, 14, 0, 13, 120, 'paid', '2025-08-26 01:45:44', '2025-08-25 18:35:44', '2025-08-25 18:36:09'),
(22, 14, 0, 16, 250, 'expired', '2025-08-26 03:00:44', '2025-08-25 18:36:09', '2025-08-25 20:01:22'),
(23, 13, 0, 17, 160, 'paid', '2025-08-26 01:45:44', '2025-08-25 18:36:09', '2025-08-25 19:56:23'),
(29, 12, 560, 17, 160, 'cancelled', '2025-08-26 04:49:19', '2025-08-25 21:39:19', '2025-08-25 21:39:23');

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
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `amount` int(11) NOT NULL,
  `card_number` varchar(20) NOT NULL,
  `card_holder` varchar(100) NOT NULL,
  `card_last4` char(4) DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `checked_by` bigint(20) UNSIGNED DEFAULT NULL,
  `checked_at` timestamp NULL DEFAULT NULL,
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
  `seat_map_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ;

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
  `order_id` bigint(20) UNSIGNED DEFAULT NULL,
  `locked_by` bigint(20) UNSIGNED DEFAULT NULL,
  `seat_code` varchar(10) NOT NULL,
  `seat_class` varchar(20) DEFAULT 'standard',
  `status` enum('available','locked','booked') NOT NULL DEFAULT 'available',
  `hold_expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `seat_inventory`
--

INSERT INTO `seat_inventory` (`id`, `showtime_id`, `order_id`, `locked_by`, `seat_code`, `seat_class`, `status`, `hold_expires_at`) VALUES
(256, 8, 19, 12, 'A1', 'standard', 'booked', NULL),
(257, 8, NULL, NULL, 'A2', 'standard', 'available', NULL),
(258, 8, NULL, NULL, 'A3', 'standard', 'available', NULL),
(259, 8, NULL, NULL, 'A4', 'standard', 'available', NULL),
(260, 8, NULL, NULL, 'A5', 'standard', 'available', NULL),
(261, 8, 20, NULL, 'A6', 'standard', 'available', NULL),
(262, 8, NULL, NULL, 'A7', 'standard', 'available', NULL),
(263, 8, 21, NULL, 'A8', 'standard', 'available', NULL),
(264, 8, NULL, NULL, 'A9', 'standard', 'available', NULL),
(265, 8, NULL, NULL, 'A10', 'standard', 'available', NULL),
(266, 8, NULL, NULL, 'B1', 'standard', 'available', NULL),
(267, 8, NULL, NULL, 'B2', 'standard', 'available', NULL),
(268, 8, NULL, NULL, 'B3', 'standard', 'available', NULL),
(269, 8, NULL, NULL, 'B4', 'standard', 'available', NULL),
(270, 8, NULL, NULL, 'B5', 'standard', 'available', NULL),
(271, 8, NULL, NULL, 'B6', 'standard', 'available', NULL),
(272, 8, NULL, NULL, 'B7', 'standard', 'available', NULL),
(273, 8, NULL, NULL, 'B8', 'standard', 'available', NULL),
(274, 8, NULL, NULL, 'B9', 'standard', 'available', NULL),
(275, 8, NULL, NULL, 'B10', 'standard', 'available', NULL),
(276, 8, NULL, NULL, 'C1', 'standard', 'available', NULL),
(277, 8, NULL, NULL, 'C2', 'standard', 'available', NULL),
(278, 8, NULL, NULL, 'C3', 'standard', 'available', NULL),
(279, 8, NULL, NULL, 'C4', 'standard', 'available', NULL),
(280, 8, NULL, NULL, 'C5', 'standard', 'available', NULL),
(281, 8, NULL, NULL, 'C6', 'standard', 'available', NULL),
(282, 8, NULL, NULL, 'C7', 'standard', 'available', NULL),
(283, 8, NULL, NULL, 'C8', 'standard', 'available', NULL),
(284, 8, NULL, NULL, 'C9', 'standard', 'available', NULL),
(285, 8, NULL, NULL, 'C10', 'standard', 'available', NULL),
(286, 8, NULL, NULL, 'D1', 'standard', 'available', NULL),
(287, 8, NULL, NULL, 'D2', 'standard', 'available', NULL),
(288, 8, NULL, NULL, 'D3', 'standard', 'available', NULL),
(289, 8, NULL, NULL, 'D4', 'standard', 'available', NULL),
(290, 8, NULL, NULL, 'D5', 'standard', 'available', NULL),
(291, 8, NULL, NULL, 'D6', 'standard', 'available', NULL),
(292, 8, NULL, NULL, 'D7', 'standard', 'available', NULL),
(293, 8, NULL, NULL, 'D8', 'standard', 'available', NULL),
(294, 8, NULL, NULL, 'D9', 'standard', 'available', NULL),
(295, 8, NULL, NULL, 'D10', 'standard', 'available', NULL),
(296, 8, NULL, NULL, 'E1', 'standard', 'available', NULL),
(297, 8, NULL, NULL, 'E2', 'standard', 'available', NULL),
(298, 8, NULL, NULL, 'E3', 'standard', 'available', NULL),
(299, 8, NULL, NULL, 'E4', 'standard', 'available', NULL),
(300, 8, NULL, NULL, 'E5', 'standard', 'available', NULL),
(301, 8, NULL, NULL, 'E6', 'standard', 'available', NULL),
(302, 8, NULL, NULL, 'E7', 'standard', 'available', NULL),
(303, 8, NULL, NULL, 'E8', 'standard', 'available', NULL),
(304, 8, NULL, NULL, 'E9', 'standard', 'available', NULL),
(305, 8, NULL, NULL, 'E10', 'standard', 'available', NULL),
(306, 9, NULL, NULL, 'A1', 'standard', 'available', NULL),
(307, 9, NULL, NULL, 'A2', 'standard', 'available', NULL),
(308, 9, NULL, NULL, 'A3', 'standard', 'available', NULL),
(309, 9, NULL, NULL, 'A4', 'standard', 'available', NULL),
(310, 9, NULL, 12, 'A5', 'standard', 'available', NULL),
(311, 9, NULL, NULL, 'A6', 'standard', 'available', NULL),
(312, 9, NULL, NULL, 'A7', 'standard', 'available', NULL),
(313, 9, NULL, NULL, 'A8', 'standard', 'available', NULL),
(314, 9, NULL, NULL, 'A9', 'standard', 'available', NULL),
(315, 9, NULL, NULL, 'A10', 'standard', 'available', NULL),
(316, 9, NULL, NULL, 'B1', 'standard', 'available', NULL),
(317, 9, NULL, NULL, 'B2', 'standard', 'available', NULL),
(318, 9, NULL, NULL, 'B3', 'standard', 'available', NULL),
(319, 9, NULL, NULL, 'B4', 'standard', 'available', NULL),
(320, 9, NULL, 12, 'B5', 'standard', 'available', NULL),
(321, 9, NULL, NULL, 'B6', 'standard', 'available', NULL),
(322, 9, NULL, NULL, 'B7', 'standard', 'available', NULL),
(323, 9, NULL, NULL, 'B8', 'standard', 'available', NULL),
(324, 9, NULL, NULL, 'B9', 'standard', 'available', NULL),
(325, 9, NULL, NULL, 'B10', 'standard', 'available', NULL),
(326, 9, NULL, NULL, 'C1', 'standard', 'available', NULL),
(327, 9, NULL, NULL, 'C2', 'standard', 'available', NULL),
(328, 9, NULL, NULL, 'C3', 'standard', 'available', NULL),
(329, 9, NULL, NULL, 'C4', 'standard', 'available', NULL),
(330, 9, NULL, NULL, 'C5', 'standard', 'available', NULL),
(331, 9, NULL, NULL, 'C6', 'standard', 'available', NULL),
(332, 9, NULL, NULL, 'C7', 'standard', 'available', NULL),
(333, 9, NULL, NULL, 'C8', 'standard', 'available', NULL),
(334, 9, NULL, NULL, 'C9', 'standard', 'available', NULL),
(335, 9, NULL, NULL, 'C10', 'standard', 'available', NULL),
(336, 9, NULL, NULL, 'D1', 'standard', 'available', NULL),
(337, 9, NULL, NULL, 'D2', 'standard', 'available', NULL),
(338, 9, NULL, NULL, 'D3', 'standard', 'available', NULL),
(339, 9, NULL, NULL, 'D4', 'standard', 'available', NULL),
(340, 9, NULL, NULL, 'D5', 'standard', 'available', NULL),
(341, 9, NULL, NULL, 'D6', 'standard', 'available', NULL),
(342, 9, NULL, NULL, 'D7', 'standard', 'available', NULL),
(343, 9, NULL, NULL, 'D8', 'standard', 'available', NULL),
(344, 9, NULL, NULL, 'D9', 'standard', 'available', NULL),
(345, 9, NULL, NULL, 'D10', 'standard', 'available', NULL),
(346, 9, NULL, NULL, 'E1', 'standard', 'available', NULL),
(347, 9, NULL, NULL, 'E2', 'standard', 'available', NULL),
(348, 9, NULL, NULL, 'E3', 'standard', 'available', NULL),
(349, 9, NULL, NULL, 'E4', 'standard', 'available', NULL),
(350, 9, NULL, NULL, 'E5', 'standard', 'available', NULL),
(351, 9, NULL, NULL, 'E6', 'standard', 'available', NULL),
(352, 9, NULL, NULL, 'E7', 'standard', 'available', NULL),
(353, 9, NULL, NULL, 'E8', 'standard', 'available', NULL),
(354, 9, NULL, NULL, 'E9', 'standard', 'available', NULL),
(355, 9, NULL, NULL, 'E10', 'standard', 'available', NULL),
(356, 14, NULL, NULL, 'A1', 'standard', 'booked', NULL),
(357, 14, NULL, NULL, 'A2', 'standard', 'available', NULL),
(358, 14, NULL, NULL, 'A3', 'standard', 'available', NULL),
(359, 14, NULL, NULL, 'A4', 'standard', 'available', NULL),
(360, 14, NULL, NULL, 'A5', 'standard', 'locked', NULL),
(361, 14, NULL, NULL, 'A6', 'standard', 'available', NULL),
(362, 14, NULL, NULL, 'A7', 'standard', 'available', NULL),
(363, 14, NULL, NULL, 'A8', 'standard', 'available', NULL),
(364, 14, NULL, NULL, 'A9', 'standard', 'available', NULL),
(365, 14, NULL, NULL, 'A10', 'standard', 'available', NULL),
(366, 14, NULL, NULL, 'B1', 'standard', 'available', NULL),
(367, 14, NULL, NULL, 'B2', 'standard', 'available', NULL),
(368, 14, NULL, NULL, 'B3', 'standard', 'available', NULL),
(369, 14, NULL, NULL, 'B4', 'standard', 'available', NULL),
(370, 14, NULL, NULL, 'B5', 'standard', 'available', NULL),
(371, 14, NULL, NULL, 'B6', 'standard', 'available', NULL),
(372, 14, NULL, NULL, 'B7', 'standard', 'available', NULL),
(373, 14, NULL, NULL, 'B8', 'standard', 'available', NULL),
(374, 14, NULL, NULL, 'B9', 'standard', 'available', NULL),
(375, 14, NULL, NULL, 'B10', 'standard', 'available', NULL),
(376, 14, NULL, NULL, 'C1', 'standard', 'available', NULL),
(377, 14, NULL, NULL, 'C2', 'standard', 'available', NULL),
(378, 14, NULL, NULL, 'C3', 'standard', 'available', NULL),
(379, 14, NULL, NULL, 'C4', 'standard', 'available', NULL),
(380, 14, NULL, NULL, 'C5', 'standard', 'available', NULL),
(381, 14, NULL, NULL, 'C6', 'standard', 'available', NULL),
(382, 14, NULL, NULL, 'C7', 'standard', 'available', NULL),
(383, 14, NULL, NULL, 'C8', 'standard', 'available', NULL),
(384, 14, NULL, NULL, 'C9', 'standard', 'available', NULL),
(385, 14, NULL, NULL, 'C10', 'standard', 'available', NULL),
(386, 14, NULL, NULL, 'D1', 'standard', 'available', NULL),
(387, 14, NULL, NULL, 'D2', 'standard', 'available', NULL),
(388, 14, NULL, NULL, 'D3', 'standard', 'available', NULL),
(389, 14, NULL, NULL, 'D4', 'standard', 'available', NULL),
(390, 14, NULL, NULL, 'D5', 'standard', 'available', NULL),
(391, 14, NULL, NULL, 'D6', 'standard', 'available', NULL),
(392, 14, NULL, NULL, 'D7', 'standard', 'available', NULL),
(393, 14, NULL, NULL, 'D8', 'standard', 'available', NULL),
(394, 14, NULL, NULL, 'D9', 'standard', 'available', NULL),
(395, 14, NULL, NULL, 'D10', 'standard', 'available', NULL),
(396, 14, NULL, NULL, 'E1', 'standard', 'available', NULL),
(397, 14, NULL, NULL, 'E2', 'standard', 'available', NULL),
(398, 14, NULL, NULL, 'E3', 'standard', 'available', NULL),
(399, 14, NULL, NULL, 'E4', 'standard', 'available', NULL),
(400, 14, NULL, NULL, 'E5', 'standard', 'available', NULL),
(401, 14, NULL, NULL, 'E6', 'standard', 'available', NULL),
(402, 14, NULL, NULL, 'E7', 'standard', 'available', NULL),
(403, 14, NULL, NULL, 'E8', 'standard', 'available', NULL),
(404, 14, NULL, NULL, 'E9', 'standard', 'available', NULL),
(405, 14, NULL, NULL, 'E10', 'standard', 'available', NULL),
(406, 10, NULL, NULL, 'A1', 'standard', 'available', NULL),
(407, 10, NULL, NULL, 'A2', 'standard', 'available', NULL),
(408, 10, NULL, NULL, 'A3', 'standard', 'available', NULL),
(409, 10, NULL, NULL, 'A4', 'standard', 'available', NULL),
(410, 10, NULL, NULL, 'A5', 'standard', 'available', NULL),
(411, 10, NULL, NULL, 'A6', 'standard', 'available', NULL),
(412, 10, NULL, NULL, 'A7', 'standard', 'available', NULL),
(413, 10, NULL, NULL, 'A8', 'standard', 'available', NULL),
(414, 10, NULL, NULL, 'A9', 'standard', 'available', NULL),
(415, 10, NULL, NULL, 'A10', 'standard', 'available', NULL),
(416, 10, NULL, NULL, 'B1', 'standard', 'available', NULL),
(417, 10, NULL, NULL, 'B2', 'standard', 'available', NULL),
(418, 10, NULL, NULL, 'B3', 'standard', 'available', NULL),
(419, 10, NULL, NULL, 'B4', 'standard', 'available', NULL),
(420, 10, NULL, NULL, 'B5', 'standard', 'available', NULL),
(421, 10, NULL, NULL, 'B6', 'standard', 'available', NULL),
(422, 10, NULL, NULL, 'B7', 'standard', 'available', NULL),
(423, 10, NULL, NULL, 'B8', 'standard', 'available', NULL),
(424, 10, NULL, NULL, 'B9', 'standard', 'available', NULL),
(425, 10, NULL, NULL, 'B10', 'standard', 'available', NULL),
(426, 10, NULL, NULL, 'C1', 'standard', 'available', NULL),
(427, 10, NULL, NULL, 'C2', 'standard', 'available', NULL),
(428, 10, NULL, NULL, 'C3', 'standard', 'available', NULL),
(429, 10, NULL, NULL, 'C4', 'standard', 'available', NULL),
(430, 10, NULL, NULL, 'C5', 'standard', 'available', NULL),
(431, 10, NULL, NULL, 'C6', 'standard', 'available', NULL),
(432, 10, NULL, NULL, 'C7', 'standard', 'available', NULL),
(433, 10, NULL, NULL, 'C8', 'standard', 'available', NULL),
(434, 10, NULL, NULL, 'C9', 'standard', 'available', NULL),
(435, 10, NULL, NULL, 'C10', 'standard', 'available', NULL),
(436, 10, NULL, NULL, 'D1', 'standard', 'available', NULL),
(437, 10, NULL, NULL, 'D2', 'standard', 'available', NULL),
(438, 10, NULL, NULL, 'D3', 'standard', 'available', NULL),
(439, 10, NULL, NULL, 'D4', 'standard', 'available', NULL),
(440, 10, NULL, NULL, 'D5', 'standard', 'available', NULL),
(441, 10, NULL, NULL, 'D6', 'standard', 'available', NULL),
(442, 10, NULL, NULL, 'D7', 'standard', 'available', NULL),
(443, 10, NULL, NULL, 'D8', 'standard', 'available', NULL),
(444, 10, NULL, NULL, 'D9', 'standard', 'available', NULL),
(445, 10, NULL, NULL, 'D10', 'standard', 'available', NULL),
(446, 10, NULL, NULL, 'E1', 'standard', 'available', NULL),
(447, 10, NULL, NULL, 'E2', 'standard', 'available', NULL),
(448, 10, NULL, NULL, 'E3', 'standard', 'available', NULL),
(449, 10, NULL, NULL, 'E4', 'standard', 'available', NULL),
(450, 10, NULL, NULL, 'E5', 'standard', 'available', NULL),
(451, 10, NULL, NULL, 'E6', 'standard', 'available', NULL),
(452, 10, NULL, NULL, 'E7', 'standard', 'available', NULL),
(453, 10, NULL, NULL, 'E8', 'standard', 'available', NULL),
(454, 10, NULL, NULL, 'E9', 'standard', 'available', NULL),
(455, 10, NULL, NULL, 'E10', 'standard', 'available', NULL),
(556, 17, NULL, NULL, 'A1', 'standard', 'available', NULL),
(557, 17, NULL, NULL, 'A2', 'standard', 'available', NULL),
(558, 17, NULL, NULL, 'A3', 'standard', 'available', NULL),
(559, 17, NULL, NULL, 'A4', 'standard', 'available', NULL),
(560, 17, NULL, NULL, 'A5', 'standard', 'available', NULL),
(561, 17, NULL, NULL, 'A6', 'standard', 'available', NULL),
(562, 17, NULL, NULL, 'A7', 'standard', 'available', NULL),
(563, 17, NULL, NULL, 'A8', 'standard', 'available', NULL),
(564, 17, NULL, NULL, 'A9', 'standard', 'available', NULL),
(565, 17, NULL, NULL, 'A10', 'standard', 'available', NULL),
(566, 17, NULL, NULL, 'B1', 'standard', 'available', NULL),
(567, 17, NULL, NULL, 'B2', 'standard', 'available', NULL),
(568, 17, NULL, NULL, 'B3', 'standard', 'available', NULL),
(569, 17, NULL, NULL, 'B4', 'standard', 'available', NULL),
(570, 17, NULL, NULL, 'B5', 'standard', 'available', NULL),
(571, 17, NULL, NULL, 'B6', 'standard', 'available', NULL),
(572, 17, NULL, NULL, 'B7', 'standard', 'available', NULL),
(573, 17, NULL, NULL, 'B8', 'standard', 'available', NULL),
(574, 17, NULL, NULL, 'B9', 'standard', 'available', NULL),
(575, 17, NULL, NULL, 'B10', 'standard', 'available', NULL),
(576, 17, NULL, NULL, 'C1', 'standard', 'available', NULL),
(577, 17, NULL, NULL, 'C2', 'standard', 'available', NULL),
(578, 17, NULL, NULL, 'C3', 'standard', 'available', NULL),
(579, 17, NULL, NULL, 'C4', 'standard', 'available', NULL),
(580, 17, NULL, NULL, 'C5', 'standard', 'available', NULL),
(581, 17, NULL, NULL, 'C6', 'standard', 'available', NULL),
(582, 17, NULL, NULL, 'C7', 'standard', 'available', NULL),
(583, 17, NULL, NULL, 'C8', 'standard', 'available', NULL),
(584, 17, NULL, NULL, 'C9', 'standard', 'available', NULL),
(585, 17, NULL, NULL, 'C10', 'standard', 'available', NULL),
(586, 17, NULL, NULL, 'D1', 'standard', 'available', NULL),
(587, 17, NULL, NULL, 'D2', 'standard', 'available', NULL),
(588, 17, NULL, NULL, 'D3', 'standard', 'available', NULL),
(589, 17, NULL, NULL, 'D4', 'standard', 'available', NULL),
(590, 17, NULL, NULL, 'D5', 'standard', 'available', NULL),
(591, 17, NULL, NULL, 'D6', 'standard', 'available', NULL),
(592, 17, NULL, NULL, 'D7', 'standard', 'available', NULL),
(593, 17, NULL, NULL, 'D8', 'standard', 'available', NULL),
(594, 17, NULL, NULL, 'D9', 'standard', 'available', NULL),
(595, 17, NULL, NULL, 'D10', 'standard', 'available', NULL),
(596, 17, NULL, NULL, 'E1', 'standard', 'available', NULL),
(597, 17, NULL, NULL, 'E2', 'standard', 'available', NULL),
(598, 17, NULL, NULL, 'E3', 'standard', 'available', NULL),
(599, 17, NULL, NULL, 'E4', 'standard', 'available', NULL),
(600, 17, NULL, NULL, 'E5', 'standard', 'available', NULL),
(601, 17, NULL, NULL, 'E6', 'standard', 'available', NULL),
(602, 17, NULL, NULL, 'E7', 'standard', 'available', NULL),
(603, 17, NULL, NULL, 'E8', 'standard', 'available', NULL),
(604, 17, NULL, NULL, 'E9', 'standard', 'available', NULL),
(605, 17, NULL, NULL, 'E10', 'standard', 'available', NULL),
(606, 13, NULL, NULL, 'A1', 'standard', 'available', NULL),
(607, 13, NULL, NULL, 'A2', 'standard', 'available', NULL),
(608, 13, NULL, NULL, 'A3', 'standard', 'available', NULL),
(609, 13, NULL, NULL, 'A4', 'standard', 'available', NULL),
(610, 13, NULL, NULL, 'A5', 'standard', 'available', NULL),
(611, 13, NULL, NULL, 'A6', 'standard', 'available', NULL),
(612, 13, NULL, NULL, 'A7', 'standard', 'available', NULL),
(613, 13, NULL, NULL, 'A8', 'standard', 'available', NULL),
(614, 13, NULL, NULL, 'A9', 'standard', 'available', NULL),
(615, 13, NULL, NULL, 'A10', 'standard', 'available', NULL),
(616, 13, NULL, NULL, 'B1', 'standard', 'available', NULL),
(617, 13, NULL, NULL, 'B2', 'standard', 'available', NULL),
(618, 13, NULL, NULL, 'B3', 'standard', 'available', NULL),
(619, 13, NULL, NULL, 'B4', 'standard', 'available', NULL),
(620, 13, NULL, NULL, 'B5', 'standard', 'available', NULL),
(621, 13, NULL, NULL, 'B6', 'standard', 'available', NULL),
(622, 13, NULL, NULL, 'B7', 'standard', 'available', NULL),
(623, 13, NULL, NULL, 'B8', 'standard', 'available', NULL),
(624, 13, NULL, NULL, 'B9', 'standard', 'available', NULL),
(625, 13, NULL, NULL, 'B10', 'standard', 'available', NULL),
(626, 13, NULL, NULL, 'C1', 'standard', 'available', NULL),
(627, 13, NULL, NULL, 'C2', 'standard', 'available', NULL),
(628, 13, NULL, NULL, 'C3', 'standard', 'available', NULL),
(629, 13, NULL, NULL, 'C4', 'standard', 'available', NULL),
(630, 13, NULL, NULL, 'C5', 'standard', 'available', NULL),
(631, 13, NULL, NULL, 'C6', 'standard', 'available', NULL),
(632, 13, NULL, NULL, 'C7', 'standard', 'available', NULL),
(633, 13, NULL, NULL, 'C8', 'standard', 'available', NULL),
(634, 13, NULL, NULL, 'C9', 'standard', 'available', NULL),
(635, 13, NULL, NULL, 'C10', 'standard', 'available', NULL),
(636, 13, NULL, NULL, 'D1', 'standard', 'available', NULL),
(637, 13, NULL, NULL, 'D2', 'standard', 'available', NULL),
(638, 13, NULL, NULL, 'D3', 'standard', 'available', NULL),
(639, 13, NULL, NULL, 'D4', 'standard', 'available', NULL),
(640, 13, NULL, NULL, 'D5', 'standard', 'available', NULL),
(641, 13, NULL, NULL, 'D6', 'standard', 'available', NULL),
(642, 13, NULL, NULL, 'D7', 'standard', 'available', NULL),
(643, 13, NULL, NULL, 'D8', 'standard', 'available', NULL),
(644, 13, NULL, NULL, 'D9', 'standard', 'available', NULL),
(645, 13, NULL, NULL, 'D10', 'standard', 'available', NULL),
(646, 13, NULL, NULL, 'E1', 'standard', 'available', NULL),
(647, 13, NULL, NULL, 'E2', 'standard', 'available', NULL),
(648, 13, NULL, NULL, 'E3', 'standard', 'available', NULL),
(649, 13, NULL, NULL, 'E4', 'standard', 'available', NULL),
(650, 13, NULL, NULL, 'E5', 'standard', 'available', NULL),
(651, 13, NULL, NULL, 'E6', 'standard', 'available', NULL),
(652, 13, NULL, NULL, 'E7', 'standard', 'available', NULL),
(653, 13, NULL, NULL, 'E8', 'standard', 'available', NULL),
(654, 13, NULL, NULL, 'E9', 'standard', 'available', NULL),
(655, 13, NULL, NULL, 'E10', 'standard', 'available', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(10) UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('4yONN5ndKSIdG4AC0U5MgneslPo0kvKM', 1756219313, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"flash\":{},\"user\":{\"id\":12,\"name\":\"PANNAWAT KHOOKAEW\",\"email\":\"darknightkung@gmail.com\",\"role\":\"admin\"}}'),
('9y5kamdMedTfsFIZs_mrZccGXcUYiKbn', 1756246818, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"flash\":{},\"user\":{\"id\":12,\"name\":\"PANNAWAT KHOOKAEW\",\"email\":\"darknightkung@gmail.com\",\"role\":\"admin\"}}'),
('GeDShB5fN_PmP0-oT_4d7FGMCQzFLEQg', 1756239904, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"flash\":{},\"user\":{\"id\":14,\"name\":\"user\",\"email\":\"user@email.com\",\"role\":\"\"}}'),
('StYhC3kU4Us0bieMyWtNrqM8b_fFpl4Y', 1756233430, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"flash\":{},\"user\":{\"id\":12,\"name\":\"PANNAWAT KHOOKAEW\",\"email\":\"darknightkung@gmail.com\",\"role\":\"admin\"}}');

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
(8, 1, 1, '2025-08-26 22:30:00', 120, 'THB', '2D', 'EN', 'scheduled', '2025-08-25 10:20:45'),
(9, 1, 1, '2025-08-25 12:05:00', 150, 'THB', '2D', 'TH', 'scheduled', '2025-08-25 11:26:21'),
(10, 2, 1, '2025-08-27 16:05:00', 200, 'THB', '4D', 'EN', 'scheduled', '2025-08-25 11:26:21'),
(11, 2, 1, '2025-08-27 10:05:00', 160, 'THB', '2D', 'TH', 'scheduled', '2025-08-25 11:26:21'),
(12, 2, 1, '2025-08-30 08:00:00', 160, 'THB', '2D', 'TH', 'scheduled', '2025-08-25 11:26:21'),
(13, 3, 1, '2025-08-29 18:00:00', 120, 'THB', '2D', 'TH', 'scheduled', '2025-08-25 11:26:21'),
(14, 3, 1, '2025-08-27 23:25:00', 120, 'THB', '2D', 'EN', 'scheduled', '2025-08-25 11:26:21'),
(15, 4, 1, '2025-08-27 13:00:00', 120, 'THB', '2D', 'EN', 'scheduled', '2025-08-25 11:26:21'),
(16, 4, 1, '2025-08-25 11:00:00', 250, 'THB', '4D', 'EN', 'scheduled', '2025-08-25 11:26:21'),
(17, 5, 1, '2025-08-27 12:00:00', 160, 'THB', '2D', 'EN', 'scheduled', '2025-08-25 11:26:21');

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
(12, 'PANNAWAT KHOOKAEW', 'darknightkung@gmail.com', '1928890424', 'admin', '123', '2025-08-19 13:01:48', '2025-08-20 05:43:47'),
(13, 'ball', 'ball@email.com', NULL, 'admin', '123', '2025-08-19 13:01:48', '2025-08-20 05:43:47'),
(14, 'user', 'user@email.com', NULL, '', 'user123', '2025-08-19 13:01:48', '2025-08-20 05:43:47');

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
  ADD KEY `idx_orders_user_status` (`user_id`,`status`),
  ADD KEY `idx_orders_showtime` (`showtime_id`);

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
  ADD KEY `fk_payment_order` (`order_id`),
  ADD KEY `fk_payment_user` (`user_id`),
  ADD KEY `fk_payment_admin` (`checked_by`);

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
  ADD UNIQUE KEY `ux_seat_unique` (`showtime_id`,`seat_code`),
  ADD KEY `idx_si_st_status` (`showtime_id`,`status`),
  ADD KEY `fk_seatinventory_order` (`order_id`),
  ADD KEY `fk_seat_locked_by` (`locked_by`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `movies`
--
ALTER TABLE `movies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `screens`
--
ALTER TABLE `screens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `seat_inventory`
--
ALTER TABLE `seat_inventory`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=656;

--
-- AUTO_INCREMENT for table `showtimes`
--
ALTER TABLE `showtimes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `theaters`
--
ALTER TABLE `theaters`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

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
  ADD CONSTRAINT `fk_orders_showtime` FOREIGN KEY (`showtime_id`) REFERENCES `showtimes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD CONSTRAINT `fk_pr_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payment_admin` FOREIGN KEY (`checked_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_payment_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_payment_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `screens`
--
ALTER TABLE `screens`
  ADD CONSTRAINT `fk_screen_theater` FOREIGN KEY (`theater_id`) REFERENCES `theaters` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `seat_inventory`
--
ALTER TABLE `seat_inventory`
  ADD CONSTRAINT `fk_seat_locked_by` FOREIGN KEY (`locked_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_seat_showtime` FOREIGN KEY (`showtime_id`) REFERENCES `showtimes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_seatinventory_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `showtimes`
--
ALTER TABLE `showtimes`
  ADD CONSTRAINT `fk_st_movie` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_st_screen` FOREIGN KEY (`screen_id`) REFERENCES `screens` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
