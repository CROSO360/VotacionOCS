// =======================
// Interfaz: ISesion
// Representa una sesión oficial del Órgano Colegiado Superior (OCS)
// =======================

export interface ISesion {
  /**
   * Identificador único de la sesión
   */
  id_sesion?: number;

  /**
   * Nombre o título de la sesión
   */
  nombre?: string;

  /**
   * Código único asignado a la sesión
   */
  codigo?: string;

  /**
   * Fecha y hora de inicio de la sesión
   */
  fecha_inicio?: Date;

  /**
   * Fecha y hora de finalización de la sesión
   */
  fecha_fin?: Date;

  /**
   * Tipo de sesión: 'ordinaria', 'extraordinaria', etc.
   */
  tipo?: string;

  /**
   * Fase actual de la sesión: 'pendiente', 'en_curso', 'finalizada', etc.
   */
  fase?: string;

  /**
   * Indica si la sesión está activa (según lógica de negocio)
   */
  estado?: boolean;

  /**
   * Estado general del registro en la base de datos
   */
  status?: boolean;
}
