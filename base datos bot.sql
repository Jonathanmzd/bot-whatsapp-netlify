CREATE DATABASE  IF NOT EXISTS `bot_responses` /*!40100 DEFAULT CHARACTER SET utf8 */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `bot_responses`;
-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: 192.168.10.83    Database: bot_responses
-- ------------------------------------------------------
-- Server version	8.0.25-commercial

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
-- Table structure for table `responses`
--

DROP TABLE IF EXISTS `responses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `responses` (
  `      id` int NOT NULL AUTO_INCREMENT,
  `flow_name` varchar(100) NOT NULL,
  `step_name` varchar(100) NOT NULL,
  `response_text` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`      id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `responses`
--

LOCK TABLES `responses` WRITE;
/*!40000 ALTER TABLE `responses` DISABLE KEYS */;
INSERT INTO `responses` VALUES (1,'welcome_flow','cow_flow','Quiero tener información acerca de las vacas','2025-01-28 05:00:32'),(2,'welcome_flow','dog_flow','Quiero tener información acerca de los perros','2025-01-28 05:00:32'),(3,'cow_flow','answer_flow_1','Quiero saber cuantas razas de vacas hay','2025-01-28 05:00:32'),(4,'cow_flow','answer_flow_2','Quiero saber cuantos años viven las vacas','2025-01-28 05:00:32'),(5,'cow_flow','welcome_flow','Regresar al menú principal','2025-01-28 05:00:32'),(6,'dog_flow','answer_flow_1','Quiero saber cuantas razas de perros hay','2025-01-28 05:00:32'),(7,'dog_flow','answer_flow_2','Quiero saber cuantos años viven los perros','2025-01-28 05:00:32'),(8,'dog_flow','famous_dog_flow','Quiero conocer mas de perros de la cultura popular','2025-01-28 05:00:32'),(9,'dog_flow','welcome_flow','Regresar al menú principal','2025-01-28 05:00:32'),(10,'famous_dog_flow','answer_flow_1','Quiero saber mas acerca de Coraje el perro cobarde','2025-01-28 05:00:32'),(11,'famous_dog_flow','dog_flow','Regresar a la lista anterior','2025-01-28 05:00:32'),(12,'answer_flow_1','cow_flow','Existen mas de 1000 razas de bovinos en el mundo.','2025-01-28 05:00:32'),(13,'answer_flow_2','cow_flow','En un entorno natural o de pastoreo, una vaca puede vivir entre 20 años o más.','2025-01-28 05:00:32'),(14,'answer_flow_1','dog_flow','Se estima que existe alrededor de 360 razas de perros','2025-01-28 05:00:32'),(15,'answer_flow_2','dog_flow','En general, suelen vivir entre 12 y 16 años','2025-01-28 05:00:32'),(16,'answer_flow_1','famous_dog_flow','Coraje el perro cobarde es un personaje iconico de los dibujos animados. Es protagonista de la serie que lleva su mismo nombre, que se emitió en Cartoon Network a finales de los 90 y principios de los 2000','2025-01-28 05:00:32');
/*!40000 ALTER TABLE `responses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `responses_snr`
--

DROP TABLE IF EXISTS `responses_snr`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `responses_snr` (
  `      id` int NOT NULL AUTO_INCREMENT,
  `flow_name` varchar(100) NOT NULL,
  `step_name` varchar(100) NOT NULL,
  `response_text` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`      id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `responses_snr`
--

LOCK TABLES `responses_snr` WRITE;
/*!40000 ALTER TABLE `responses_snr` DISABLE KEYS */;
INSERT INTO `responses_snr` VALUES (1,'general_flow','atencion_flow','Quiero saber más acerca de los canales y horarios de atención de la entidad','2025-01-29 16:25:43'),(2,'general_flow','tarifa_flow','Quiero saber más acerca de los diferentes tipos de tarifas','2025-01-29 16:25:43'),(3,'general_flow','directorio_flow','Quiero saber más acerca de los distintos directorios de la entidad','2025-01-29 16:25:43'),(4,'general_flow','pasopaso_flow','Quiero consultar los diferentes paso a paso que hay para obtención de certificados y matrículas','2025-01-29 16:25:43'),(5,'general_flow','answer_flow_1','¿Qué actos son sujetos de registro?','2025-01-29 16:25:43'),(6,'atencion_flow','answer_flow_1','¿Cuáles son los canales de atención de la Superintendencia de Notariado y Registro?','2025-01-29 16:26:19'),(7,'atencion_flow','answer_flow_2','Quiero saber el horario de atención de las oficinas de registro de instrumentos públicos','2025-01-29 16:26:19'),(8,'tarifa_flow','answer_flow_1','¿Dónde encuentro las tarifas registrales?','2025-01-29 16:26:19'),(9,'tarifa_flow','answer_flow_2','¿Dónde encuentro las tarifas notariales?','2025-01-29 16:26:19'),(10,'directorio_flow','answer_flow_1','¿Dónde encuentro el directorio de las oficinas de instrumentos públicos del país?','2025-01-29 16:26:19'),(11,'directorio_flow','answer_flow_2','¿Dónde encuentro el directorio de las notarías?','2025-01-29 16:26:19'),(12,'directorio_flow','answer_flow_3','¿Dónde encuentro el directorio de las curadorías?','2025-01-29 16:26:19'),(13,'directorio_flow','answer_flow_4','¿Dónde encuentro el directorio de los gestores catastrales?','2025-01-29 16:26:19'),(14,'pasopaso_flow','answer_flow_1','¿Cuál es el paso a paso para generar el certificado de tradición en línea, pagando a través de PSE?','2025-01-29 16:26:19'),(15,'pasopaso_flow','answer_flow_2','¿Cuál es el paso a paso para consultar el número de matrícula inmobiliaria de un predio?','2025-01-29 16:26:19'),(16,'pasopaso_flow','answer_flow_3','¿Cuál es el paso a paso para obtener el certificado de no propiedad para apostillar?','2025-01-29 16:26:19'),(17,'pasopaso_flow','answer_flow_4','¿Cuál es el paso a paso para obtener un certificado de no propiedad para ser presentado ante una autoridad?','2025-01-29 16:26:19'),(18,'pasopaso_flow','answer_flow_5','¿Cuál es el procedimiento para gestionar un certificado de tradición para apostillar?','2025-01-29 16:27:11'),(19,'pasopaso_flow','answer_flow_6','¿Cuál es el procedimiento para radicar una PQRSDF en el SISG y consultar su estado?','2025-01-29 16:27:11'),(20,'answer_flow_1','atencion_flow','Los canales de atención de la Superintendencia de Notariado y Registro pueden ser consultados en el siguiente enlace: https://www.supernotariado.gov.co/atencion-servicios-ciudadania/canales-de-atencion-y-pida-una-cita','2025-01-29 16:27:11'),(21,'answer_flow_2','atencion_flow','El horario de atención de las oficinas de registro de instrumentos públicos es de lunes a viernes, de 8 de la mañana a 4 de la tarde.','2025-01-29 16:27:11'),(22,'answer_flow_1','tarifa_flow','La Resolución N° 00376 de 2014, mediante la cual se regulan las tarifas de los derechos registrales, que cobran las oficinas de registro de instrumentos públicos, cuando prestan su servicio, se encuentran publicadas en el siguiente enlace: https://servicios.supernotariado.gov.co/files/portal/portal-tarifas_registrales_2024.pdf','2025-01-29 16:27:11'),(23,'answer_flow_2','tarifa_flow','La Resolución 0773 de 2024, mediante la cual se regulan las tarifas de los derechos notariales que cobran las notarías, cuando prestan su servicio, se encuentran publicadas en el siguiente enlace: https://servicios.supernotariado.gov.co/files/portal/portal-tarifas_notariales_vigencia_2024.pdf','2025-01-29 16:28:01'),(24,'answer_flow_1','directorio_flow','Puede consultar los datos de contacto de las oficinas de registro de instrumentos públicos del país en el siguiente enlace: https://www.supernotariado.gov.co/oficinas-de-registro','2025-01-29 16:28:01'),(25,'answer_flow_2','directorio_flow','Puede consultar los datos de contacto de las notarías del país en el siguiente enlace: https://servicios.supernotariado.gov.co/files/portal/portal-directorionotarias2024.pdf','2025-01-29 16:28:01'),(26,'answer_flow_3','directorio_flow','Puede consultar los datos de contacto de las curadurías del país en el siguiente enlace: https://servicios.supernotariado.gov.co/files/portal/portal-directorio_curadores.pdf','2025-01-29 16:28:01'),(27,'answer_flow_4','directorio_flow','Puede consultar los datos de contacto de los gestores catastrales del país señalando el número 13 del siguiente enlace: https://www.supernotariado.gov.co/inspeccion-vigilancia-y-control-a-la-gestion-catastral','2025-01-29 16:28:39'),(28,'answer_flow_1','pasopaso_flow','El procedimiento para la expedición del certificado de tradición en línea, pagando a través de PSE, se encuentra publicado en el siguiente enlace: https://servicios.supernotariado.gov.co/files/portal/portal-paso_a_paso_compra_ctl_linea_pse.pdf. El valor es de $20.900 y debe tener el número de matrícula inmobiliaria para poder generar el certificado','2025-01-29 16:28:39'),(29,'answer_flow_2','pasopaso_flow','El procedimiento para consultar el número de matrícula de un predio se encuentra publicado en el siguiente enlace: https://servicios.supernotariado.gov.co/files/portal/portal-paso_a_paso_consulta_indice_propiedad.pdf','2025-01-29 16:28:39'),(30,'answer_flow_1','general_flow','Los actos sujetos a registro pueden consultarse en el siguiente enlace: https://servicios.supernotariado.gov.co/files/portal/portal-actos_objetos_registro_2022.pdf','2025-01-29 16:28:39'),(31,'atencion_flow','general_flow','Regresar al menú anterior','2025-01-29 20:51:19'),(32,'tarifa_flow','general_flow','Regresar al menú anterior','2025-01-29 20:51:19'),(33,'directorio_flow','general_flow','Regresar al menú anterior','2025-01-29 20:51:19'),(34,'pasopaso_flow','general_flow','Regresar al menú anterior','2025-01-29 20:51:19'),(35,'answer_flow_3','pasopaso_flow','El procedimiento para gestionar el certificado de no propiedad para apostillar se encuentra publicado en el siguiente enlace:https://servicios.supernotariado.gov.co/files/portal/portal-paso_a_paso_certificado_nopropiedad_apostillado.pdf','2025-01-31 20:01:51'),(36,'answer_flow_4','pasopaso_flow','El procedimiento para gestionar el certificado de no propiedad para ser presentado a otra entidad colombiana se encuentra publicado en el siguiente enlace:https://servicios.supernotariado.gov.co/files/portal/portal-paso_a_paso_certificado_nopropiedad_pse.pdf','2025-01-31 20:01:51'),(37,'answer_flow_5','pasopaso_flow','El ciudadano debe generar el certificado de tradición en línea, a través de la página https://certificados.supernotariado.gov.co/certificado posteriormente debe enviarlo por correo electrónico correspondencia@supernotariado.gov.co, dirigido a la Dirección de Talento Humano, solicitando se certifique la firma del registrador de instrumentos públicos, que firmó el certificado de tradición, para, posteriormente, apostillarlo en la página web de la Cancillería. Esa dependencia le dará respuesta al correo electrónico. También puede acercarse a la Oficina de Atención al Ciudadano de la Superintendencia de Notariado y Registro, si se encuentra en Bogotá, para realizar el trámite el mismo día.','2025-01-31 20:01:51'),(38,'answer_flow_6','pasopaso_flow','El procedimiento se encuentra publicado en el siguiente enlace: https://servicios.supernotariado.gov.co/files/portal/portal-paso_paso_pqrsdf.pdf','2025-01-31 20:01:51');
/*!40000 ALTER TABLE `responses_snr` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-14  9:22:04
