import { ISesion } from "./ISesion";

export interface IPunto{
    id_punto?: number;
    sesion?: ISesion;
    nombre?: string;
    detalle?: string;
    //orden?: number;
    //categoria?: string;

    n_afavor?: number;
    n_encontra?: number;
    n_abstinencia?: number; //abstencion
    afavor?: number; //p_afavor
    encontra?: number; //p_encontra
    abstinencia?: number; //p_abstencion

    //resultado?: string;    
    estado?: boolean;
    status?: boolean;
}