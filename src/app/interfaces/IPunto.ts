import { ISesion } from "./ISesion";

export interface IPunto{
    id_punto?: number;
    sesion?: ISesion;
    nombre?: string;
    detalle?: string;
    orden?: number;
    es_administrativa?: boolean;

    n_afavor?: number;
    n_encontra?: number;
    n_abstencion?: number; 
    p_afavor?: number; 
    p_encontra?: number; 
    p_abstencion?: number; 

    resultado?: string;    
    estado?: boolean;
    status?: boolean;
}