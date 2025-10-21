-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: ocs3
-- ------------------------------------------------------
-- Server version	8.0.37

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `asistencia`
--

DROP TABLE IF EXISTS `asistencia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asistencia` (
  `id_asistencia` int NOT NULL AUTO_INCREMENT,
  `id_sesion` int NOT NULL,
  `id_usuario` int NOT NULL,
  `tipo_asistencia` enum('presente','remoto','ausente') COLLATE utf8mb4_general_ci DEFAULT 'ausente',
  `estado` tinyint DEFAULT '1',
  `status` tinyint DEFAULT '1',
  PRIMARY KEY (`id_asistencia`),
  UNIQUE KEY `uq_asistencia_sesion_usuario` (`id_sesion`,`id_usuario`),
  KEY `fk_asistencia_sesion` (`id_sesion`),
  KEY `fk_asistencia_usuario` (`id_usuario`),
  CONSTRAINT `fk_asistencia_sesion` FOREIGN KEY (`id_sesion`) REFERENCES `sesion` (`id_sesion`) ON DELETE CASCADE,
  CONSTRAINT `fk_asistencia_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1539 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asistencia`
--

LOCK TABLES `asistencia` WRITE;
/*!40000 ALTER TABLE `asistencia` DISABLE KEYS */;
INSERT INTO `asistencia` VALUES (1463,16,30,'presente',1,1),(1464,16,31,'presente',1,1),(1465,16,40,'presente',1,1),(1466,16,71,'presente',1,1),(1467,16,21,'presente',1,1),(1468,16,22,'presente',1,1),(1469,16,23,'presente',1,1),(1470,16,47,'presente',1,1),(1471,16,32,'presente',1,1),(1472,16,38,'presente',1,1),(1473,16,35,'presente',1,1),(1474,16,49,'presente',1,1),(1475,16,46,'presente',1,1),(1476,16,45,'presente',1,1),(1477,16,26,'presente',1,1),(1478,16,24,'presente',1,1),(1479,16,69,'presente',1,1),(1480,16,43,'presente',1,1),(1481,16,37,'presente',1,1),(1482,16,39,'presente',1,1),(1483,16,25,'presente',1,1),(1484,16,33,'presente',1,1),(1485,16,20,'presente',1,1),(1486,16,44,'presente',1,1),(1487,16,53,'presente',1,1),(1488,16,52,'presente',1,1),(1489,16,67,'presente',1,1),(1490,16,66,'presente',1,1),(1491,16,50,'presente',1,1),(1492,16,48,'presente',1,1),(1493,16,27,'presente',1,1),(1494,16,28,'presente',1,1),(1495,16,51,'presente',1,1),(1496,16,68,'presente',1,1),(1497,16,70,'presente',1,1),(1498,16,34,'presente',1,1),(1499,16,42,'presente',1,1),(1500,16,36,'presente',1,1),(1501,17,30,'presente',1,1),(1502,17,31,'presente',1,1),(1503,17,40,'presente',1,1),(1504,17,71,'presente',1,1),(1505,17,21,'presente',1,1),(1506,17,22,'presente',1,1),(1507,17,23,'presente',1,1),(1508,17,47,'presente',1,1),(1509,17,32,'presente',1,1),(1510,17,38,'presente',1,1),(1511,17,35,'presente',1,1),(1512,17,49,'presente',1,1),(1513,17,46,'presente',1,1),(1514,17,45,'presente',1,1),(1515,17,26,'presente',1,1),(1516,17,24,'presente',1,1),(1517,17,69,'presente',1,1),(1518,17,43,'presente',1,1),(1519,17,37,'presente',1,1),(1520,17,39,'presente',1,1),(1521,17,25,'presente',1,1),(1522,17,33,'presente',1,1),(1523,17,20,'presente',1,1),(1524,17,44,'presente',1,1),(1525,17,53,'presente',1,1),(1526,17,52,'presente',1,1),(1527,17,67,'presente',1,1),(1528,17,66,'presente',1,1),(1529,17,50,'presente',1,1),(1530,17,48,'presente',1,1),(1531,17,27,'presente',1,1),(1532,17,28,'presente',1,1),(1533,17,51,'presente',1,1),(1534,17,68,'presente',1,1),(1535,17,70,'presente',1,1),(1536,17,34,'presente',1,1),(1537,17,42,'presente',1,1),(1538,17,36,'presente',1,1);
/*!40000 ALTER TABLE `asistencia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auditoria`
--

DROP TABLE IF EXISTS `auditoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditoria` (
  `id_auditoria` int NOT NULL AUTO_INCREMENT,
  `id_punto` int NOT NULL,
  `id_usuario` int NOT NULL,
  `fecha_anterior` datetime DEFAULT NULL,
  `nombre_anterior` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `descripcion_anterior` text COLLATE utf8mb4_general_ci,
  `fuente_resultado_anterior` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_actual` datetime DEFAULT NULL,
  `nombre_actual` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `descripcion_actual` text COLLATE utf8mb4_general_ci,
  `fuente_resultado_actual` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id_auditoria`),
  KEY `fk_auditoria_resolucion` (`id_punto`),
  KEY `fk_auditoria_usuario` (`id_usuario`),
  CONSTRAINT `fk_auditoria_resolucion` FOREIGN KEY (`id_punto`) REFERENCES `resolucion` (`id_punto`),
  CONSTRAINT `fk_auditoria_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=92 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditoria`
--

LOCK TABLES `auditoria` WRITE;
/*!40000 ALTER TABLE `auditoria` DISABLE KEYS */;
INSERT INTO `auditoria` VALUES (86,140,30,'2025-10-20 12:03:54','resolu 1','123','automatico','2025-10-20 12:03:54','resolu 1','123','hibrido'),(87,141,30,'2025-10-20 12:34:30','resolu 2','asd','automatico','2025-10-20 12:34:30','resolu 2','asd','hibrido'),(88,143,21,'2025-10-20 11:35:14','asd','asd','automatico','2025-10-20 11:35:14','asd','asd','hibrido'),(89,144,21,'2025-10-20 16:23:54','reso','reso','automatico','2025-10-20 16:23:54','reso','reso','hibrido'),(90,147,21,'2025-10-20 16:46:26','Borrador de resolucion','Resolucion en elaboracion',NULL,'2025-10-20 16:46:26','Borrador de resolucion','Resolucion en elaboracion','hibrido'),(91,149,21,'2025-10-20 17:04:06','Borrador de resolucion','Resolucion en elaboracion',NULL,'2025-10-20 17:04:06','Borrador de resolucion','Resolucion en elaboracion','hibrido');
/*!40000 ALTER TABLE `auditoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documento`
--

DROP TABLE IF EXISTS `documento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documento` (
  `id_documento` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `url` text COLLATE utf8mb4_general_ci,
  `fecha_subida` datetime DEFAULT NULL,
  `estado` tinyint DEFAULT '1',
  `status` tinyint DEFAULT '1',
  PRIMARY KEY (`id_documento`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documento`
--

LOCK TABLES `documento` WRITE;
/*!40000 ALTER TABLE `documento` DISABLE KEYS */;
/*!40000 ALTER TABLE `documento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facultad`
--

DROP TABLE IF EXISTS `facultad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `facultad` (
  `id_facultad` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `estado` tinyint DEFAULT '1',
  `status` tinyint DEFAULT '1',
  PRIMARY KEY (`id_facultad`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facultad`
--

LOCK TABLES `facultad` WRITE;
/*!40000 ALTER TABLE `facultad` DISABLE KEYS */;
/*!40000 ALTER TABLE `facultad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grupo`
--

DROP TABLE IF EXISTS `grupo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grupo` (
  `id_grupo` int NOT NULL AUTO_INCREMENT,
  `id_sesion` int NOT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `estado` tinyint DEFAULT '0',
  `status` tinyint DEFAULT '1',
  PRIMARY KEY (`id_grupo`),
  KEY `id_sesion` (`id_sesion`),
  CONSTRAINT `grupo_ibfk_1` FOREIGN KEY (`id_sesion`) REFERENCES `sesion` (`id_sesion`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grupo`
--

LOCK TABLES `grupo` WRITE;
/*!40000 ALTER TABLE `grupo` DISABLE KEYS */;
/*!40000 ALTER TABLE `grupo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grupo_usuario`
--

DROP TABLE IF EXISTS `grupo_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grupo_usuario` (
  `id_grupo_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `peso` float DEFAULT NULL,
  `estado` tinyint DEFAULT '1',
  `status` tinyint DEFAULT '1',
  PRIMARY KEY (`id_grupo_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grupo_usuario`
--

LOCK TABLES `grupo_usuario` WRITE;
/*!40000 ALTER TABLE `grupo_usuario` DISABLE KEYS */;
INSERT INTO `grupo_usuario` VALUES (1,'rector',1,1,1),(2,'vicerrector',1,1,1),(3,'decano',0.8,1,1),(4,'profesor',1,1,1),(5,'estudiante',0.93,1,1),(6,'trabajador',0.7,1,1);
/*!40000 ALTER TABLE `grupo_usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `miembro`
--

DROP TABLE IF EXISTS `miembro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `miembro` (
  `id_miembro` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `estado` tinyint DEFAULT '1',
  `status` tinyint DEFAULT '1',
  PRIMARY KEY (`id_miembro`),
  KEY `fk_miembro_usuario` (`id_usuario`),
  CONSTRAINT `fk_miembro_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=240 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `miembro`
--

LOCK TABLES `miembro` WRITE;
/*!40000 ALTER TABLE `miembro` DISABLE KEYS */;
INSERT INTO `miembro` VALUES (202,30,1,1),(203,31,1,1),(204,40,1,1),(205,71,1,1),(206,21,1,1),(207,22,1,1),(208,23,1,1),(209,47,1,1),(210,32,1,1),(211,38,1,1),(212,35,1,1),(213,49,1,1),(214,46,1,1),(215,45,1,1),(216,26,1,1),(217,24,1,1),(218,69,1,1),(219,43,1,1),(220,37,1,1),(221,39,1,1),(222,25,1,1),(223,33,1,1),(224,20,1,1),(225,44,1,1),(226,53,1,1),(227,52,1,1),(228,67,1,1),(229,66,1,1),(230,50,1,1),(231,48,1,1),(232,27,1,1),(233,28,1,1),(234,51,1,1),(235,68,1,1),(236,70,1,1),(237,34,1,1),(238,42,1,1),(239,36,1,1);
/*!40000 ALTER TABLE `miembro` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `punto`
--

DROP TABLE IF EXISTS `punto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `punto` (
  `id_punto` int NOT NULL AUTO_INCREMENT,
  `id_sesion` int NOT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `detalle` text COLLATE utf8mb4_general_ci,
  `orden` int DEFAULT NULL,
  `es_administrativa` tinyint DEFAULT '0',
  `n_afavor` int DEFAULT NULL,
  `n_encontra` int DEFAULT NULL,
  `n_abstencion` int DEFAULT NULL,
  `p_afavor` decimal(5,2) DEFAULT NULL,
  `p_encontra` decimal(5,2) DEFAULT NULL,
  `p_abstencion` decimal(5,2) DEFAULT NULL,
  `resultado` enum('aprobada','rechazada','pendiente','empate') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tipo` enum('normal','reconsideracion','repetido') COLLATE utf8mb4_general_ci DEFAULT 'normal',
  `calculo_resultado` enum('mayoria_simple','mayoria_especial') COLLATE utf8mb4_general_ci DEFAULT 'mayoria_simple',
  `id_punto_reconsiderado` int DEFAULT NULL,
  `requiere_voto_dirimente` tinyint DEFAULT '0',
  `estado` tinyint DEFAULT '0',
  `status` tinyint DEFAULT '1',
  PRIMARY KEY (`id_punto`),
  UNIQUE KEY `id_sesion` (`id_sesion`,`orden`),
  KEY `fk_punto_reconsiderado` (`id_punto_reconsiderado`),
  CONSTRAINT `fk_punto_reconsiderado` FOREIGN KEY (`id_punto_reconsiderado`) REFERENCES `punto` (`id_punto`) ON DELETE SET NULL,
  CONSTRAINT `fk_punto_sesion` FOREIGN KEY (`id_sesion`) REFERENCES `sesion` (`id_sesion`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=150 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `punto`
--

LOCK TABLES `punto` WRITE;
/*!40000 ALTER TABLE `punto` DISABLE KEYS */;
INSERT INTO `punto` VALUES (140,16,'punto 1','p 1',1,0,37,0,0,33.94,0.00,0.00,'aprobada','normal','mayoria_simple',NULL,0,0,1),(141,16,'punto 2','p 2',2,0,37,0,0,33.94,0.00,0.00,'aprobada','normal','mayoria_simple',NULL,0,0,1),(142,16,'punto 3','p 3',3,1,25,8,3,22.92,7.66,2.66,'aprobada','normal','mayoria_especial',NULL,0,0,1),(143,17,'punto 1','punto 1',1,0,37,0,0,33.94,0.00,0.00,'aprobada','normal','mayoria_simple',NULL,0,0,1),(144,17,'punto 2?','punto 2',2,1,22,8,6,20.39,7.32,5.53,'pendiente','normal','mayoria_especial',NULL,0,0,1),(145,17,'punto 3','asd',3,0,37,0,0,33.94,0.00,0.00,'aprobada','normal','mayoria_simple',NULL,0,0,1),(146,17,'punto 4','asd',4,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'normal','mayoria_especial',NULL,0,0,1),(147,17,'punto 5','p 5',5,1,22,8,6,20.39,7.32,5.53,'aprobada','normal','mayoria_simple',NULL,0,0,1),(148,17,'punto 6','asd',6,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'normal','mayoria_especial',NULL,0,1,1),(149,17,'punto 7?','asd',7,1,22,8,6,20.39,7.32,5.53,'aprobada','normal','mayoria_simple',NULL,0,0,1);
/*!40000 ALTER TABLE `punto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `punto_documento`
--

DROP TABLE IF EXISTS `punto_documento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `punto_documento` (
  `id_punto_documento` int NOT NULL AUTO_INCREMENT,
  `id_punto` int NOT NULL,
  `id_documento` int NOT NULL,
  `estado` tinyint DEFAULT '1',
  `status` tinyint DEFAULT '1',
  PRIMARY KEY (`id_punto_documento`),
  KEY `fk_punto_documento_punto` (`id_punto`),
  KEY `fk_punto_documento_documento` (`id_documento`),
  CONSTRAINT `fk_punto_documento_documento` FOREIGN KEY (`id_documento`) REFERENCES `documento` (`id_documento`) ON DELETE CASCADE,
  CONSTRAINT `fk_punto_documento_punto` FOREIGN KEY (`id_punto`) REFERENCES `punto` (`id_punto`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `punto_documento`
--

LOCK TABLES `punto_documento` WRITE;
/*!40000 ALTER TABLE `punto_documento` DISABLE KEYS */;
/*!40000 ALTER TABLE `punto_documento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `punto_grupo`
--

DROP TABLE IF EXISTS `punto_grupo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `punto_grupo` (
  `id_punto_grupo` int NOT NULL AUTO_INCREMENT,
  `id_grupo` int NOT NULL,
  `id_punto` int NOT NULL,
  `estado` tinyint DEFAULT '1',
  `status` tinyint DEFAULT '1',
  PRIMARY KEY (`id_punto_grupo`),
  UNIQUE KEY `uk_grupo_punto` (`id_grupo`,`id_punto`),
  KEY `id_punto` (`id_punto`),
  CONSTRAINT `punto_grupo_ibfk_1` FOREIGN KEY (`id_grupo`) REFERENCES `grupo` (`id_grupo`) ON DELETE CASCADE,
  CONSTRAINT `punto_grupo_ibfk_2` FOREIGN KEY (`id_punto`) REFERENCES `punto` (`id_punto`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `punto_grupo`
--

LOCK TABLES `punto_grupo` WRITE;
/*!40000 ALTER TABLE `punto_grupo` DISABLE KEYS */;
/*!40000 ALTER TABLE `punto_grupo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `punto_usuario`
--

DROP TABLE IF EXISTS `punto_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `punto_usuario` (
  `id_punto_usuario` int NOT NULL AUTO_INCREMENT,
  `id_punto` int NOT NULL,
  `id_usuario` int NOT NULL,
  `opcion` enum('afavor','encontra','abstencion') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `es_razonado` tinyint DEFAULT '0',
  `votante` int DEFAULT NULL,
  `es_principal` tinyint DEFAULT '1',
  `fecha` datetime DEFAULT NULL,
  `estado` tinyint DEFAULT '0',
  `status` tinyint DEFAULT '1',
  PRIMARY KEY (`id_punto_usuario`),
  UNIQUE KEY `uq_punto_usuario` (`id_punto`,`id_usuario`),
  KEY `fk_punto_usuario_punto` (`id_punto`),
  KEY `fk_punto_usuario_usuario` (`id_usuario`),
  KEY `fk_punto_usuario_votante` (`votante`),
  CONSTRAINT `fk_punto_usuario_punto` FOREIGN KEY (`id_punto`) REFERENCES `punto` (`id_punto`) ON DELETE CASCADE,
  CONSTRAINT `fk_punto_usuario_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `fk_punto_usuario_votante` FOREIGN KEY (`votante`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6302 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `punto_usuario`
--

LOCK TABLES `punto_usuario` WRITE;
/*!40000 ALTER TABLE `punto_usuario` DISABLE KEYS */;
INSERT INTO `punto_usuario` VALUES (5922,140,30,'afavor',0,1,1,'2025-10-20 12:04:12',1,1),(5923,140,31,'afavor',0,1,1,'2025-10-20 12:04:12',1,1),(5924,140,40,'afavor',0,1,1,'2025-10-20 12:04:13',1,1),(5925,140,71,'afavor',0,1,1,'2025-10-20 12:04:13',1,1),(5926,140,21,'afavor',0,1,1,'2025-10-20 12:04:14',1,1),(5927,140,22,'afavor',0,1,1,'2025-10-20 12:04:14',1,1),(5928,140,23,'afavor',0,1,1,'2025-10-20 12:04:14',1,1),(5929,140,47,'afavor',0,1,1,'2025-10-20 12:04:15',1,1),(5930,140,32,'afavor',0,1,1,'2025-10-20 12:04:15',1,1),(5931,140,38,'afavor',0,1,1,'2025-10-20 12:04:15',1,1),(5932,140,35,'afavor',0,1,1,'2025-10-20 12:04:16',1,1),(5933,140,49,'afavor',0,1,1,'2025-10-20 12:04:16',1,1),(5934,140,46,'afavor',0,1,1,'2025-10-20 12:04:16',1,1),(5935,140,45,'afavor',0,1,1,'2025-10-20 12:04:17',1,1),(5936,140,26,'afavor',0,1,1,'2025-10-20 12:04:17',1,1),(5937,140,24,'afavor',0,1,1,'2025-10-20 12:04:18',1,1),(5938,140,69,'afavor',0,1,1,'2025-10-20 12:04:18',1,1),(5939,140,43,'afavor',0,1,1,'2025-10-20 12:04:18',1,1),(5940,140,37,'afavor',0,1,1,'2025-10-20 12:04:19',1,1),(5941,140,39,'afavor',0,1,1,'2025-10-20 12:04:19',1,1),(5942,140,25,'afavor',0,1,1,'2025-10-20 12:04:19',1,1),(5943,140,33,'afavor',0,1,1,'2025-10-20 12:04:20',1,1),(5944,140,20,NULL,0,1,1,'2025-10-20 12:04:26',0,1),(5945,140,44,'afavor',0,1,1,'2025-10-20 12:04:20',1,1),(5946,140,53,'afavor',0,1,1,'2025-10-20 12:04:21',1,1),(5947,140,52,'afavor',0,1,1,'2025-10-20 12:04:21',1,1),(5948,140,67,'afavor',0,1,1,'2025-10-20 12:04:21',1,1),(5949,140,66,'afavor',0,1,1,'2025-10-20 12:04:22',1,1),(5950,140,50,'afavor',0,1,1,'2025-10-20 12:04:22',1,1),(5951,140,48,'afavor',0,1,1,'2025-10-20 12:04:22',1,1),(5952,140,27,'afavor',0,1,1,'2025-10-20 12:04:23',1,1),(5953,140,28,'afavor',0,1,1,'2025-10-20 12:04:23',1,1),(5954,140,51,'afavor',0,1,1,'2025-10-20 12:04:23',1,1),(5955,140,68,'afavor',0,1,1,'2025-10-20 12:04:24',1,1),(5956,140,70,'afavor',0,1,1,'2025-10-20 12:04:24',1,1),(5957,140,34,'afavor',0,1,1,'2025-10-20 12:04:25',1,1),(5958,140,42,'afavor',0,1,1,'2025-10-20 12:04:25',1,1),(5959,140,36,'afavor',0,1,1,'2025-10-20 12:04:25',1,1),(5960,141,30,'afavor',0,1,1,'2025-10-20 12:38:08',1,1),(5961,141,31,'afavor',0,1,1,'2025-10-20 12:38:08',1,1),(5962,141,40,'afavor',0,1,1,'2025-10-20 12:38:09',1,1),(5963,141,71,'afavor',0,1,1,'2025-10-20 12:38:09',1,1),(5964,141,21,'afavor',0,1,1,'2025-10-20 12:38:09',1,1),(5965,141,22,'afavor',0,1,1,'2025-10-20 12:38:10',1,1),(5966,141,23,'afavor',0,1,1,'2025-10-20 12:38:10',1,1),(5967,141,47,'afavor',0,1,1,'2025-10-20 12:38:10',1,1),(5968,141,32,'afavor',0,1,1,'2025-10-20 12:38:11',1,1),(5969,141,38,'afavor',0,1,1,'2025-10-20 12:38:11',1,1),(5970,141,35,'afavor',0,1,1,'2025-10-20 12:38:12',1,1),(5971,141,49,'afavor',0,1,1,'2025-10-20 12:38:12',1,1),(5972,141,46,'afavor',0,1,1,'2025-10-20 12:38:12',1,1),(5973,141,45,'afavor',0,1,1,'2025-10-20 12:38:13',1,1),(5974,141,26,'afavor',0,1,1,'2025-10-20 12:38:13',1,1),(5975,141,24,'afavor',0,1,1,'2025-10-20 12:38:13',1,1),(5976,141,69,'afavor',0,1,1,'2025-10-20 12:38:14',1,1),(5977,141,43,'afavor',0,1,1,'2025-10-20 12:38:14',1,1),(5978,141,37,'afavor',0,1,1,'2025-10-20 12:38:15',1,1),(5979,141,39,'afavor',0,1,1,'2025-10-20 12:38:15',1,1),(5980,141,25,'afavor',0,1,1,'2025-10-20 12:38:15',1,1),(5981,141,33,'afavor',0,1,1,'2025-10-20 12:38:16',1,1),(5982,141,20,NULL,0,1,1,'2025-10-20 12:38:22',0,1),(5983,141,44,'afavor',0,1,1,'2025-10-20 12:38:16',1,1),(5984,141,53,'afavor',0,1,1,'2025-10-20 12:38:16',1,1),(5985,141,52,'afavor',0,1,1,'2025-10-20 12:38:17',1,1),(5986,141,67,'afavor',0,1,1,'2025-10-20 12:38:17',1,1),(5987,141,66,'afavor',0,1,1,'2025-10-20 12:38:17',1,1),(5988,141,50,'afavor',0,1,1,'2025-10-20 12:38:18',1,1),(5989,141,48,'afavor',0,1,1,'2025-10-20 12:38:18',1,1),(5990,141,27,'afavor',0,1,1,'2025-10-20 12:38:19',1,1),(5991,141,28,'afavor',0,1,1,'2025-10-20 12:38:19',1,1),(5992,141,51,'afavor',0,1,1,'2025-10-20 12:38:19',1,1),(5993,141,68,'afavor',0,1,1,'2025-10-20 12:38:20',1,1),(5994,141,70,'afavor',0,1,1,'2025-10-20 12:38:21',1,1),(5995,141,34,'afavor',0,1,1,'2025-10-20 12:38:21',1,1),(5996,141,42,'afavor',0,1,1,'2025-10-20 12:38:21',1,1),(5997,141,36,'afavor',0,1,1,'2025-10-20 12:38:22',1,1),(5998,142,30,'afavor',0,1,1,'2025-10-20 11:32:35',1,1),(5999,142,31,'afavor',0,1,1,'2025-10-20 11:32:35',1,1),(6000,142,40,'afavor',0,1,1,'2025-10-20 11:32:35',1,1),(6001,142,71,'afavor',0,1,1,'2025-10-20 11:32:35',1,1),(6002,142,21,'afavor',0,1,1,'2025-10-20 11:32:35',1,1),(6003,142,22,'afavor',0,1,1,'2025-10-20 11:32:35',1,1),(6004,142,23,'afavor',0,1,1,'2025-10-20 11:32:35',1,1),(6005,142,47,'afavor',0,1,1,'2025-10-20 11:32:35',1,1),(6006,142,32,'encontra',0,1,1,'2025-10-20 11:32:35',1,1),(6007,142,38,'encontra',0,1,1,'2025-10-20 11:32:35',1,1),(6008,142,35,'afavor',0,1,1,'2025-10-20 11:32:35',1,1),(6009,142,49,'afavor',0,1,1,'2025-10-20 11:32:35',1,1),(6010,142,46,'afavor',0,1,1,'2025-10-20 11:32:35',1,1),(6011,142,45,'abstencion',0,1,1,'2025-10-20 11:32:35',1,1),(6012,142,26,'afavor',0,1,1,'2025-10-20 11:32:35',1,1),(6013,142,24,'afavor',0,1,1,'2025-10-20 11:32:35',1,1),(6014,142,69,'afavor',0,1,1,'2025-10-20 11:32:35',1,1),(6015,142,43,'afavor',0,1,1,'2025-10-20 11:32:35',1,1),(6016,142,37,'encontra',0,1,1,'2025-10-20 11:32:35',1,1),(6017,142,39,'encontra',0,1,1,'2025-10-20 11:32:35',1,1),(6018,142,25,'afavor',0,1,1,'2025-10-20 11:32:35',1,1),(6019,142,33,'afavor',0,1,1,'2025-10-20 11:32:35',1,1),(6020,142,20,NULL,0,1,1,'2025-10-20 11:32:35',0,1),(6021,142,44,'encontra',0,1,1,'2025-10-20 11:32:35',1,1),(6022,142,53,NULL,0,1,1,'2025-10-20 11:32:35',0,1),(6023,142,52,'encontra',0,1,1,'2025-10-20 11:32:35',1,1),(6024,142,67,'encontra',0,1,1,'2025-10-20 11:32:35',1,1),(6025,142,66,'afavor',0,1,1,'2025-10-20 11:32:35',1,1),(6026,142,50,'encontra',0,1,1,'2025-10-20 11:32:35',1,1),(6027,142,48,'afavor',0,1,1,'2025-10-20 11:32:35',1,1),(6028,142,27,'abstencion',0,1,1,'2025-10-20 11:32:35',1,1),(6029,142,28,'afavor',0,1,1,'2025-10-20 11:32:35',1,1),(6030,142,51,'abstencion',0,1,1,'2025-10-20 11:32:35',1,1),(6031,142,68,'afavor',0,1,1,'2025-10-20 11:32:35',1,1),(6032,142,70,'afavor',0,1,1,'2025-10-20 11:32:35',1,1),(6033,142,34,'afavor',0,1,1,'2025-10-20 11:32:35',1,1),(6034,142,42,'afavor',0,1,1,'2025-10-20 11:32:35',1,1),(6035,142,36,'afavor',0,1,1,'2025-10-20 11:32:35',1,1),(6036,143,30,'afavor',0,1,1,'2025-10-20 12:40:49',1,1),(6037,143,31,'afavor',0,1,1,'2025-10-20 12:40:50',1,1),(6038,143,40,'afavor',0,1,1,'2025-10-20 12:40:50',1,1),(6039,143,71,'afavor',0,1,1,'2025-10-20 12:40:50',1,1),(6040,143,21,'afavor',0,1,1,'2025-10-20 12:40:49',1,1),(6041,143,22,'afavor',0,1,1,'2025-10-20 12:40:49',1,1),(6042,143,23,'afavor',0,1,1,'2025-10-20 12:40:49',1,1),(6043,143,47,'afavor',0,1,1,'2025-10-20 12:40:50',1,1),(6044,143,32,'afavor',0,1,1,'2025-10-20 12:40:50',1,1),(6045,143,38,'afavor',0,1,1,'2025-10-20 12:40:50',1,1),(6046,143,35,'afavor',0,1,1,'2025-10-20 12:40:50',1,1),(6047,143,49,'afavor',0,1,1,'2025-10-20 12:40:50',1,1),(6048,143,46,'afavor',0,1,1,'2025-10-20 12:40:50',1,1),(6049,143,45,'afavor',0,1,1,'2025-10-20 12:40:50',1,1),(6050,143,26,'afavor',0,1,1,'2025-10-20 12:40:49',1,1),(6051,143,24,'afavor',0,1,1,'2025-10-20 12:40:49',1,1),(6052,143,69,'afavor',0,1,1,'2025-10-20 12:40:50',1,1),(6053,143,43,'afavor',0,1,1,'2025-10-20 12:40:50',1,1),(6054,143,37,'afavor',0,1,1,'2025-10-20 12:40:50',1,1),(6055,143,39,'afavor',0,1,1,'2025-10-20 12:40:50',1,1),(6056,143,25,'afavor',0,1,1,'2025-10-20 12:40:49',1,1),(6057,143,33,'afavor',0,1,1,'2025-10-20 12:40:50',1,1),(6058,143,20,NULL,0,1,1,'2025-10-20 12:40:50',0,1),(6059,143,44,'afavor',0,1,1,'2025-10-20 12:40:50',1,1),(6060,143,53,'afavor',0,1,1,'2025-10-20 12:40:50',1,1),(6061,143,52,'afavor',0,1,1,'2025-10-20 12:40:50',1,1),(6062,143,67,'afavor',0,1,1,'2025-10-20 12:40:50',1,1),(6063,143,66,'afavor',0,1,1,'2025-10-20 12:40:50',1,1),(6064,143,50,'afavor',0,1,1,'2025-10-20 12:40:50',1,1),(6065,143,48,'afavor',0,1,1,'2025-10-20 12:40:50',1,1),(6066,143,27,'afavor',0,1,1,'2025-10-20 12:40:49',1,1),(6067,143,28,'afavor',0,1,1,'2025-10-20 12:40:49',1,1),(6068,143,51,'afavor',0,1,1,'2025-10-20 12:40:50',1,1),(6069,143,68,'afavor',0,1,1,'2025-10-20 12:40:50',1,1),(6070,143,70,'afavor',0,1,1,'2025-10-20 12:40:50',1,1),(6071,143,34,'afavor',0,1,1,'2025-10-20 12:40:50',1,1),(6072,143,42,'afavor',0,1,1,'2025-10-20 12:40:50',1,1),(6073,143,36,'afavor',0,1,1,'2025-10-20 12:40:50',1,1),(6074,144,30,'abstencion',0,1,1,'2025-10-20 16:33:14',1,1),(6075,144,31,'afavor',0,1,1,'2025-10-20 16:33:14',1,1),(6076,144,40,'afavor',0,1,1,'2025-10-20 16:33:14',1,1),(6077,144,71,'afavor',0,1,1,'2025-10-20 16:33:14',1,1),(6078,144,21,'encontra',0,1,1,'2025-10-20 16:33:14',1,1),(6079,144,22,'afavor',0,1,1,'2025-10-20 16:33:14',1,1),(6080,144,23,'afavor',0,1,1,'2025-10-20 16:33:14',1,1),(6081,144,47,'afavor',0,1,1,'2025-10-20 16:33:14',1,1),(6082,144,32,'abstencion',0,1,1,'2025-10-20 16:33:14',1,1),(6083,144,38,'afavor',0,1,1,'2025-10-20 16:33:14',1,1),(6084,144,35,'afavor',0,1,1,'2025-10-20 16:33:14',1,1),(6085,144,49,'encontra',0,1,1,'2025-10-20 16:33:14',1,1),(6086,144,46,'afavor',0,1,1,'2025-10-20 16:33:14',1,1),(6087,144,45,'afavor',0,1,1,'2025-10-20 16:33:14',1,1),(6088,144,26,'afavor',0,1,1,'2025-10-20 16:33:14',1,1),(6089,144,24,'afavor',0,1,1,'2025-10-20 16:33:14',1,1),(6090,144,69,'encontra',0,1,1,'2025-10-20 16:33:14',1,1),(6091,144,43,'afavor',0,1,1,'2025-10-20 16:33:14',1,1),(6092,144,37,'encontra',0,1,1,'2025-10-20 16:33:14',1,1),(6093,144,39,'abstencion',0,1,1,'2025-10-20 16:33:14',1,1),(6094,144,25,'abstencion',0,1,1,'2025-10-20 16:33:14',1,1),(6095,144,33,'afavor',0,1,1,'2025-10-20 16:33:14',1,1),(6096,144,20,NULL,0,1,1,'2025-10-20 16:33:14',0,1),(6097,144,44,'abstencion',0,1,1,'2025-10-20 16:33:14',1,1),(6098,144,53,NULL,0,1,1,'2025-10-20 16:33:14',0,1),(6099,144,52,'encontra',0,1,1,'2025-10-20 16:33:14',1,1),(6100,144,67,'encontra',0,1,1,'2025-10-20 16:33:14',1,1),(6101,144,66,'afavor',0,1,1,'2025-10-20 16:33:14',1,1),(6102,144,50,'encontra',0,1,1,'2025-10-20 16:33:14',1,1),(6103,144,48,'abstencion',0,1,1,'2025-10-20 16:33:14',1,1),(6104,144,27,'afavor',0,1,1,'2025-10-20 16:33:14',1,1),(6105,144,28,'afavor',0,1,1,'2025-10-20 16:33:14',1,1),(6106,144,51,'encontra',0,1,1,'2025-10-20 16:33:14',1,1),(6107,144,68,'afavor',0,1,1,'2025-10-20 16:33:14',1,1),(6108,144,70,'afavor',0,1,1,'2025-10-20 16:33:14',1,1),(6109,144,34,'afavor',0,1,1,'2025-10-20 16:33:14',1,1),(6110,144,42,'afavor',0,1,1,'2025-10-20 16:33:14',1,1),(6111,144,36,'afavor',0,1,1,'2025-10-20 16:33:14',1,1),(6112,145,30,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6113,145,31,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6114,145,40,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6115,145,71,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6116,145,21,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6117,145,22,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6118,145,23,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6119,145,47,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6120,145,32,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6121,145,38,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6122,145,35,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6123,145,49,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6124,145,46,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6125,145,45,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6126,145,26,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6127,145,24,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6128,145,69,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6129,145,43,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6130,145,37,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6131,145,39,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6132,145,25,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6133,145,33,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6134,145,20,NULL,0,1,1,'2025-10-20 12:49:19',0,1),(6135,145,44,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6136,145,53,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6137,145,52,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6138,145,67,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6139,145,66,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6140,145,50,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6141,145,48,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6142,145,27,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6143,145,28,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6144,145,51,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6145,145,68,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6146,145,70,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6147,145,34,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6148,145,42,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6149,145,36,'afavor',0,1,1,'2025-10-20 12:49:19',1,1),(6150,146,30,NULL,0,NULL,1,NULL,1,1),(6151,146,31,NULL,0,NULL,1,NULL,1,1),(6152,146,40,NULL,0,NULL,1,NULL,1,1),(6153,146,71,NULL,0,NULL,1,NULL,1,1),(6154,146,21,NULL,0,NULL,1,NULL,1,1),(6155,146,22,NULL,0,NULL,1,NULL,1,1),(6156,146,23,NULL,0,NULL,1,NULL,1,1),(6157,146,47,NULL,0,NULL,1,NULL,1,1),(6158,146,32,NULL,0,NULL,1,NULL,1,1),(6159,146,38,NULL,0,NULL,1,NULL,1,1),(6160,146,35,NULL,0,NULL,1,NULL,1,1),(6161,146,49,NULL,0,NULL,1,NULL,1,1),(6162,146,46,NULL,0,NULL,1,NULL,1,1),(6163,146,45,NULL,0,NULL,1,NULL,1,1),(6164,146,26,NULL,0,NULL,1,NULL,1,1),(6165,146,24,NULL,0,NULL,1,NULL,1,1),(6166,146,69,NULL,0,NULL,1,NULL,1,1),(6167,146,43,NULL,0,NULL,1,NULL,1,1),(6168,146,37,NULL,0,NULL,1,NULL,1,1),(6169,146,39,NULL,0,NULL,1,NULL,1,1),(6170,146,25,NULL,0,NULL,1,NULL,1,1),(6171,146,33,NULL,0,NULL,1,NULL,1,1),(6172,146,20,NULL,0,NULL,1,NULL,0,1),(6173,146,44,NULL,0,NULL,1,NULL,1,1),(6174,146,53,NULL,0,NULL,1,NULL,0,1),(6175,146,52,NULL,0,NULL,1,NULL,1,1),(6176,146,67,NULL,0,NULL,1,NULL,1,1),(6177,146,66,NULL,0,NULL,1,NULL,1,1),(6178,146,50,NULL,0,NULL,1,NULL,1,1),(6179,146,48,NULL,0,NULL,1,NULL,1,1),(6180,146,27,NULL,0,NULL,1,NULL,1,1),(6181,146,28,NULL,0,NULL,1,NULL,1,1),(6182,146,51,NULL,0,NULL,1,NULL,1,1),(6183,146,68,NULL,0,NULL,1,NULL,1,1),(6184,146,70,NULL,0,NULL,1,NULL,1,1),(6185,146,34,NULL,0,NULL,1,NULL,1,1),(6186,146,42,NULL,0,NULL,1,NULL,1,1),(6187,146,36,NULL,0,NULL,1,NULL,1,1),(6188,147,30,'abstencion',0,1,1,'2025-10-20 17:00:49',1,1),(6189,147,31,'afavor',0,1,1,'2025-10-20 17:00:49',1,1),(6190,147,40,'afavor',0,1,1,'2025-10-20 17:00:49',1,1),(6191,147,71,'afavor',0,1,1,'2025-10-20 17:00:49',1,1),(6192,147,21,'afavor',0,1,1,'2025-10-20 17:00:49',1,1),(6193,147,22,'encontra',0,1,1,'2025-10-20 17:00:49',1,1),(6194,147,23,'afavor',0,1,1,'2025-10-20 17:00:49',1,1),(6195,147,47,'afavor',0,1,1,'2025-10-20 17:00:49',1,1),(6196,147,32,'afavor',0,1,1,'2025-10-20 17:00:49',1,1),(6197,147,38,'abstencion',0,1,1,'2025-10-20 17:00:49',1,1),(6198,147,35,'afavor',0,1,1,'2025-10-20 17:00:49',1,1),(6199,147,49,'abstencion',0,1,1,'2025-10-20 17:00:49',1,1),(6200,147,46,'afavor',0,1,1,'2025-10-20 17:00:49',1,1),(6201,147,45,'encontra',0,1,1,'2025-10-20 17:00:49',1,1),(6202,147,26,'afavor',0,1,1,'2025-10-20 17:00:49',1,1),(6203,147,24,'afavor',0,1,1,'2025-10-20 17:00:49',1,1),(6204,147,69,'encontra',0,1,1,'2025-10-20 17:00:49',1,1),(6205,147,43,'afavor',0,1,1,'2025-10-20 17:00:49',1,1),(6206,147,37,'encontra',0,1,1,'2025-10-20 17:00:49',1,1),(6207,147,39,'abstencion',0,1,1,'2025-10-20 17:00:49',1,1),(6208,147,25,'abstencion',0,1,1,'2025-10-20 17:00:49',1,1),(6209,147,33,'afavor',0,1,1,'2025-10-20 17:00:49',1,1),(6210,147,20,NULL,0,1,1,'2025-10-20 17:00:49',0,1),(6211,147,44,'abstencion',0,1,1,'2025-10-20 17:00:49',1,1),(6212,147,53,NULL,0,1,1,'2025-10-20 17:00:49',0,1),(6213,147,52,'encontra',0,1,1,'2025-10-20 17:00:49',1,1),(6214,147,67,'encontra',0,1,1,'2025-10-20 17:00:49',1,1),(6215,147,66,'afavor',0,1,1,'2025-10-20 17:00:49',1,1),(6216,147,50,'encontra',0,1,1,'2025-10-20 17:00:49',1,1),(6217,147,48,'encontra',0,1,1,'2025-10-20 17:00:49',1,1),(6218,147,27,'afavor',0,1,1,'2025-10-20 17:00:49',1,1),(6219,147,28,'afavor',0,1,1,'2025-10-20 17:00:49',1,1),(6220,147,51,'afavor',0,1,1,'2025-10-20 17:00:49',1,1),(6221,147,68,'afavor',0,1,1,'2025-10-20 17:00:49',1,1),(6222,147,70,'afavor',0,1,1,'2025-10-20 17:00:49',1,1),(6223,147,34,'afavor',0,1,1,'2025-10-20 17:00:49',1,1),(6224,147,42,'afavor',0,1,1,'2025-10-20 17:00:49',1,1),(6225,147,36,'afavor',0,1,1,'2025-10-20 17:00:49',1,1),(6226,148,30,'encontra',0,1,1,'2025-10-21 16:13:17',1,1),(6227,148,31,NULL,0,NULL,1,NULL,1,1),(6228,148,40,NULL,0,NULL,1,NULL,1,1),(6229,148,71,NULL,0,NULL,1,NULL,1,1),(6230,148,21,NULL,0,NULL,1,NULL,1,1),(6231,148,22,NULL,0,NULL,1,NULL,1,1),(6232,148,23,'afavor',0,1,1,'2025-10-21 15:38:37',1,1),(6233,148,47,NULL,0,NULL,1,NULL,1,1),(6234,148,32,'abstencion',1,1,1,'2025-10-21 16:11:35',1,1),(6235,148,38,'encontra',NULL,1,1,'2025-10-21 16:11:15',1,1),(6236,148,35,NULL,0,NULL,1,NULL,1,1),(6237,148,49,'encontra',0,1,1,'2025-10-21 15:37:38',1,1),(6238,148,46,NULL,0,NULL,1,NULL,1,1),(6239,148,45,'abstencion',0,1,1,'2025-10-20 21:56:59',1,1),(6240,148,26,'encontra',0,1,1,'2025-10-21 15:38:10',1,1),(6241,148,24,NULL,0,NULL,1,NULL,1,1),(6242,148,69,'afavor',0,1,1,'2025-10-20 21:59:24',1,1),(6243,148,43,NULL,0,NULL,1,NULL,1,1),(6244,148,37,'abstencion',0,37,1,'2025-10-21 15:15:28',1,1),(6245,148,39,'encontra',0,39,1,'2025-10-21 15:37:02',1,1),(6246,148,25,'encontra',0,1,1,'2025-10-20 21:59:30',1,1),(6247,148,33,NULL,0,NULL,1,NULL,1,1),(6248,148,20,NULL,0,NULL,1,NULL,0,1),(6249,148,44,'afavor',NULL,1,1,'2025-10-21 16:11:20',1,1),(6250,148,53,NULL,0,NULL,1,NULL,1,1),(6251,148,52,'afavor',0,52,1,'2025-10-21 09:13:38',1,1),(6252,148,67,'afavor',0,1,1,'2025-10-20 21:56:55',1,1),(6253,148,66,'encontra',0,1,1,'2025-10-21 15:39:50',1,1),(6254,148,50,'encontra',0,50,1,'2025-10-21 09:45:07',1,1),(6255,148,48,'encontra',0,1,1,'2025-10-21 15:02:36',1,1),(6256,148,27,NULL,0,NULL,1,NULL,1,1),(6257,148,28,NULL,0,NULL,1,NULL,1,1),(6258,148,51,'abstencion',0,1,1,'2025-10-21 16:08:18',1,1),(6259,148,68,NULL,0,NULL,1,NULL,1,1),(6260,148,70,NULL,0,NULL,1,NULL,1,1),(6261,148,34,NULL,0,NULL,1,NULL,1,1),(6262,148,42,NULL,0,NULL,1,NULL,1,1),(6263,148,36,NULL,0,NULL,1,NULL,1,1),(6264,149,30,'abstencion',0,1,1,'2025-10-20 17:08:18',1,1),(6265,149,31,'afavor',0,1,1,'2025-10-20 17:08:18',1,1),(6266,149,40,'afavor',0,1,1,'2025-10-20 17:08:18',1,1),(6267,149,71,'afavor',0,1,1,'2025-10-20 17:08:18',1,1),(6268,149,21,'afavor',0,1,1,'2025-10-20 17:08:18',1,1),(6269,149,22,'encontra',0,1,1,'2025-10-20 17:08:18',1,1),(6270,149,23,'afavor',0,1,1,'2025-10-20 17:08:18',1,1),(6271,149,47,'afavor',0,1,1,'2025-10-20 17:08:18',1,1),(6272,149,32,'afavor',0,1,1,'2025-10-20 17:08:18',1,1),(6273,149,38,'abstencion',0,1,1,'2025-10-20 17:08:18',1,1),(6274,149,35,'afavor',0,1,1,'2025-10-20 17:08:18',1,1),(6275,149,49,'abstencion',0,1,1,'2025-10-20 17:08:18',1,1),(6276,149,46,'afavor',0,1,1,'2025-10-20 17:08:18',1,1),(6277,149,45,'encontra',0,1,1,'2025-10-20 17:08:18',1,1),(6278,149,26,'afavor',0,1,1,'2025-10-20 17:08:18',1,1),(6279,149,24,'afavor',0,1,1,'2025-10-20 17:08:18',1,1),(6280,149,69,'encontra',0,1,1,'2025-10-20 17:08:18',1,1),(6281,149,43,'afavor',0,1,1,'2025-10-20 17:08:18',1,1),(6282,149,37,'encontra',0,1,1,'2025-10-20 17:08:18',1,1),(6283,149,39,'abstencion',0,1,1,'2025-10-20 17:08:18',1,1),(6284,149,25,'abstencion',0,1,1,'2025-10-20 17:08:18',1,1),(6285,149,33,'afavor',0,1,1,'2025-10-20 17:08:18',1,1),(6286,149,20,NULL,0,1,1,'2025-10-20 17:08:18',0,1),(6287,149,44,'abstencion',0,1,1,'2025-10-20 17:08:18',1,1),(6288,149,53,NULL,0,1,1,'2025-10-20 17:08:18',0,1),(6289,149,52,'encontra',0,1,1,'2025-10-20 17:08:18',1,1),(6290,149,67,'encontra',0,1,1,'2025-10-20 17:08:18',1,1),(6291,149,66,'afavor',0,1,1,'2025-10-20 17:08:18',1,1),(6292,149,50,'encontra',0,1,1,'2025-10-20 17:08:18',1,1),(6293,149,48,'encontra',0,1,1,'2025-10-20 17:08:18',1,1),(6294,149,27,'afavor',0,1,1,'2025-10-20 17:08:18',1,1),(6295,149,28,'afavor',0,1,1,'2025-10-20 17:08:18',1,1),(6296,149,51,'afavor',0,1,1,'2025-10-20 17:08:18',1,1),(6297,149,68,'afavor',0,1,1,'2025-10-20 17:08:18',1,1),(6298,149,70,'afavor',0,1,1,'2025-10-20 17:08:18',1,1),(6299,149,34,'afavor',0,1,1,'2025-10-20 17:08:18',1,1),(6300,149,42,'afavor',0,1,1,'2025-10-20 17:08:18',1,1),(6301,149,36,'afavor',0,1,1,'2025-10-20 17:08:18',1,1);
/*!40000 ALTER TABLE `punto_usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resolucion`
--

DROP TABLE IF EXISTS `resolucion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resolucion` (
  `id_punto` int NOT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci,
  `fecha` datetime DEFAULT NULL,
  `fuente_resultado` enum('automatico','manual','hibrido') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `estado` tinyint DEFAULT '1',
  `status` tinyint DEFAULT '1',
  PRIMARY KEY (`id_punto`),
  CONSTRAINT `fk_resolucion_punto` FOREIGN KEY (`id_punto`) REFERENCES `punto` (`id_punto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resolucion`
--

LOCK TABLES `resolucion` WRITE;
/*!40000 ALTER TABLE `resolucion` DISABLE KEYS */;
INSERT INTO `resolucion` VALUES (140,'resolu 1','123','2025-10-20 12:03:54','hibrido',1,1),(141,'resolu 2','asd','2025-10-20 12:34:30','hibrido',1,1),(143,'asd','asd','2025-10-20 11:35:14','hibrido',1,1),(144,'reso','reso','2025-10-20 16:23:54','hibrido',1,1),(146,'fsd','sfd','2025-10-20 16:38:27','automatico',1,1),(147,'Borrador de resolucion','Resolucion en elaboracion','2025-10-20 16:46:26','hibrido',1,1),(148,'Borrador de resolucion','Resolucion en elaboracion','2025-10-20 16:47:16',NULL,1,1),(149,'Borrador de resolucion','Resolucion en elaboracion','2025-10-20 17:04:06','hibrido',1,1);
/*!40000 ALTER TABLE `resolucion` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_auditoria_resolucion` AFTER UPDATE ON `resolucion` FOR EACH ROW BEGIN
    INSERT INTO auditoria (
        id_punto,
        id_usuario,
        fecha_anterior,
        nombre_anterior,
        descripcion_anterior,
        fuente_resultado_anterior,  -- Nombre de columna corregido
        fecha_actual,
        nombre_actual,
        descripcion_actual,
        fuente_resultado_actual     -- Nombre de columna corregido
    )
    VALUES (
        OLD.id_punto,
        @usuario_actual,
        OLD.fecha,
        OLD.nombre,
        OLD.descripcion,
        OLD.fuente_resultado,  -- Referencia a la nueva columna en resolucion
        NEW.fecha,
        NEW.nombre,
        NEW.descripcion,
        NEW.fuente_resultado   -- Referencia a la nueva columna en resolucion
    );
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `resultado`
--

DROP TABLE IF EXISTS `resultado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resultado` (
  `id_punto` int NOT NULL,
  `n_total` int DEFAULT NULL,
  `n_ausentes` int DEFAULT NULL,
  `n_mitad_miembros_presente` decimal(5,2) DEFAULT NULL,
  `mitad_miembros_ponderado` decimal(5,2) DEFAULT NULL,
  `n_dos_terceras_miembros` decimal(5,2) DEFAULT NULL,
  `dos_terceras_ponderado` decimal(5,2) DEFAULT NULL,
  `estado_ponderado` enum('aprobada','rechazada','pendiente','empate') DEFAULT NULL,
  `estado_nominal` enum('aprobada','rechazada','pendiente','empate') DEFAULT NULL,
  PRIMARY KEY (`id_punto`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resultado`
--

LOCK TABLES `resultado` WRITE;
/*!40000 ALTER TABLE `resultado` DISABLE KEYS */;
INSERT INTO `resultado` VALUES (140,38,0,19.00,17.47,25.33,23.29,'aprobada','aprobada'),(141,38,0,19.00,17.47,25.33,23.29,'aprobada','aprobada'),(142,37,0,19.00,17.12,24.67,22.83,'aprobada','aprobada'),(143,38,0,19.00,17.47,25.33,23.29,'aprobada','aprobada'),(144,38,2,18.00,17.12,25.33,22.83,'pendiente','pendiente'),(145,38,1,19.00,17.47,25.33,23.29,'aprobada','aprobada'),(146,38,2,19.00,NULL,NULL,NULL,NULL,NULL),(147,38,2,18.00,17.12,25.33,22.83,'aprobada','aprobada'),(148,38,1,19.00,NULL,NULL,NULL,NULL,NULL),(149,38,2,19.00,17.12,25.33,22.83,'aprobada','aprobada');
/*!40000 ALTER TABLE `resultado` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sesion`
--

DROP TABLE IF EXISTS `sesion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sesion` (
  `id_sesion` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `codigo` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_inicio` datetime DEFAULT NULL,
  `fecha_fin` datetime DEFAULT NULL,
  `tipo` enum('ordinaria','extraordinaria') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fase` enum('pendiente','activa','finalizada') COLLATE utf8mb4_general_ci DEFAULT 'pendiente',
  `estado` tinyint DEFAULT '1',
  `status` tinyint DEFAULT '1',
  PRIMARY KEY (`id_sesion`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sesion`
--

LOCK TABLES `sesion` WRITE;
/*!40000 ALTER TABLE `sesion` DISABLE KEYS */;
INSERT INTO `sesion` VALUES (16,'preba 1','S-TYE571','2025-10-20 07:00:00',NULL,'ordinaria','activa',1,1),(17,'prueba 2','S-RBC556','2025-10-20 11:34:00',NULL,'extraordinaria','activa',1,1);
/*!40000 ALTER TABLE `sesion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sesion_documento`
--

DROP TABLE IF EXISTS `sesion_documento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sesion_documento` (
  `id_sesion_documento` int NOT NULL AUTO_INCREMENT,
  `id_sesion` int NOT NULL,
  `id_documento` int NOT NULL,
  `estado` tinyint DEFAULT '1',
  `status` tinyint DEFAULT '1',
  PRIMARY KEY (`id_sesion_documento`),
  KEY `fk_sesion_documento_sesion` (`id_sesion`),
  KEY `fk_sesion_documento_documento` (`id_documento`),
  CONSTRAINT `fk_sesion_documento_documento` FOREIGN KEY (`id_documento`) REFERENCES `documento` (`id_documento`) ON DELETE CASCADE,
  CONSTRAINT `fk_sesion_documento_sesion` FOREIGN KEY (`id_sesion`) REFERENCES `sesion` (`id_sesion`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sesion_documento`
--

LOCK TABLES `sesion_documento` WRITE;
/*!40000 ALTER TABLE `sesion_documento` DISABLE KEYS */;
/*!40000 ALTER TABLE `sesion_documento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `codigo` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cedula` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contrasena` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tipo` enum('administrador','votante') COLLATE utf8mb4_general_ci NOT NULL,
  `id_grupo_usuario` int DEFAULT NULL,
  `id_usuario_reemplazo` int DEFAULT NULL,
  `id_facultad` int DEFAULT NULL,
  `es_reemplazo` tinyint DEFAULT '0',
  `estado` tinyint DEFAULT '1',
  `status` tinyint DEFAULT '1',
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `codigo` (`codigo`),
  UNIQUE KEY `cedula` (`cedula`),
  KEY `fk_usuario_reemplazo` (`id_usuario_reemplazo`),
  KEY `fk_usuario_facultad` (`id_facultad`),
  KEY `fk_usuario_grupo` (`id_grupo_usuario`),
  CONSTRAINT `fk_usuario_facultad` FOREIGN KEY (`id_facultad`) REFERENCES `facultad` (`id_facultad`),
  CONSTRAINT `fk_usuario_grupo` FOREIGN KEY (`id_grupo_usuario`) REFERENCES `grupo_usuario` (`id_grupo_usuario`),
  CONSTRAINT `fk_usuario_reemplazo` FOREIGN KEY (`id_usuario_reemplazo`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'Cristian Bonilla','U001',NULL,'$2b$10$uVGRwMNtfBhQtcywLO6GMuyuf2qE07yLR.YD9X9G5cHEX/GbeBIfm','administrador',NULL,NULL,NULL,0,1,1),(19,'Yolanda Roldán','ABG360',NULL,'$2b$10$X/OC0/yGONqlnpCtV47E2eQUhOSztp7HABX43WZ8woTnd9FgH2IcG','administrador',NULL,NULL,NULL,0,1,1),(20,'Marcos Zambrano Zambrano','U-UNQ920','U2FsdGVkX1/f4Id7Y8rGFKGLjkdc3tnpgjxamlkhOeM=',NULL,'votante',1,NULL,NULL,0,1,1),(21,'Pedro Quijije Anchundia','U-UZW392','U2FsdGVkX196z83xcO8Y4NgOFVoBK62CJRFiNEjgH0U=',NULL,'votante',2,NULL,NULL,0,1,1),(22,'Jackeline Terranova Ruiz','U-RFR645','U2FsdGVkX1+SWGHL83bhtHp43xuBXE0FuIocId2zCR4=',NULL,'votante',2,NULL,NULL,0,1,1),(23,'Lenin Arroyo Baltan','U-AHT044','U2FsdGVkX1/C7PZqBpgI7jldzfZE3v9jweLo4rGMqZ0=',NULL,'votante',3,NULL,NULL,0,1,1),(24,'Maria Delgado Chavez','U-XPN711','U2FsdGVkX18/S/KaLzpeBdNYvuUJ7YkRjFMgb0hckrs=',NULL,'votante',3,NULL,NULL,0,1,1),(25,'Dolores Muñoz Verduga','U-OIB221','U2FsdGVkX18EBNGplsMKkmli494TocU53tq1Nb5uAzE=',NULL,'votante',3,NULL,NULL,0,1,1),(26,'Eduardo Caicedo Coello','U-JRT989','U2FsdGVkX19xMdHqWLgE/+Z3kZhhKdo2/OgLE7V6MFY=',NULL,'votante',3,NULL,NULL,0,1,1),(27,'Temistocles Bravo Tuarez','U-BBQ018','U2FsdGVkX1+jZdfU8FbBdmNwONhb/P0QLnTMBdMt9cA=',NULL,'votante',3,NULL,NULL,0,1,1),(28,'Maria Fernanda Carvajal','U-IGD697','U2FsdGVkX1/ASreUN47lMhxeQaL2AEmvZZDRW1sol0A=',NULL,'votante',3,NULL,NULL,0,1,1),(30,'Derli Alava Rosado','U-WBI377','U2FsdGVkX19PUKZHYaiM8ik7eXW+vwuN+qfJ8GOrfeE=',NULL,'votante',3,NULL,NULL,0,1,1),(31,'Lilia Bermudez Cevallos','U-VLN894','U2FsdGVkX1/pXavGAvcx4a97ZiWT9D6GMSKtshIpa08=',NULL,'votante',4,NULL,NULL,0,1,1),(32,'Jacinto Reyes Cardenas','U-MMG998','U2FsdGVkX18y5718ed4Mkqtapn4rqTmIoo8DRTkivAQ=',NULL,'votante',4,NULL,NULL,0,1,1),(33,'Ricardo Chica Cepeda','U-IME221','U2FsdGVkX19Kcf91FlSk1igOLyyZfHb5qUwJQwmOhnM=',NULL,'votante',4,NULL,NULL,0,1,1),(34,'Jorge Vivas Cedeño','U-HXY844','U2FsdGVkX1+UrfkR/sj12aOblatMZKFi5uqRlTY/w0I=',NULL,'votante',4,NULL,NULL,0,1,1),(35,'Jose Morante Galarza','U-BFB845','U2FsdGVkX183RL7911e+XAqFmwUk8bwM1MxRRheF4X4=',NULL,'votante',4,NULL,NULL,0,1,1),(36,'Marjorie Calderon Zamora','U-XNW608','U2FsdGVkX18cclBsKZd8yj9ldqxoqftdThsKaoipW98=',NULL,'votante',4,NULL,NULL,0,1,1),(37,'Cruz Alcivar Ruiz','U-LCN201','U2FsdGVkX19qVfTLrwOkI+0+ZBQHjY5vmovWhCl9YC4=',NULL,'votante',4,NULL,NULL,0,1,1),(38,'Danny Aguaiza Tenelema','U-NYO068','U2FsdGVkX196Yj460/QQVP/OtHLRhTIaZkZ6A8uPFis=',NULL,'votante',4,NULL,NULL,0,1,1),(39,'Dayanara Macias Mayorga','U-CRH977','U2FsdGVkX18ZxRghukU7lVV1AMVmaYmEj6ik2ddSUlI=',NULL,'votante',4,NULL,NULL,0,1,1),(40,'Juana Ochoa Soledispa','U-CQA309','U2FsdGVkX1/xWFLcvzxZOAriHtRmQHDOwzKWBl/0RkU=',NULL,'votante',4,NULL,NULL,0,1,1),(42,'Manuel Velasquez Campozano','U-BXA422','U2FsdGVkX19XakBAG5SmbNkdb/G6VexBcW8g7xcRYTw=',NULL,'votante',4,NULL,NULL,0,1,1),(43,'Patricia Muñoz Murillo','U-QOJ042','U2FsdGVkX1/nX7Yjfm4JeGD6ANb7HGpMUlLakyDz8eM=',NULL,'votante',4,NULL,NULL,0,1,1),(44,'Horacio Cedeño Muñoz','U-VBG552','U2FsdGVkX18zWZgYSW3rkUl0wqzZJFOrTeCbSieBahE=',NULL,'votante',4,NULL,NULL,0,1,1),(45,'Lilia Murillo Yagual','U-JVX441','U2FsdGVkX1/Z4DnQ9ZjRlKgQys8wgOfxytYX041IBb0=',NULL,'votante',5,NULL,NULL,0,1,1),(46,'Maria Sanchez Perez','U-VVD098','U2FsdGVkX1/ojNBS35mUPd5uW9Lh9YKMrAmto1uJaOM=',NULL,'votante',5,NULL,NULL,0,1,1),(47,'Rosa Castro Anchundia','U-XZE116','U2FsdGVkX19Zm9HjScPgmNpm3y+NqbokslYnetxrquA=',NULL,'votante',5,NULL,NULL,0,1,1),(48,'Eddie Velasquez Delgado','U-WXH704','U2FsdGVkX18epeN/XtJJYn+8MDF2Ys7mv/UrtnJDvps=',NULL,'votante',5,NULL,NULL,0,1,1),(49,'Luis Sanchez Briones','U-JHR854','U2FsdGVkX196S0pktj5qYnI8Wtil2OcLHQoL9Bvi34k=',NULL,'votante',5,NULL,NULL,0,1,1),(50,'Bryan Reyes Moreira','U-OQD958','U2FsdGVkX1+NqTU8yl6afbG6OsS3NDZKBHK6+z9/g5o=',NULL,'votante',5,NULL,NULL,0,1,1),(51,'Melany Herrera Zambrano','U-GAP953','U2FsdGVkX19EBWH36NYMVs7CW263eCnnOshHPSpNvs0=',NULL,'votante',5,NULL,NULL,0,1,1),(52,'Ana Santana Zambrano','U-TOC671','U2FsdGVkX19yOX9TboizwjRRvmjxdXp2UEhQopEJCbU=',NULL,'votante',5,NULL,NULL,0,1,1),(53,'Jorge Holguin Rangel','U-WDD713','U2FsdGVkX1/62ktijVtHuroVl2gO4tFTmjn4ZLI7N3M=',NULL,'votante',6,NULL,NULL,0,1,1),(66,'Héctor Cedeño Zambrano','U-OTU980','U2FsdGVkX19xrglmG7vP+36u65lPjqL0xe4x8Ifl7oI=',NULL,'votante',3,NULL,NULL,0,1,1),(67,'Beatriz Moreira Macías','U-LKL039','U2FsdGVkX1+vVjtA3OTaZLQXLLcgr7FjGcniftSDhZ4=',NULL,'votante',3,NULL,NULL,0,1,1),(68,'Yenny Zambrano Villegas','U-LIB236','U2FsdGVkX19EVFLluHzHVApDVlEIu0P0j5pxXAz4Glw=',NULL,'votante',3,NULL,NULL,0,1,1),(69,'Cristhian Mera Macias','U-VNB884','U2FsdGVkX1/PoO+RJE56lKCXQprtcR8+GsLPVAtUYjQ=',NULL,'votante',3,NULL,NULL,0,1,1),(70,'Mirian Quiroz Parraga','U-QDV913','U2FsdGVkX19njoa1Kgi0xgqf96BvKltI7pa4MaOieO0=',NULL,'votante',4,NULL,NULL,0,1,1),(71,'Segundo Reyes Solorzano','U-BJY965','U2FsdGVkX1/TcATDLSxh0lNoOK8jX72Te3JoC78QUeU=',NULL,'votante',4,NULL,NULL,0,1,1);
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'ocs3'
--

--
-- Dumping routines for database 'ocs3'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-21 16:25:19
