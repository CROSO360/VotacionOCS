// =======================================
// DEFINICIÓN DE RUTAS DE LA APLICACIÓN
// =======================================

import { Routes } from '@angular/router';

// Componentes
import { InicioSesionComponent } from './inicio-sesion/inicio-sesion.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SesionComponent } from './sesion/sesion.component';
import { VotacionComponent } from './votacion/votacion.component';
import { VotantesComponent } from './votantes/votantes.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { SesionesComponent } from './sesiones/sesiones.component';
import { ResultadosComponent } from './resultados/resultados.component';
import { DocumentosSesionComponent } from './documentos-sesion/documentos-sesion.component';
import { MiembrosComponent } from './miembros/miembros.component';
import { PuntoComponent } from './punto/punto.component';
import { AsistenciaComponent } from './asistencia/asistencia.component';

// Guard
import { userGuardGuard } from './user-guard.guard';

export const routes: Routes = [

  // Redirección raíz
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },

  // Ruta comodín para redirección a home
  {
    path: '**',
    redirectTo: 'home'
  },

  // Ruta de login
  {
    path: 'login',
    title: 'OCS - Inicio de sesión',
    component: InicioSesionComponent,
  },

  // Dashboard principal
  {
    path: 'home',
    title: 'OCS',
    component: DashboardComponent,
    canActivate: [userGuardGuard],
  },

  // Gestión de sesiones
  {
    path: 'sesiones',
    title: 'Sesiones',
    component: SesionesComponent,
    canActivate: [userGuardGuard],
  },
  {
    path: 'sesion/:id',
    title: 'OCS - Sesiones',
    component: SesionComponent,
    canActivate: [userGuardGuard],
  },

  // Documentos de sesión
  {
    path: 'documentos-sesion/:id',
    title: 'Documentos de la sesión',
    component: DocumentosSesionComponent,
    canActivate: [userGuardGuard],
  },

  // Votación y detalle de votantes
  {
    path: 'votacion/:id',
    title: 'Votación',
    component: VotacionComponent,
    canActivate: [userGuardGuard],
  },
  {
    path: 'votantes/:idSesion/:idPunto',
    title: 'Votantes',
    component: VotantesComponent,
    canActivate: [userGuardGuard],
  },

  // Usuarios
  {
    path: 'usuarios',
    title: 'Usuarios',
    component: UsuariosComponent,
    canActivate: [userGuardGuard],
  },

  // Resultados
  {
    path: 'resultados/:id',
    title: 'Resultados',
    component: ResultadosComponent,
    canActivate: [userGuardGuard],
  },

  // Miembros OCS
  {
    path: 'miembros',
    title: 'Miembros OCS',
    component: MiembrosComponent,
    canActivate: [userGuardGuard],
  },

  // Punto específico
  {
    path: 'punto/:idSesion/:idPunto',
    title: 'Punto',
    component: PuntoComponent,
    canActivate: [userGuardGuard],
  },

  // Asistencia
  {
    path: 'asistencia/:idSesion',
    title: 'Asistencia',
    component: AsistenciaComponent,
    canActivate: [userGuardGuard],
  },
  
];
