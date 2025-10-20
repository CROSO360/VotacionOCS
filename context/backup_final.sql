-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 17-10-2025 a las 13:40:03
-- Versión del servidor: 10.5.29-MariaDB-cll-lve
-- Versión de PHP: 8.4.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `userprjdev_cb_ocs1`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asistencia`
--

CREATE TABLE `asistencia` (
  `id_asistencia` int(11) NOT NULL,
  `id_sesion` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `tipo_asistencia` enum('presente','remoto','ausente') DEFAULT 'ausente',
  `estado` tinyint(4) DEFAULT 1,
  `status` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `asistencia`
--


-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auditoria`
--

CREATE TABLE `auditoria` (
  `id_auditoria` int(11) NOT NULL,
  `id_punto` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `fecha_anterior` datetime DEFAULT NULL,
  `nombre_anterior` varchar(255) DEFAULT NULL,
  `descripcion_anterior` text DEFAULT NULL,
  `fuente_resultado_anterior` varchar(10) DEFAULT NULL,
  `fecha_actual` datetime DEFAULT NULL,
  `nombre_actual` varchar(255) DEFAULT NULL,
  `descripcion_actual` text DEFAULT NULL,
  `fuente_resultado_actual` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `auditoria`
--


-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `documento`
--

CREATE TABLE `documento` (
  `id_documento` int(11) NOT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `url` text DEFAULT NULL,
  `fecha_subida` datetime DEFAULT NULL,
  `estado` tinyint(4) DEFAULT 1,
  `status` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `documento`
--


-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `facultad`
--

CREATE TABLE `facultad` (
  `id_facultad` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `estado` tinyint(4) DEFAULT 1,
  `status` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `grupo`
--

CREATE TABLE `grupo` (
  `id_grupo` int(11) NOT NULL,
  `id_sesion` int(11) NOT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `estado` tinyint(4) DEFAULT 0,
  `status` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `grupo`
--



-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `grupo_usuario`
--

CREATE TABLE `grupo_usuario` (
  `id_grupo_usuario` int(11) NOT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `peso` float DEFAULT NULL,
  `estado` tinyint(4) DEFAULT 1,
  `status` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `grupo_usuario`
--

INSERT INTO `grupo_usuario` (`id_grupo_usuario`, `nombre`, `peso`, `estado`, `status`) VALUES
(1, 'rector', 1, 1, 1),
(2, 'vicerrector', 1, 1, 1),
(3, 'decano', 0.8, 1, 1),
(4, 'profesor', 1, 1, 1),
(5, 'estudiante', 0.93, 1, 1),
(6, 'trabajador', 0.7, 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `miembro`
--

CREATE TABLE `miembro` (
  `id_miembro` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `estado` tinyint(4) DEFAULT 1,
  `status` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `miembro`
--



-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `punto`
--

CREATE TABLE `punto` (
  `id_punto` int(11) NOT NULL,
  `id_sesion` int(11) NOT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `detalle` text DEFAULT NULL,
  `orden` int(11) DEFAULT NULL,
  `es_administrativa` tinyint(4) DEFAULT 0,
  `n_afavor` int(11) DEFAULT NULL,
  `n_encontra` int(11) DEFAULT NULL,
  `n_abstencion` int(11) DEFAULT NULL,
  `p_afavor` decimal(5,2) DEFAULT NULL,
  `p_encontra` decimal(5,2) DEFAULT NULL,
  `p_abstencion` decimal(5,2) DEFAULT NULL,
  `resultado` enum('aprobada','rechazada','pendiente','empate') DEFAULT NULL,
  `tipo` enum('normal','reconsideracion','repetido') DEFAULT 'normal',
  `calculo_resultado` enum('mayoria_simple','mayoria_especial') DEFAULT 'mayoria_simple',
  `id_punto_reconsiderado` int(11) DEFAULT NULL,
  `requiere_voto_dirimente` tinyint(4) DEFAULT 0,
  `estado` tinyint(4) DEFAULT 0,
  `status` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `punto`
--


-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `punto_documento`
--

CREATE TABLE `punto_documento` (
  `id_punto_documento` int(11) NOT NULL,
  `id_punto` int(11) NOT NULL,
  `id_documento` int(11) NOT NULL,
  `estado` tinyint(4) DEFAULT 1,
  `status` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `punto_documento`
--



-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `punto_grupo`
--

CREATE TABLE `punto_grupo` (
  `id_punto_grupo` int(11) NOT NULL,
  `id_grupo` int(11) NOT NULL,
  `id_punto` int(11) NOT NULL,
  `estado` tinyint(4) DEFAULT 1,
  `status` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `punto_grupo`
--



-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `punto_usuario`
--

CREATE TABLE `punto_usuario` (
  `id_punto_usuario` int(11) NOT NULL,
  `id_punto` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `opcion` enum('afavor','encontra','abstencion') DEFAULT NULL,
  `es_razonado` tinyint(4) DEFAULT 0,
  `votante` int(11) DEFAULT NULL,
  `es_principal` tinyint(4) DEFAULT 1,
  `fecha` datetime DEFAULT NULL,
  `estado` tinyint(4) DEFAULT 0,
  `status` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `punto_usuario`
--



-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `resolucion`
--

CREATE TABLE `resolucion` (
  `id_punto` int(11) NOT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha` datetime DEFAULT NULL,
  `fuente_resultado` enum('automatico','manual','hibrido') DEFAULT 'automatico',
  `estado` tinyint(4) DEFAULT 1,
  `status` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `resolucion`
--



--
-- Disparadores `resolucion`
--
DELIMITER $$
CREATE TRIGGER `trg_auditoria_resolucion` AFTER UPDATE ON `resolucion` FOR EACH ROW BEGIN
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
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `resultado`
--

CREATE TABLE `resultado` (
  `id_punto` int(11) NOT NULL,
  `n_total` int(11) DEFAULT NULL,
  `n_ausentes` int(11) DEFAULT NULL,
  `n_mitad_miembros_presente` decimal(5,2) DEFAULT NULL,
  `mitad_miembros_ponderado` decimal(5,2) DEFAULT NULL,
  `n_dos_terceras_miembros` decimal(5,2) DEFAULT NULL,
  `dos_terceras_ponderado` decimal(5,2) DEFAULT NULL,
  `estado_ponderado` enum('aprobada','rechazada','pendiente','empate') DEFAULT NULL,
  `estado_nominal` enum('aprobada','rechazada','pendiente','empate') DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sesion`
--

CREATE TABLE `sesion` (
  `id_sesion` int(11) NOT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `codigo` varchar(255) DEFAULT NULL,
  `fecha_inicio` datetime DEFAULT NULL,
  `fecha_fin` datetime DEFAULT NULL,
  `tipo` enum('ordinaria','extraordinaria') DEFAULT NULL,
  `fase` enum('pendiente','activa','finalizada') DEFAULT 'pendiente',
  `estado` tinyint(4) DEFAULT 1,
  `status` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sesion`
--


-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sesion_documento`
--

CREATE TABLE `sesion_documento` (
  `id_sesion_documento` int(11) NOT NULL,
  `id_sesion` int(11) NOT NULL,
  `id_documento` int(11) NOT NULL,
  `estado` tinyint(4) DEFAULT 1,
  `status` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sesion_documento`
--



-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `codigo` varchar(255) DEFAULT NULL,
  `cedula` varchar(255) DEFAULT NULL,
  `contrasena` varchar(255) DEFAULT NULL,
  `tipo` enum('administrador','votante') NOT NULL,
  `id_grupo_usuario` int(11) DEFAULT NULL,
  `id_usuario_reemplazo` int(11) DEFAULT NULL,
  `id_facultad` int(11) DEFAULT NULL,
  `es_reemplazo` tinyint(4) DEFAULT 0,
  `estado` tinyint(4) DEFAULT 1,
  `status` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `nombre`, `codigo`, `cedula`, `contrasena`, `tipo`, `id_grupo_usuario`, `id_usuario_reemplazo`, `id_facultad`, `es_reemplazo`, `estado`, `status`) VALUES
(1, 'Cristian Bonilla', 'U001', NULL, '$2b$10$uVGRwMNtfBhQtcywLO6GMuyuf2qE07yLR.YD9X9G5cHEX/GbeBIfm', 'administrador', NULL, NULL, NULL, 0, 1, 1),
(19, 'Yolanda Roldán', 'ABG360', NULL, '$2b$10$X/OC0/yGONqlnpCtV47E2eQUhOSztp7HABX43WZ8woTnd9FgH2IcG', 'administrador', NULL, NULL, NULL, 0, 1, 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `asistencia`
--
ALTER TABLE `asistencia`
  ADD PRIMARY KEY (`id_asistencia`),
  ADD UNIQUE KEY `uq_asistencia_sesion_usuario` (`id_sesion`,`id_usuario`),
  ADD KEY `fk_asistencia_sesion` (`id_sesion`),
  ADD KEY `fk_asistencia_usuario` (`id_usuario`);

--
-- Indices de la tabla `auditoria`
--
ALTER TABLE `auditoria`
  ADD PRIMARY KEY (`id_auditoria`),
  ADD KEY `fk_auditoria_resolucion` (`id_punto`),
  ADD KEY `fk_auditoria_usuario` (`id_usuario`);

--
-- Indices de la tabla `documento`
--
ALTER TABLE `documento`
  ADD PRIMARY KEY (`id_documento`);

--
-- Indices de la tabla `facultad`
--
ALTER TABLE `facultad`
  ADD PRIMARY KEY (`id_facultad`);

--
-- Indices de la tabla `grupo`
--
ALTER TABLE `grupo`
  ADD PRIMARY KEY (`id_grupo`),
  ADD KEY `id_sesion` (`id_sesion`);

--
-- Indices de la tabla `grupo_usuario`
--
ALTER TABLE `grupo_usuario`
  ADD PRIMARY KEY (`id_grupo_usuario`);

--
-- Indices de la tabla `miembro`
--
ALTER TABLE `miembro`
  ADD PRIMARY KEY (`id_miembro`),
  ADD KEY `fk_miembro_usuario` (`id_usuario`);

--
-- Indices de la tabla `punto`
--
ALTER TABLE `punto`
  ADD PRIMARY KEY (`id_punto`),
  ADD UNIQUE KEY `id_sesion` (`id_sesion`,`orden`),
  ADD KEY `fk_punto_reconsiderado` (`id_punto_reconsiderado`);

--
-- Indices de la tabla `punto_documento`
--
ALTER TABLE `punto_documento`
  ADD PRIMARY KEY (`id_punto_documento`),
  ADD KEY `fk_punto_documento_punto` (`id_punto`),
  ADD KEY `fk_punto_documento_documento` (`id_documento`);

--
-- Indices de la tabla `punto_grupo`
--
ALTER TABLE `punto_grupo`
  ADD PRIMARY KEY (`id_punto_grupo`),
  ADD UNIQUE KEY `uk_grupo_punto` (`id_grupo`,`id_punto`),
  ADD KEY `id_punto` (`id_punto`);

--
-- Indices de la tabla `punto_usuario`
--
ALTER TABLE `punto_usuario`
  ADD PRIMARY KEY (`id_punto_usuario`),
  ADD UNIQUE KEY `uq_punto_usuario` (`id_punto`,`id_usuario`),
  ADD KEY `fk_punto_usuario_punto` (`id_punto`),
  ADD KEY `fk_punto_usuario_usuario` (`id_usuario`),
  ADD KEY `fk_punto_usuario_votante` (`votante`);

--
-- Indices de la tabla `resolucion`
--
ALTER TABLE `resolucion`
  ADD PRIMARY KEY (`id_punto`);

--
-- Indices de la tabla `resultado`
--
ALTER TABLE `resultado`
  ADD PRIMARY KEY (`id_punto`);

--
-- Indices de la tabla `sesion`
--
ALTER TABLE `sesion`
  ADD PRIMARY KEY (`id_sesion`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Indices de la tabla `sesion_documento`
--
ALTER TABLE `sesion_documento`
  ADD PRIMARY KEY (`id_sesion_documento`),
  ADD KEY `fk_sesion_documento_sesion` (`id_sesion`),
  ADD KEY `fk_sesion_documento_documento` (`id_documento`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD UNIQUE KEY `cedula` (`cedula`),
  ADD KEY `fk_usuario_reemplazo` (`id_usuario_reemplazo`),
  ADD KEY `fk_usuario_facultad` (`id_facultad`),
  ADD KEY `fk_usuario_grupo` (`id_grupo_usuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `asistencia`
--
ALTER TABLE `asistencia`
  MODIFY `id_asistencia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1463;

--
-- AUTO_INCREMENT de la tabla `auditoria`
--
ALTER TABLE `auditoria`
  MODIFY `id_auditoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=86;

--
-- AUTO_INCREMENT de la tabla `documento`
--
ALTER TABLE `documento`
  MODIFY `id_documento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT de la tabla `facultad`
--
ALTER TABLE `facultad`
  MODIFY `id_facultad` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `grupo`
--
ALTER TABLE `grupo`
  MODIFY `id_grupo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `grupo_usuario`
--
ALTER TABLE `grupo_usuario`
  MODIFY `id_grupo_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `miembro`
--
ALTER TABLE `miembro`
  MODIFY `id_miembro` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=202;

--
-- AUTO_INCREMENT de la tabla `punto`
--
ALTER TABLE `punto`
  MODIFY `id_punto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=140;

--
-- AUTO_INCREMENT de la tabla `punto_documento`
--
ALTER TABLE `punto_documento`
  MODIFY `id_punto_documento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `punto_grupo`
--
ALTER TABLE `punto_grupo`
  MODIFY `id_punto_grupo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT de la tabla `punto_usuario`
--
ALTER TABLE `punto_usuario`
  MODIFY `id_punto_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5922;

--
-- AUTO_INCREMENT de la tabla `sesion`
--
ALTER TABLE `sesion`
  MODIFY `id_sesion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `sesion_documento`
--
ALTER TABLE `sesion_documento`
  MODIFY `id_sesion_documento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `asistencia`
--
ALTER TABLE `asistencia`
  ADD CONSTRAINT `fk_asistencia_sesion` FOREIGN KEY (`id_sesion`) REFERENCES `sesion` (`id_sesion`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_asistencia_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `auditoria`
--
ALTER TABLE `auditoria`
  ADD CONSTRAINT `fk_auditoria_resolucion` FOREIGN KEY (`id_punto`) REFERENCES `resolucion` (`id_punto`),
  ADD CONSTRAINT `fk_auditoria_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`);

--
-- Filtros para la tabla `grupo`
--
ALTER TABLE `grupo`
  ADD CONSTRAINT `grupo_ibfk_1` FOREIGN KEY (`id_sesion`) REFERENCES `sesion` (`id_sesion`) ON DELETE CASCADE;

--
-- Filtros para la tabla `miembro`
--
ALTER TABLE `miembro`
  ADD CONSTRAINT `fk_miembro_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `punto`
--
ALTER TABLE `punto`
  ADD CONSTRAINT `fk_punto_reconsiderado` FOREIGN KEY (`id_punto_reconsiderado`) REFERENCES `punto` (`id_punto`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_punto_sesion` FOREIGN KEY (`id_sesion`) REFERENCES `sesion` (`id_sesion`) ON DELETE CASCADE;

--
-- Filtros para la tabla `punto_documento`
--
ALTER TABLE `punto_documento`
  ADD CONSTRAINT `fk_punto_documento_documento` FOREIGN KEY (`id_documento`) REFERENCES `documento` (`id_documento`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_punto_documento_punto` FOREIGN KEY (`id_punto`) REFERENCES `punto` (`id_punto`) ON DELETE CASCADE;

--
-- Filtros para la tabla `punto_grupo`
--
ALTER TABLE `punto_grupo`
  ADD CONSTRAINT `punto_grupo_ibfk_1` FOREIGN KEY (`id_grupo`) REFERENCES `grupo` (`id_grupo`) ON DELETE CASCADE,
  ADD CONSTRAINT `punto_grupo_ibfk_2` FOREIGN KEY (`id_punto`) REFERENCES `punto` (`id_punto`) ON DELETE CASCADE;

--
-- Filtros para la tabla `punto_usuario`
--
ALTER TABLE `punto_usuario`
  ADD CONSTRAINT `fk_punto_usuario_punto` FOREIGN KEY (`id_punto`) REFERENCES `punto` (`id_punto`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_punto_usuario_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_punto_usuario_votante` FOREIGN KEY (`votante`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL;

--
-- Filtros para la tabla `resolucion`
--
ALTER TABLE `resolucion`
  ADD CONSTRAINT `fk_resolucion_punto` FOREIGN KEY (`id_punto`) REFERENCES `punto` (`id_punto`);

--
-- Filtros para la tabla `sesion_documento`
--
ALTER TABLE `sesion_documento`
  ADD CONSTRAINT `fk_sesion_documento_documento` FOREIGN KEY (`id_documento`) REFERENCES `documento` (`id_documento`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_sesion_documento_sesion` FOREIGN KEY (`id_sesion`) REFERENCES `sesion` (`id_sesion`) ON DELETE CASCADE;

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `fk_usuario_facultad` FOREIGN KEY (`id_facultad`) REFERENCES `facultad` (`id_facultad`),
  ADD CONSTRAINT `fk_usuario_grupo` FOREIGN KEY (`id_grupo_usuario`) REFERENCES `grupo_usuario` (`id_grupo_usuario`),
  ADD CONSTRAINT `fk_usuario_reemplazo` FOREIGN KEY (`id_usuario_reemplazo`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
