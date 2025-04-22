import { IFacultad } from "./IFacultad";
import { IGrupoUsuario } from "./IGrupoUsuario";

export interface IUsuario{
    id_usuario?: number;
    nombre?: string;
    codigo?: string;
    cedula?: string;
    contrasena?: string;
    tipo?: string;
    grupoUsuario?: IGrupoUsuario;
    usuarioReemplazo?: IUsuario;
    facultad?: IFacultad;
    es_reemplazo?: boolean;
    estado?: boolean;
    status?: boolean;
}