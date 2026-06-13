-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: aimarket_db
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ai_usage_logs`
--

DROP TABLE IF EXISTS `ai_usage_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_usage_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `module` varchar(50) NOT NULL COMMENT 'JOB_ASSISTANT, SERVICE_GENERATOR, RECOMMENDATION',
  `tokens_used` int DEFAULT '0',
  `cost_usd` decimal(10,6) DEFAULT '0.000000',
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ai_usage_user` (`user_id`),
  KEY `idx_ai_usage_module` (`module`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_usage_logs`
--

LOCK TABLES `ai_usage_logs` WRITE;
/*!40000 ALTER TABLE `ai_usage_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `ai_usage_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_id` bigint DEFAULT NULL,
  `details` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_audit_user` (`user_id`),
  KEY `idx_audit_entity` (`entity_type`,`entity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contracts`
--

DROP TABLE IF EXISTS `contracts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contracts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `job_id` bigint NOT NULL,
  `proposal_id` bigint NOT NULL,
  `client_id` bigint NOT NULL,
  `expert_id` bigint NOT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `status` enum('ACTIVE','COMPLETED','DISPUTED','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE',
  `started_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_contract_proposal` (`proposal_id`),
  KEY `fk_contract_job` (`job_id`),
  KEY `idx_contracts_client` (`client_id`,`status`),
  KEY `idx_contracts_expert` (`expert_id`,`status`),
  CONSTRAINT `fk_contract_client` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_contract_expert` FOREIGN KEY (`expert_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_contract_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`),
  CONSTRAINT `fk_contract_proposal` FOREIGN KEY (`proposal_id`) REFERENCES `proposals` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contracts`
--

LOCK TABLES `contracts` WRITE;
/*!40000 ALTER TABLE `contracts` DISABLE KEYS */;
/*!40000 ALTER TABLE `contracts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `disputes`
--

DROP TABLE IF EXISTS `disputes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `disputes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `contract_id` bigint NOT NULL,
  `opened_by` bigint NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('OPEN','INVESTIGATING','RESOLVED') COLLATE utf8mb4_unicode_ci DEFAULT 'OPEN',
  `admin_note` text COLLATE utf8mb4_unicode_ci,
  `resolution` enum('REFUND_CLIENT','RELEASE_EXPERT','PARTIAL') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resolved_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_dispute_contract` (`contract_id`),
  KEY `fk_dispute_opener` (`opened_by`),
  KEY `idx_disputes_status` (`status`),
  CONSTRAINT `fk_dispute_contract` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`),
  CONSTRAINT `fk_dispute_opener` FOREIGN KEY (`opened_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disputes`
--

LOCK TABLES `disputes` WRITE;
/*!40000 ALTER TABLE `disputes` DISABLE KEYS */;
/*!40000 ALTER TABLE `disputes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `escrow_accounts`
--

DROP TABLE IF EXISTS `escrow_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `escrow_accounts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `balance` decimal(15,2) DEFAULT '0.00',
  `locked_amount` decimal(15,2) DEFAULT '0.00',
  `total_deposited` decimal(15,2) DEFAULT '0.00',
  `total_released` decimal(15,2) DEFAULT '0.00',
  `currency` char(3) DEFAULT 'USD',
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_escrow_user` (`user_id`),
  CONSTRAINT `fk_escrow_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `escrow_accounts`
--

LOCK TABLES `escrow_accounts` WRITE;
/*!40000 ALTER TABLE `escrow_accounts` DISABLE KEYS */;
INSERT INTO `escrow_accounts` VALUES (1,28,1000.00,0.00,1000.00,0.00,'USD','2026-06-13 08:14:57'),(2,29,0.00,0.00,0.00,0.00,'USD','2026-06-13 08:14:57');
/*!40000 ALTER TABLE `escrow_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flyway_schema_history`
--

DROP TABLE IF EXISTS `flyway_schema_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flyway_schema_history` (
  `installed_rank` int NOT NULL,
  `version` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `script` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` int DEFAULT NULL,
  `installed_by` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `installed_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `execution_time` int NOT NULL,
  `success` tinyint(1) NOT NULL,
  PRIMARY KEY (`installed_rank`),
  KEY `flyway_schema_history_s_idx` (`success`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flyway_schema_history`
--

LOCK TABLES `flyway_schema_history` WRITE;
/*!40000 ALTER TABLE `flyway_schema_history` DISABLE KEYS */;
INSERT INTO `flyway_schema_history` VALUES (1,'1','init schema','SQL','V1__init_schema.sql',-277738445,'root','2026-05-28 14:10:05',1026,1),(2,'2','seed skills','SQL','V2__seed_skills.sql',-1060183258,'root','2026-05-28 14:10:05',5,1),(3,'3','add indexes','SQL','V3__add_indexes.sql',604508357,'root','2026-05-28 14:10:05',105,1),(4,'4','seed test accounts','SQL','V4__seed_test_accounts.sql',88090084,'root','2026-06-13 08:14:57',75,1),(5,'5','add portfolio and job timeline','SQL','V5__add_portfolio_and_job_timeline.sql',959353439,'root','2026-06-13 08:14:57',810,1);
/*!40000 ALTER TABLE `flyway_schema_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_skills`
--

DROP TABLE IF EXISTS `job_skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_skills` (
  `job_id` bigint NOT NULL,
  `skill_id` bigint NOT NULL,
  PRIMARY KEY (`job_id`,`skill_id`),
  KEY `fk_js_skill` (`skill_id`),
  CONSTRAINT `fk_js_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_js_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_skills`
--

LOCK TABLES `job_skills` WRITE;
/*!40000 ALTER TABLE `job_skills` DISABLE KEYS */;
INSERT INTO `job_skills` VALUES (5,3),(5,4),(5,5);
/*!40000 ALTER TABLE `job_skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `client_id` bigint NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `budget_min` decimal(15,2) DEFAULT NULL,
  `budget_max` decimal(15,2) DEFAULT NULL,
  `deadline` date DEFAULT NULL,
  `status` enum('DRAFT','OPEN','IN_PROGRESS','COMPLETED','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'DRAFT',
  `ai_enhanced` tinyint(1) DEFAULT '0',
  `view_count` int DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `expected_duration` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_jobs_client_id` (`client_id`),
  KEY `idx_jobs_status` (`status`),
  KEY `idx_jobs_status_created` (`status`,`created_at` DESC),
  FULLTEXT KEY `idx_jobs_search` (`title`,`description`),
  CONSTRAINT `fk_job_client` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
INSERT INTO `jobs` VALUES (1,1,'Build a Customer Support Chatbot using OpenAI API','We need an experienced AI developer to build a RAG-based customer support chatbot for our e-commerce website. The bot should be able to read our product catalog and answer customer queries accurately.',500.00,1500.00,'2026-06-11','OPEN',1,45,'2026-05-28 15:01:31','2026-05-28 15:01:31',NULL,NULL),(2,1,'Fine-tune LLaMA 3 for Legal Documents','Looking for an AI expert to fine-tune a local LLM on a dataset of legal documents. Must have experience with LoRA and PyTorch.',2000.00,5000.00,'2026-06-27','OPEN',1,12,'2026-05-28 15:01:31','2026-05-28 15:01:31',NULL,NULL),(3,2,'Automated Product Image Background Removal','Need a Python script that uses Computer Vision (like rembg or SAM) to automatically remove backgrounds from our product photos in bulk.',200.00,600.00,'2026-06-04','OPEN',0,89,'2026-05-28 15:01:31','2026-05-28 15:01:31',NULL,NULL),(4,2,'AI Voice Generator Integration','Looking for someone to integrate ElevenLabs API into our existing Node.js application to generate voiceovers for our videos.',300.00,800.00,'2026-06-07','OPEN',0,23,'2026-05-28 15:01:31','2026-05-28 15:01:31',NULL,NULL),(5,30,'gyusdgfuie  uydtfui sd sudugh i sdugh f sdufgh  sdufhg ui','údhf uihsd fyuisd fyddf  fsdf sdfsdfsufhsddu fsdhf sdfs fhsd ùiusd fsd fuisf úid fsf sdf sdfsd fsd fsdf sdf sdsd fs',999.00,9999.00,'2026-06-19','OPEN',0,2,'2026-06-13 08:16:37','2026-06-13 08:16:39',NULL,NULL);
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `contract_id` bigint NOT NULL,
  `sender_id` bigint NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_msg_sender` (`sender_id`),
  KEY `idx_messages_contract_created` (`contract_id`,`created_at` DESC),
  KEY `idx_messages_unread` (`contract_id`,`is_read`),
  CONSTRAINT `fk_msg_contract` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`),
  CONSTRAINT `fk_msg_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `milestones`
--

DROP TABLE IF EXISTS `milestones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `milestones` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `contract_id` bigint NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `amount` decimal(15,2) NOT NULL,
  `due_date` date DEFAULT NULL,
  `status` enum('PENDING','IN_PROGRESS','SUBMITTED','APPROVED','REJECTED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `deliverable_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deliverable_note` text COLLATE utf8mb4_unicode_ci,
  `order_index` int DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_milestones_contract` (`contract_id`,`order_index`),
  CONSTRAINT `fk_milestone_contract` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `milestones`
--

LOCK TABLES `milestones` WRITE;
/*!40000 ALTER TABLE `milestones` DISABLE KEYS */;
/*!40000 ALTER TABLE `milestones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `is_read` tinyint(1) DEFAULT '0',
  `reference_id` bigint DEFAULT NULL COMMENT 'contract_id, job_id, etc.',
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user_read` (`user_id`,`is_read`),
  KEY `idx_notif_user_unread` (`user_id`,`is_read`,`created_at` DESC),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `portfolio_items`
--

DROP TABLE IF EXISTS `portfolio_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `portfolio_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_profile_id` bigint NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `demo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_portfolio_user_profile` (`user_profile_id`),
  CONSTRAINT `fk_portfolio_user_profile` FOREIGN KEY (`user_profile_id`) REFERENCES `user_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `portfolio_items`
--

LOCK TABLES `portfolio_items` WRITE;
/*!40000 ALTER TABLE `portfolio_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `portfolio_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proposals`
--

DROP TABLE IF EXISTS `proposals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proposals` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `job_id` bigint NOT NULL,
  `expert_id` bigint NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `timeline_days` int NOT NULL,
  `cover_letter` text COLLATE utf8mb4_unicode_ci,
  `status` enum('PENDING','ACCEPTED','REJECTED','WITHDRAWN') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_proposal` (`job_id`,`expert_id`),
  KEY `fk_proposal_expert` (`expert_id`),
  KEY `idx_proposals_job_status` (`job_id`,`status`),
  KEY `idx_proposals_job_expert` (`job_id`,`expert_id`),
  CONSTRAINT `fk_proposal_expert` FOREIGN KEY (`expert_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_proposal_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proposals`
--

LOCK TABLES `proposals` WRITE;
/*!40000 ALTER TABLE `proposals` DISABLE KEYS */;
/*!40000 ALTER TABLE `proposals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `token_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `revoked` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_token_hash` (`token_hash`),
  KEY `idx_rt_user` (`user_id`),
  CONSTRAINT `fk_rt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
INSERT INTO `refresh_tokens` VALUES (1,25,'oq/GqW32kDvR0ZU4I5n69ERRetIstHDf8G5ppo8hxgw=','2026-06-04 15:56:54',1,'2026-05-28 15:56:54'),(2,26,'4KrZojjHl1HeGQXUX37f+nMaElXNLC4Rhn54SC00PFQ=','2026-06-04 15:57:21',1,'2026-05-28 15:57:21'),(3,26,'q4SrnqG2ZeKufzwAzZ/uNr7HNUrotUyJVPW6DcxC/oY=','2026-06-04 15:57:34',1,'2026-05-28 15:57:34'),(4,25,'TgRmzyea6B1phQffAoqutQhPVvcQ03xh5gY+ddoRVAc=','2026-06-04 16:44:26',0,'2026-05-28 16:44:26'),(5,26,'pSLfhjdj5Gei2tXB+oZj5sybOIdHGmnC2gHnoC+j05o=','2026-06-04 16:47:34',1,'2026-05-28 16:47:34'),(6,30,'iMApf6vao98TGo9wdlwb8Bl1jIC0H+H3Za7YT6HZE7s=','2026-06-20 08:15:49',1,'2026-06-13 08:15:49'),(7,30,'jhKtRF946yvZOtqXaddP5yE/zoOCSqfwMso90j3V740=','2026-06-20 08:16:01',0,'2026-06-13 08:16:01');
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `contract_id` bigint NOT NULL,
  `reviewer_id` bigint NOT NULL,
  `reviewee_id` bigint NOT NULL,
  `rating` tinyint NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_review_contract_reviewer` (`contract_id`,`reviewer_id`),
  KEY `fk_review_reviewer` (`reviewer_id`),
  KEY `idx_reviews_reviewee` (`reviewee_id`),
  CONSTRAINT `fk_review_contract` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`),
  CONSTRAINT `fk_review_reviewee` FOREIGN KEY (`reviewee_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_review_reviewer` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `reviews_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `expert_id` bigint NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(15,2) NOT NULL,
  `delivery_days` int NOT NULL,
  `status` enum('ACTIVE','INACTIVE','PENDING_REVIEW') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING_REVIEW',
  `tags` json DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT '0.00',
  `order_count` int DEFAULT '0',
  `skills_embedding` json DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_services_expert` (`expert_id`),
  KEY `idx_services_status` (`status`),
  FULLTEXT KEY `idx_services_search` (`title`,`description`),
  CONSTRAINT `fk_service_expert` FOREIGN KEY (`expert_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES (1,3,'Custom ChatGPT Clone Development','I will build a custom ChatGPT clone tailored to your business needs, integrated with your company data using LangChain and Pinecone.',999.00,7,'ACTIVE',NULL,4.90,15,NULL,'2026-05-28 15:01:31','2026-05-28 15:01:31'),(2,3,'AI Prompt Engineering & Optimization','I will write and optimize complex prompts for your AI applications to get consistent, high-quality JSON outputs and reduce token costs.',150.00,2,'ACTIVE',NULL,5.00,42,NULL,'2026-05-28 15:01:31','2026-05-28 15:01:31'),(3,4,'Computer Vision / Object Detection Model','I will train a custom YOLOv8 model on your dataset to detect specific objects in images or video streams.',1200.00,14,'ACTIVE',NULL,4.80,8,NULL,'2026-05-28 15:01:31','2026-05-28 15:01:31'),(4,4,'Data Scraping & NLP Analysis','I will scrape data from websites and perform sentiment analysis and entity extraction using NLP models.',350.00,5,'ACTIVE',NULL,5.00,21,NULL,'2026-05-28 15:01:31','2026-05-28 15:01:31');
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `skills`
--

DROP TABLE IF EXISTS `skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `skills` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_skill_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `skills`
--

LOCK TABLES `skills` WRITE;
/*!40000 ALTER TABLE `skills` DISABLE KEYS */;
INSERT INTO `skills` VALUES (1,'AI/ML','Machine Learning','2026-05-28 14:10:05'),(2,'AI/ML','Deep Learning','2026-05-28 14:10:05'),(3,'AI/ML','Natural Language Processing','2026-05-28 14:10:05'),(4,'AI/ML','Computer Vision','2026-05-28 14:10:05'),(5,'AI/ML','Reinforcement Learning','2026-05-28 14:10:05'),(6,'AI/ML','Time Series Analysis','2026-05-28 14:10:05'),(7,'AI/ML','Anomaly Detection','2026-05-28 14:10:05'),(8,'Frameworks','PyTorch','2026-05-28 14:10:05'),(9,'Frameworks','TensorFlow','2026-05-28 14:10:05'),(10,'Frameworks','Scikit-learn','2026-05-28 14:10:05'),(11,'Frameworks','Keras','2026-05-28 14:10:05'),(12,'Frameworks','Hugging Face Transformers','2026-05-28 14:10:05'),(13,'Frameworks','LangChain','2026-05-28 14:10:05'),(14,'Frameworks','LlamaIndex','2026-05-28 14:10:05'),(15,'Generative AI','Prompt Engineering','2026-05-28 14:10:05'),(16,'Generative AI','RAG (Retrieval-Augmented Generation)','2026-05-28 14:10:05'),(17,'Generative AI','Fine-tuning LLMs','2026-05-28 14:10:05'),(18,'Generative AI','LLM Evaluation','2026-05-28 14:10:05'),(19,'Generative AI','AI Agents','2026-05-28 14:10:05'),(20,'Generative AI','Vector Databases','2026-05-28 14:10:05'),(21,'Programming','Python','2026-05-28 14:10:05'),(22,'Programming','R','2026-05-28 14:10:05'),(23,'Programming','SQL','2026-05-28 14:10:05'),(24,'Programming','Rust','2026-05-28 14:10:05'),(25,'Data','Data Engineering','2026-05-28 14:10:05'),(26,'Data','Apache Spark','2026-05-28 14:10:05'),(27,'Data','Data Visualization','2026-05-28 14:10:05'),(28,'Data','Feature Engineering','2026-05-28 14:10:05'),(29,'MLOps','MLOps','2026-05-28 14:10:05'),(30,'MLOps','Model Deployment','2026-05-28 14:10:05');
/*!40000 ALTER TABLE `skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `contract_id` bigint DEFAULT NULL,
  `milestone_id` bigint DEFAULT NULL,
  `type` enum('DEPOSIT','ESCROW_LOCK','RELEASE','REFUND','FEE','WITHDRAW') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `currency` char(3) COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `status` enum('PENDING','SUCCESS','FAILED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `ref_code` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_tx_contract` (`contract_id`),
  KEY `fk_tx_milestone` (`milestone_id`),
  KEY `idx_transactions_user_created` (`user_id`,`created_at` DESC),
  KEY `idx_transactions_ref_code` (`ref_code`),
  KEY `idx_tx_type_status` (`type`,`status`),
  CONSTRAINT `fk_tx_contract` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`),
  CONSTRAINT `fk_tx_milestone` FOREIGN KEY (`milestone_id`) REFERENCES `milestones` (`id`),
  CONSTRAINT `fk_tx_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_profiles`
--

DROP TABLE IF EXISTS `user_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_profiles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `portfolio_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hourly_rate` decimal(10,2) DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT '0.00',
  `total_reviews` int DEFAULT '0',
  `completion_rate` decimal(5,2) DEFAULT '0.00',
  `is_available` tinyint(1) DEFAULT '1',
  `skills_embedding` json DEFAULT NULL COMMENT 'Vector embedding (1536 dims) for AI recommendation',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_profile_user` (`user_id`),
  CONSTRAINT `fk_profile_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_profiles`
--

LOCK TABLES `user_profiles` WRITE;
/*!40000 ALTER TABLE `user_profiles` DISABLE KEYS */;
INSERT INTO `user_profiles` VALUES (1,1,'John Tech (Client)','Startup founder looking for AI developers to build amazing products.','https://ui-avatars.com/api/?name=John+Tech&background=random',NULL,NULL,4.80,12,100.00,1,NULL,'2026-05-28 15:01:31','2026-05-28 15:01:31'),(2,2,'Alice Smith (Client)','Marketing director at an e-commerce agency.','https://ui-avatars.com/api/?name=Alice+Smith&background=random',NULL,NULL,5.00,4,100.00,1,NULL,'2026-05-28 15:01:31','2026-05-28 15:01:31'),(3,3,'Bob AI (Expert)','Senior AI/ML Engineer with 5 years of experience building chatbots and RAG systems.','https://ui-avatars.com/api/?name=Bob+AI&background=random',NULL,45.00,4.90,32,98.50,1,NULL,'2026-05-28 15:01:31','2026-05-28 15:01:31'),(4,4,'Sarah Data (Expert)','Data Scientist specialized in NLP and computer vision models.','https://ui-avatars.com/api/?name=Sarah+Data&background=random',NULL,55.00,5.00,18,100.00,1,NULL,'2026-05-28 15:01:31','2026-05-28 15:01:31'),(25,25,'Updated Name','Test bio updated',NULL,NULL,NULL,0.00,0,0.00,1,NULL,'2026-05-28 15:56:54','2026-05-28 16:44:28'),(26,26,'quachtrong',NULL,NULL,NULL,NULL,0.00,0,0.00,1,NULL,'2026-05-28 15:57:21','2026-05-28 15:57:21'),(27,27,'QA Admin','System administrator account for QA testing',NULL,NULL,NULL,0.00,0,0.00,1,NULL,'2026-06-13 08:14:57','2026-06-13 08:14:57'),(28,28,'QA Client','Sample client account for QA end-to-end testing',NULL,NULL,NULL,0.00,0,0.00,1,NULL,'2026-06-13 08:14:57','2026-06-13 08:14:57'),(29,29,'QA Expert','Sample expert account for QA end-to-end testing',NULL,NULL,50.00,0.00,0,0.00,1,NULL,'2026-06-13 08:14:57','2026-06-13 08:14:57'),(30,30,'Phan thanh thiên',NULL,NULL,NULL,NULL,0.00,0,0.00,1,NULL,'2026-06-13 08:15:49','2026-06-13 08:15:49');
/*!40000 ALTER TABLE `user_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_skills`
--

DROP TABLE IF EXISTS `user_skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_skills` (
  `user_id` bigint NOT NULL,
  `skill_id` bigint NOT NULL,
  PRIMARY KEY (`user_id`,`skill_id`),
  KEY `fk_us_skill` (`skill_id`),
  CONSTRAINT `fk_us_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_us_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_skills`
--

LOCK TABLES `user_skills` WRITE;
/*!40000 ALTER TABLE `user_skills` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('CLIENT','EXPERT','ADMIN') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('ACTIVE','SUSPENDED','PENDING') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `email_verified` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'client1@example.com','$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjGVX/n/.m','CLIENT','ACTIVE',1,'2026-05-28 15:01:31','2026-05-28 15:01:31'),(2,'client2@example.com','$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjGVX/n/.m','CLIENT','ACTIVE',1,'2026-05-28 15:01:31','2026-05-28 15:01:31'),(3,'expert1@example.com','$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjGVX/n/.m','EXPERT','ACTIVE',1,'2026-05-28 15:01:31','2026-05-28 15:01:31'),(4,'expert2@example.com','$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjGVX/n/.m','EXPERT','ACTIVE',1,'2026-05-28 15:01:31','2026-05-28 15:01:31'),(25,'test@example.com','$2a$12$q2uozfRLchom/T2zrd0mBeTjj2FCPljBcLQwm.qDRABnybqiOPYeG','CLIENT','ACTIVE',0,'2026-05-28 15:56:54','2026-05-28 15:56:54'),(26,'trongnen1111@gmail.com','$2a$12$7x35oaF94s5dyHBQKmLveuGeF/ta/E1PP45GBkgEBPFhPB6P98YEK','CLIENT','ACTIVE',0,'2026-05-28 15:57:21','2026-05-28 15:57:21'),(27,'admin@test.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','ADMIN','ACTIVE',1,'2026-06-13 08:14:57','2026-06-13 08:14:57'),(28,'client@test.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','CLIENT','ACTIVE',1,'2026-06-13 08:14:57','2026-06-13 08:14:57'),(29,'expert@test.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','EXPERT','ACTIVE',1,'2026-06-13 08:14:57','2026-06-13 08:14:57'),(30,'trongquach.010605www@gmail.com','$2a$12$ZCfvsTvl/Z14LRDti9gaKuaAc12PUFluueYx/.n7kbo66qXwk9iVq','CLIENT','ACTIVE',0,'2026-06-13 08:15:49','2026-06-13 08:15:49');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-13  9:10:26
