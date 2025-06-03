import { IPunto } from "./IPunto";
import { IUsuario } from "./IUsuario";

export interface IAuditoria {
    id_auditoria?: number;
    punto?: IPunto;
    usuario?: IUsuario;

    fecha_anterior?: Date;
    nombre_anterior?: string;
    descripcion_anterior?: string;
    voto_manual_anterior?: boolean;

    fecha_actual?: Date;
    nombre_actual?: string;
    descripcion_actual?: string;
    voto_manual_actual?: boolean;
}