// =======================
// Interfaz: IGrupoUsuario
// Representa el grupo al que pertenece un usuario, con su peso de voto
// =======================

export interface IGrupoUsuario {
  /**
   * Identificador único del grupo de usuario
   */
  id_grupo_usuario?: number;

  /**
   * Nombre del grupo (por ejemplo: Docente, Estudiante, Trabajador)
   */
  nombre?: string;

  /**
   * Peso que representa su valor en las votaciones
   */
  peso?: number;

  /**
   * Indica si el grupo está activo (según lógica de negocio)
   */
  estado?: boolean;

  /**
   * Estado general del registro en la base de datos
   */
  status?: boolean;
}
