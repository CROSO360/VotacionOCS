// =======================
// Interfaz: IResolucion
// Representa la resolución tomada sobre un punto del orden del día
// =======================

import { IPunto } from './IPunto';

export interface IResolucion {
  /**
   * Punto al que está asociada la resolución
   */
  punto?: IPunto;

  /**
   * Nombre o título de la resolución
   */
  nombre?: string;

  /**
   * Descripción detallada de la resolución
   */
  descripcion?: string;

  /**
   * Fecha en la que se registró la resolución
   */
  fecha?: Date;

  /**
   * Indica si el resultado fue ingresado manualmente por la Secretaría
   */
  voto_manual?: boolean;

  /**
   * Indica si la resolución está activa (según lógica de negocio)
   */
  estado?: boolean;

  /**
   * Estado general del registro en la base de datos
   */
  status?: boolean;
}
