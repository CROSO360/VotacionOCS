// =======================
// Interfaz: IResolucion
// Representa la resoluciÃ³n tomada sobre un punto del orden del dÃ­a
// =======================

import { IPunto } from './IPunto';

export interface IResolucion {
  /**
   * Punto al que estÃ¡ asociada la resoluciÃ³n
   */
  punto?: IPunto;

  /**
   * Nombre o tÃ­tulo de la resoluciÃ³n
   */
  nombre?: string;

  /**
   * DescripciÃ³n detallada de la resoluciÃ³n
   */
  descripcion?: string;

  /**
   * Fecha en la que se registrÃ³ la resoluciÃ³n
   */
  fecha?: Date;

  /**
   * Fuente que origina el resultado (por ejemplo, automatico, manual, hibrido)
   */
  fuente_resultado?: string;

  /**
   * Indica si la resoluciÃ³n estÃ¡ activa (segÃºn lÃ³gica de negocio)
   */
  estado?: boolean;

  /**
   * Estado general del registro en la base de datos
   */
  status?: boolean;
}

