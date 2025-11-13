// =======================
// Interfaz: IUsuario
// Representa un usuario del sistema, con sus atributos y relaciones
// =======================

import { IFacultad } from './IFacultad';
import { IGrupoUsuario } from './IGrupoUsuario';

export interface IUsuario {
  /**
   * Identificador único del usuario
   */
  id_usuario?: number;

  /**
   * Nombre completo del usuario
   */
  nombre?: string;

  /**
   * Código institucional o identificador alternativo
   */
  codigo?: string;

  /**
   * Número de cédula del usuario
   */
  cedula?: string;

  /**
   * celular del usuario
   */
  celular?: string;

  /**
   * Contraseña del usuario (encriptada)
   */
  contrasena?: string;

  /**
   * Tipo de usuario: 'administrador', 'votante', etc.
   */
  tipo?: string;

  /**
   * Grupo al que pertenece el usuario (define peso en votaciones)
   */
  grupoUsuario?: IGrupoUsuario;

  /**
   * Usuario asignado como su reemplazo
   */
  usuarioReemplazo?: IUsuario;

  /**
   * Facultad a la que pertenece el usuario
   */
  facultad?: IFacultad;

  /**
   * Indica si el usuario está actuando como reemplazo
   */
  es_reemplazo?: boolean;

  /**
   * Indica si el usuario está activo (según lógica de negocio)
   */
  estado?: boolean;

  /**
   * Estado general del registro en la base de datos
   */
  status?: boolean;
}
