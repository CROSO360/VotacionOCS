// =======================
// Interfaz: IAuditoria
// Representa un registro de auditoría sobre cambios en una resolución
// =======================

import { IPunto } from './IPunto';
import { IUsuario } from './IUsuario';

export interface IAuditoria {
  /**
   * Identificador único del registro de auditoría
   */
  id_auditoria?: number;

  /**
   * Punto asociado al cambio registrado
   */
  punto?: IPunto;

  /**
   * Usuario que realizó la modificación
   */
  usuario?: IUsuario;

  // =======================
  // Valores anteriores (antes del cambio)
  // =======================

  /**
   * Fecha anterior de la resolución
   */
  fecha_anterior?: Date;

  /**
   * Nombre anterior de la resolución
   */
  nombre_anterior?: string;

  /**
   * Descripción anterior de la resolución
   */
  descripcion_anterior?: string;

  /**
   * Valor anterior de la bandera de voto manual
   */
  fuente_resultado_anterior?: boolean;

  // =======================
  // Valores actuales (después del cambio)
  // =======================

  /**
   * Fecha actual de la resolución
   */
  fecha_actual?: Date;

  /**
   * Nombre actual de la resolución
   */
  nombre_actual?: string;

  /**
   * Descripción actual de la resolución
   */
  descripcion_actual?: string;

  /**
   * Valor actual de la bandera de voto manual
   */
  fuente_resultado_actual?: boolean;
}
