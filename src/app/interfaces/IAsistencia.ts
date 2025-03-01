import { ISesion } from "./ISesion";
import { IUsuario } from "./IUsuario";


export interface IAsistencia {
    id_asistencia?: number;
    sesion?: ISesion;
    usuario?: IUsuario;
    tipo_asistencia?: string;
    estado?: boolean;
    status?: boolean;
}