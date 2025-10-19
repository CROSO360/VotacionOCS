// =======================
// Interfaz: IPunto
// Representa un punto del orden del dÃ­a dentro de una sesiÃ³n del OCS
// =======================

import { ISesion } from './ISesion';

export interface IPunto {
  /**
   * Identificador Ãºnico del punto
   */
  id_punto?: number;

  /**
   * SesiÃ³n a la que pertenece el punto
   */
  sesion?: ISesion;

  /**
   * TÃ­tulo o nombre del punto
   */
  nombre?: string;

  /**
   * Detalle o descripciÃ³n del punto
   */
  detalle?: string;

  /**
   * Orden del punto dentro de la sesiÃ³n
   */
  orden?: number;

  /**
   * Indica si el punto es de tipo administrativo
   */
  es_administrativa?: boolean;

  // =======================
  // Resultados en nÃºmeros absolutos
  // =======================

  /**
   * NÃºmero de votos a favor
   */
  n_afavor?: number;

  /**
   * NÃºmero de votos en contra
   */
  n_encontra?: number;

  /**
   * NÃºmero de abstenciones
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
   * Indicates how the result was obtained (e.g., automatico, manual)
   */
  calculo_resultado?: string;

  tipo?: string;

  puntoReconsiderado?: IPunto;

  requiere_voto_dirimente?: boolean;

  /**
   * Indica si el punto estÃ¡ activo (segÃºn lÃ³gica de negocio)
   */
  estado?: boolean;

  /**
   * Estado general del registro en la base de datos
   */
  status?: boolean;
}

