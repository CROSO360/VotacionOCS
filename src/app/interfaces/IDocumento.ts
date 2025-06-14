// =======================
// Interfaz: IDocumento
// Representa un archivo cargado en el sistema (PDF u otro)
// =======================

export interface IDocumento {
  /**
   * Identificador único del documento
   */
  id_documento?: number;

  /**
   * Nombre del documento (visible para el usuario)
   */
  nombre?: string;

  /**
   * URL donde está almacenado el archivo
   */
  url?: string;

  /**
   * Fecha en la que fue subido el documento
   */
  fecha_subida?: Date;

  /**
   * Indica si el documento está activo (según lógica de negocio)
   */
  estado?: boolean;

  /**
   * Estado general del documento en la base de datos
   */
  status?: boolean;
}
