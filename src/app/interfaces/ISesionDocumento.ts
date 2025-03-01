import { IDocumento } from "./IDocumento";
import { ISesion } from "./ISesion";

export interface ISesionDocumento {
    id_sesion_documento?: number;
    sesion?: ISesion;
    documento?: IDocumento;
    estado?: boolean;
    status?: boolean;
}