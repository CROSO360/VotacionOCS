export interface ISesion{
    id_sesion?: number;
    nombre?: string;
    codigo?: string;
    fecha?: Date;//_inicio
    //fecha_fin?: Date;
    tipo?: string;
    oficio?: string;//eliminar
    periodo?: string; // eliminar
    estado?: boolean;
    status?: boolean;
}