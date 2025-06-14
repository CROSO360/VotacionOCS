// =======================
// Interfaz: IPuntoDocumento
// Relación entre un punto y un documento asociado a dicho punto
// =======================

import { IDocumento } from './IDocumento';
import { IPunto } from './IPunto';

export interface IPuntoDocumento {
  /**
   * Identificador único del vínculo punto-documento
   */
  id_punto_documento?: number;

  /**
   * Punto al que está asociado el documento
   */
  punto?: IPunto;

  /**
   * Documento asociado al punto
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
