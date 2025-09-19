// =======================
// BarraSuperiorComponent
// =======================
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { filter, Subscription } from 'rxjs';
import { PuntoService } from '../../services/punto.service';
import { SesionService } from '../../services/sesion.service';
import { ISesion } from '../../interfaces/ISesion';
import { IPunto } from '../../interfaces/IPunto';

// TODO: importar interfaces desde tu archivo de interfaces
// import { ISesion } from '../interfaces/ISesion';
// import { IPunto } from '../interfaces/IPunto';

// TODO: importar tus servicios reales
// import { SesionService } from '../services/sesion.service';
// import { PuntoService } from '../services/punto.service';

@Component({
  selector: 'app-barra-superior',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './barra-superior.component.html',
  styleUrls: ['./barra-superior.component.css'],
})
export class BarraSuperiorComponent implements OnInit, OnDestroy {
  constructor(
    private cookieService: CookieService,
    private router: Router,
    private route: ActivatedRoute,
    private sesionService: SesionService,
    private puntoService: PuntoService,
  ) {}

  // ====== Estado usado en el HTML ======
  cerrandoSesion = false;
  sidebarAbierto = false;
  puntosAbierto = false;
  esHome = true;

  idSesionActual: number | null = null;
  sesion: ISesion = null; 
  puntos: IPunto[] = []; 

  cargandoSesion = false;
  cargandoPuntos = false;

  private subRouter?: Subscription;

  // ====== Ciclo de vida ======
  ngOnInit(): void {
    this.resolverContextoYDatos();
    this.subRouter = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.resolverContextoYDatos());
  }

  ngOnDestroy(): void {
    this.subRouter?.unsubscribe();
  }

  // ====== Acciones de UI ======
  toggleSidebar(): void {
    this.sidebarAbierto = !this.sidebarAbierto;
  }

  togglePuntos(): void {
    this.puntosAbierto = !this.puntosAbierto;
  }

  ir(url: string): void {
    this.router.navigateByUrl(url);
    this.sidebarAbierto = false;
  }

  async logout() {
    this.cerrandoSesion = true;
    try {
      this.cookieService.deleteAll('token');
      await this.router.navigate(['/', 'login']);
    } catch (e) {
      console.error(e);
    } finally {
      this.cerrandoSesion = false;
    }
  }

  inicio() {
    this.router.navigate(['/', 'home']);
  }

  // ====== Contexto (home vs sesión) + carga de datos ======
  private resolverContextoYDatos(): void {
    const url = this.router.url.split('#')[0].split('?')[0];

    const esSesionesListado = /^\/sesiones$/.test(url);
    const esHomeLike =
      url === '/' ||
      url.startsWith('/home') ||
      esSesionesListado ||
      url.startsWith('/usuarios') ||
      url.startsWith('/miembros');

    this.esHome = esHomeLike;

    const idParam =
    this.getFirstParamFromRouteTree(['idSesion', 'id', 'id_sesion']) ??
    null;
    const nuevoId = idParam ? parseInt(idParam, 10) : null;
    const haySesionActiva = !this.esHome && Number.isFinite(nuevoId as number);

    if (haySesionActiva && nuevoId !== this.idSesionActual) {
      this.idSesionActual = nuevoId!;
      this.cargarSesion(this.idSesionActual);
      this.cargarPuntos(this.idSesionActual);
    } else if (!haySesionActiva) {
      this.idSesionActual = null;
      this.sesion = null;
      this.puntos = [];
      this.puntosAbierto = false;
      this.cargandoSesion = false;
      this.cargandoPuntos = false;
    }
  }

  /** Devuelve el primer parámetro encontrado en el árbol de rutas */
private getFirstParamFromRouteTree(candidates: string[]): string | null {
  let r: ActivatedRoute | null = this.route.root;
  while (r) {
    for (const name of candidates) {
      if (r.snapshot?.paramMap?.has(name)) {
        return r.snapshot.paramMap.get(name);
      }
    }
    r = (r.firstChild as ActivatedRoute) ?? null;
  }
  return null;
}


  // ====== Data ======
  private cargarPuntos(idSesion: number): void {
    this.cargandoPuntos = true;

    const query = `sesion.id_sesion=${idSesion}`;
    const relations = ['sesion'];
    this.puntoService.getAllDataBy(query, relations).subscribe((data) => {
      this.puntos = data;
    });

    setTimeout(() => {
      this.puntos = [];
      this.cargandoPuntos = false;
    }, 0);
  }

  private cargarSesion(idSesion: number): void {
    this.cargandoSesion = true;

    const query = `id_sesion=${idSesion}`;
    this.sesionService.getDataBy(query).subscribe((data) => {
      this.sesion = data;
    });

    setTimeout(() => {
      this.sesion = { id_sesion: idSesion };
      this.cargandoSesion = false;
    }, 0);
  }
}
