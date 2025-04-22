import { IPunto } from "./IPunto";

export interface IResolucion {
    punto?: IPunto;
    nombre?: string;
    descripcion?: string;
    fecha?: Date;
    voto_manual?: boolean;
    estado?: boolean;
    status?: boolean;
}