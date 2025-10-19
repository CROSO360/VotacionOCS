// =======================
// Interfaz: IResultado
// Representa los calculos agregados de resultado asociados a un punto
// =======================

import { IPunto } from './IPunto';

export interface IResultado {
  /**
   * Identificador del punto asociado al resultado (puede ser el id o la entidad)
   */
  id_punto?: number;

  /**
   * Mitad del numero de miembros presentes
   */
  n_mitad_miembros_presente?: number;

  /**
   * Mitad de miembros segun ponderacion
   */
  mitad_miembros_ponderado?: number;

  /**
   * Mitad de miembros calculada sin ponderación (alias requerido por servicios heredados)
   */
  mitad_miembros?: number;

  /**
   * Dos terceras partes segun ponderacion
   */
  dos_terceras_ponderado?: number;

  /**
   * Numero equivalente a dos terceras partes de miembros presentes
   */
  n_dos_terceras_miembros?: number;

  /**
   * Numero de miembros ausentes
   */
  n_ausentes?: number;

  /**
   * Total de miembros considerados en el calculo
   */
  n_total?: number;

  /**
   * Estado resultante del calculo ponderado (ej: aprobado, rechazado)
   */
  estado_ponderado?: string;

  /**
   * Estado resultante del calculo nominal
   */
  estado_nominal?: string;
}

