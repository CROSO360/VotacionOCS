import { IDocumento } from "./IDocumento";
import { IPunto } from "./IPunto";

export interface IPuntoDocumento {
    id_punto_documento?: number;
    punto?: IPunto;
    documento?: IDocumento;
    estado?: boolean;
    status?: boolean;
}