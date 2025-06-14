// =======================
// Interfaz: IPunto
// Representa un punto del orden del día dentro de una sesión del OCS
// =======================

import { ISesion } from './ISesion';

export interface IPunto {
  /**
   * Identificador único del punto
   */
  id_punto?: number;

  /**
   * Sesión a la que pertenece el punto
   */
  sesion?: ISesion;

  /**
   * Título o nombre del punto
   */
  nombre?: string;

  /**
   * Detalle o descripción del punto
   */
  detalle?: string;

  /**
   * Orden del punto dentro de la sesión
   */
  orden?: number;

  /**
   * Indica si el punto es de tipo administrativo
   */
  es_administrativa?: boolean;

  // =======================
  // Resultados en números absolutos
  // =======================

  /**
   * Número de votos a favor
   */
  n_afavor?: number;

  /**
   * Número de votos en contra
   */
  n_encontra?: number;

  /**
   * Número de abstenciones
   */
  n_abstencion?: number;

  // =======================
  // Resultados en porcentaje
  // =======================

  /**
   * Porcentaje de votos a favor
   */
  p_afavor?: number;

  /**
   * Porcentaje de votos en contra
   */
  p_encontra?: number;

  /**
   * Porcentaje de abstenciones
   */
  p_abstencion?: number;

  /**
   * Resultado final del punto (e.g., 'aprobada', 'rechazada', 'pendiente')
   */
  resultado?: string;

  /**
   * Indica si el punto está activo (según lógica de negocio)
   */
  estado?: boolean;

  /**
   * Estado general del registro en la base de datos
   */
  status?: boolean;
}
