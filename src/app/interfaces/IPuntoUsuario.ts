import { IPunto } from "./IPunto";
import { IUsuario } from "./IUsuario";

export interface IPuntoUsuario{
    id_punto_usuario?: number;
    punto?: IPunto;
    usuario?: IUsuario;
    opcion?: string;
    es_razonado?: boolean;
    es_principal?: boolean;
    //fecha?: Date;
    estado?: boolean;
    status?: boolean;
}