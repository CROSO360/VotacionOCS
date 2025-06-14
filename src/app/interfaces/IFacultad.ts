// =======================
// Interfaz: IFacultad
// Representa una facultad dentro de la institución universitaria
// =======================

export interface IFacultad {
  /**
   * Identificador único de la facultad
   */
  id_facultad?: number;

  /**
   * Nombre de la facultad
   */
  nombre?: string;

  /**
   * Indica si la facultad está activa (según lógica de negocio)
   */
  estado?: boolean;

  /**
   * Estado general del registro en la base de datos
   */
  status?: boolean;
}
