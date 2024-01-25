import { Routes } from '@angular/router';
import { InicioSesionComponent } from './inicio-sesion/inicio-sesion.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { userGuardGuard } from './user-guard.guard';
import { SesionComponent } from './sesion/sesion.component';
import { VotacionComponent } from './votacion/votacion.component';
import { VotantesComponent } from './votantes/votantes.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    /*{
        path: '**',
        redirectTo: 'home' // Redirigir a 'home' para cualquier ruta desconocida
    },*/
    {
        path: 'login', 
        title: 'OCS - Inicio de sesión',
        component: InicioSesionComponent
    },
    {
        path: 'home',
        title: 'OCS',
        component: DashboardComponent, 
        canActivate: [userGuardGuard],
    },
    {
        path:'sesion/:id',
        title: 'OCS - Sesiones',
        component: SesionComponent,
        canActivate: [userGuardGuard]
    },
    {
        path:'votacion/:id',
        title:'Votacion',
        component:VotacionComponent,
        canActivate:[userGuardGuard],
    },
    {
        path:'votantes/:id',
        title: 'Votantes',
        component: VotantesComponent,
        canActivate: [userGuardGuard],
    }
];
