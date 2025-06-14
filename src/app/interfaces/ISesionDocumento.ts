// =======================
// Interfaz: ISesionDocumento
// Representa la relación entre una sesión y un documento adjunto
// =======================

import { IDocumento } from './IDocumento';
import { ISesion } from './ISesion';

export interface ISesionDocumento {
  /**
   * Identificador único del vínculo sesión-documento
   */
  id_sesion_documento?: number;

  /**
   * Sesión a la que está asociado el documento
   */
  sesion?: ISesion;

  /**
   * Documento vinculado a la sesión
   */
  documento?: IDocumento;

  /**
   * Indica si la relación está activa (según lógica de negocio)
   */
  estado?: boolean;

  /**
   * Estado general del registro en la base de datos
   */
  status?: boolean;
}
