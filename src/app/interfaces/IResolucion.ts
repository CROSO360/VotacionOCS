import { IPunto } from "./IPunto";

export interface IResolucion {
    punto?: IPunto;
    nombre?: string;
    descripcion?: string;
    fecha?: Date;
    estado?: boolean;
    status?: boolean;
}