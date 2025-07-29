// =======================
// AsistenciaComponent
// Componente encargado de gestionar las asistencias a una sesión del OCS.
// Permite generar, sincronizar y eliminar asistencias, además de filtrar y seleccionar usuarios.
// =======================

// Importaciones Angular y Comunes
import { CommonModule, Location } from '@angular/common';
import {
  Component,
  OnInit,
  HostListener,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';

// Componentes
import { BarraSuperiorComponent } from '../components/barra-superior/barra-superior.component';

// Interfaces
import { ISesion } from '../interfaces/ISesion';
import { IAsistencia } from '../interfaces/IAsistencia';
import { IUsuario } from '../interfaces/IUsuario';

// Servicios
import { SesionService } from '../services/sesion.service';
import { AsistenciaService } from '../services/asistencia.service';
import { UsuarioService } from '../services/usuario.service';
import { GrupoUsuarioService } from '../services/grupoUsuario.service';
import { MiembroService } from '../services/miembro.service';
import { ToastrService } from 'ngx-toastr';
import { BotonAtrasComponent } from '../components/boton-atras/boton-atras.component';

import { Modal } from 'bootstrap';
import { FooterComponent } from "../components/footer/footer.component"; // asegúrate que bootstrap está instalado

@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BarraSuperiorComponent,
    BotonAtrasComponent,
    FooterComponent
],
  templateUrl: './asistencia.component.html',
  styleUrl: './asistencia.component.css',
})
export class AsistenciaComponent implements OnInit {
  // =======================
  // Propiedades públicas
  // =======================

  idSesion: number | null = null;
  sesion: ISesion | undefined;

  asistencias: IAsistencia[] = [];
  miembrosOCS: IUsuario[] = [];

  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  usuariosSeleccionados: any[] = [];

  gruposUsuarios: any[] = [];
  grupoActual: any = null;

  busqueda: string = '';
  showOptions: boolean = false;
  todosSeleccionados: boolean = false;

  //flags
  generandoAsistencia = false;

  sincronizandoAsistencias = false;

  eliminandoAsistencias = false;

  enviandoAsistencia = false;

  asistenciaModalRef: any;

  agrupadosPorGrupoAsistencia: { grupo: string; asistencias: IAsistencia[] }[] =
    [];

  asistenciasOriginales: IAsistencia[] = [];
  asistenciasFiltradas: IAsistencia[] = [];
  busquedaAsistencia: string = '';

  tipoAsistenciaActual: string | null = null; // 'presente', 'ausente' o null (todos)

  // =======================
  // Constructor
  // =======================
  constructor(
    private sesionService: SesionService,
    private asistenciaService: AsistenciaService,
    private usuarioService: UsuarioService,
    private grupoUsuarioService: GrupoUsuarioService,
    private miembroService: MiembroService,
    private toastr: ToastrService,
    private location: Location,
    private route: ActivatedRoute
  ) {}

  // =======================
  // Ciclo de Vida
  // =======================
  ngOnInit(): void {
    this.idSesion = parseInt(this.route.snapshot.paramMap.get('idSesion')!, 10);

    const asistenciaModalEl = document.getElementById('modalAsistencia');
    if (asistenciaModalEl)
      this.asistenciaModalRef = new Modal(asistenciaModalEl);

    forkJoin({
      grupos: this.cargarGruposUsuarios(),
      usuarios: this.cargarUsuarios(),
      asistencias: this.cargarAsistencias(),
      sesion: this.getSesion(),
      miembros: this.cargarMiembrosOCS(),
    }).subscribe({
      next: ({ grupos, usuarios, asistencias, sesion, miembros }) => {
        this.gruposUsuarios = grupos;
        this.usuarios = usuarios;
        this.sesion = sesion;
        this.asistencias = asistencias || [];
        this.asistenciasOriginales = [...this.asistencias];
        this.miembrosOCS = miembros.map((m) => m.usuario);

        this.usuarios.forEach((usuario) => {
          usuario.seleccionado = this.asistencias.some(
            (asist) => asist.usuario?.id_usuario === usuario.id_usuario
          );
        });

        this.usuariosSeleccionados = this.usuarios.filter(
          (u) => u.seleccionado
        );
        this.filtrarUsuarios();
        this.cambiarGrupo(null);
        this.filtrarAsistencias();
        this.agrupadosPorGrupoAsistencia = this.agruparAsistenciasPorGrupo(
          this.asistencias
        );
      },
      error: (err) => {
        console.error('Error al cargar los datos:', err);
        this.toastr.error('Error al cargar los datos', 'Error');
      },
    });
  }

  getNombreGrupoFormateado(nombre: string): string {
    const nombresMapeados: Record<string, string> = {
      decano: 'Decanos',
      estudiante: 'Estudiantes',
      profesor: 'Profesores',
      trabajador: 'Trabajadores',
      rector: 'Rector',
      vicerrector: 'Vicerrector',
    };

    return nombresMapeados[nombre.toLowerCase()] || nombre;
  }

  // =======================
  // Carga de datos
  // =======================

  cargarUsuarios(): Observable<IUsuario[]> {
    const query = `tipo=votante&estado=1`;
    const relations = [`grupoUsuario`, `usuarioReemplazo`];
    return this.usuarioService.getAllDataBy(query, relations);
  }

  cargarGruposUsuarios(): Observable<any[]> {
    return this.grupoUsuarioService.getAllData();
  }

  cargarAsistencias(): Observable<IAsistencia[]> {
    const query = `sesion.id_sesion=${this.idSesion}`;
    const relations = ['usuario', 'usuario.grupoUsuario'];
    return this.asistenciaService.getAllDataBy(query, relations);
  }

  cargarMiembrosOCS(): Observable<any[]> {
    const relations = ['usuario'];
    return this.miembroService.getAllDataBy('', relations);
  }

  getSesion(): Observable<ISesion> {
    const query = `id_sesion=${this.idSesion}`;
    return this.sesionService.getDataBy(query);
  }

  // =======================
  // Lógica de negocio
  // =======================

  filtrarAsistencias(): void {
    const filtro = this.busqueda.toLowerCase().trim();

    this.asistenciasFiltradas = this.asistenciasOriginales.filter((a) => {
      const coincideBusqueda =
        a.usuario?.nombre?.toLowerCase().includes(filtro) ||
        a.usuario?.cedula?.includes(filtro);

      const coincideTipo =
        !this.tipoAsistenciaActual ||
        a.tipo_asistencia === this.tipoAsistenciaActual;

      return coincideBusqueda && coincideTipo;
    });

    this.agrupadosPorGrupoAsistencia = this.agruparAsistenciasPorGrupo(
      this.asistenciasFiltradas
    );
  }

  cambiarTipoAsistencia(tipo: string | null): void {
    this.tipoAsistenciaActual = tipo;
    this.filtrarAsistencias();
  }

  filtrarUsuarios() {
    this.usuariosFiltrados = this.usuarios.filter(
      (usuario) =>
        (!this.grupoActual ||
          usuario.grupoUsuario?.id_grupo_usuario ===
            this.grupoActual.id_grupo_usuario) &&
        (usuario.nombre?.toLowerCase().includes(this.busqueda.toLowerCase()) ||
          usuario.cedula?.includes(this.busqueda))
    );
  }

  cambiarGrupo(grupo: any) {
    this.grupoActual = grupo;
    this.filtrarUsuarios();
  }

  actualizarSeleccion(usuario: any) {
    if (usuario.seleccionado) {
      if (
        !this.usuariosSeleccionados.some(
          (u) => u.id_usuario === usuario.id_usuario
        )
      ) {
        this.usuariosSeleccionados.push(usuario);
      }
    } else {
      this.usuariosSeleccionados = this.usuariosSeleccionados.filter(
        (u) => u.id_usuario !== usuario.id_usuario
      );
    }
  }

  toggleSeleccionarTodosUsuarios() {
    this.usuariosFiltrados.forEach((usuario) => {
      usuario.seleccionado = this.todosSeleccionados;
      this.actualizarSeleccion(usuario);
    });
  }

  // =======================
  // Operaciones de asistencia
  // =======================

  generarAsistencias() {
    if (!this.idSesion || this.generandoAsistencia) return;

    this.generandoAsistencia = true;

    this.asistenciaService.generarAsistencia(this.idSesion).subscribe({
      next: () => {
        this.toastr.success('Asistencias generadas correctamente');
        this.ngOnInit();
        this.generandoAsistencia = false;
      },
      error: (err) => {
        console.error('Error al generar asistencias:', err);
        this.toastr.error('Error al generar asistencias');
        this.generandoAsistencia = false;
      },
    });
  }

  eliminarAsistencias() {
    if (!this.idSesion) return;
    this.eliminandoAsistencias = true;

    this.asistenciaService.eliminarAsistencia(this.idSesion).subscribe({
      next: () => {
        this.toastr.success('Asistencia eliminada');
        this.ngOnInit();
        this.eliminandoAsistencias = false;
        this.cerrarModal('modalConfirmarEliminar');
      },
      error: (err) => {
        this.toastr.error('Error al eliminar asistencia', 'Error');
        this.eliminandoAsistencias = false;
      },
    });
  }

  sincronizarAsistencias() {
    this.sincronizandoAsistencias = true;

    const usuariosSeleccionados = this.usuariosSeleccionados.map(
      (u) => u.id_usuario!
    );
    if (!this.idSesion) return;

    this.asistenciaService
      .sincronizarAsistencia(this.idSesion, usuariosSeleccionados)
      .subscribe({
        next: () => {
          this.toastr.success('Asistencias actualizadas');
          this.asistenciaModalRef?.hide();

          this.ngOnInit();
          this.sincronizandoAsistencias = false;
        },
        error: (err) => {
          this.toastr.error('Error al sincronizar asistencias', 'Error');
          this.sincronizandoAsistencias = false;
        },
      });
  }

  abrirModalAsistencia() {
    if (this.asistenciaModalRef) {
      this.asistenciaModalRef.show();

      // Si necesitas refrescar algo, hazlo con un delay
      setTimeout(() => {
        this.filtrarUsuarios(); // o la lógica que quieras refrescar
      }, 10);
    }
  }

  enviarAsistencia() {
    if (!this.idSesion) return;
    this.enviandoAsistencia = true;

    this.asistenciaService.saveManyData(this.asistencias).subscribe({
      next: () => {
        this.toastr.success('Asistencias guardadas correctamente');
        this.ngOnInit();
        this.enviandoAsistencia = false;
        this.cerrarModal('modalConfirmarEnvio');
      },
      error: (err) => {
        console.error('Error al guardar asistencias:', err);
        this.toastr.error('Error al guardar asistencias', err.error.message);
        this.enviandoAsistencia = false;
      },
    });
  }

  agruparAsistenciasPorGrupo(
    asistencias: IAsistencia[]
  ): { grupo: string; asistencias: IAsistencia[] }[] {
    const gruposMap = new Map<string, IAsistencia[]>();

    asistencias.forEach((a) => {
      const nombreGrupo = a.usuario?.grupoUsuario?.nombre || 'Sin grupo';
      if (!gruposMap.has(nombreGrupo)) {
        gruposMap.set(nombreGrupo, []);
      }
      gruposMap.get(nombreGrupo)?.push(a);
    });

    const ordenGruposPersonalizado: string[] = [
      'decano',
      'estudiante',
      'profesor',
      'rector',
      'vicerrector',
      'trabajador',
    ];

    return Array.from(gruposMap.entries())
      .map(([grupo, asistencias]) => ({
        grupo,
        asistencias: asistencias.sort((a, b) =>
          (a.usuario?.nombre || '').localeCompare(b.usuario?.nombre || '')
        ),
      }))
      .sort((a, b) => {
        const indexA = ordenGruposPersonalizado.indexOf(a.grupo.toLowerCase());
        const indexB = ordenGruposPersonalizado.indexOf(b.grupo.toLowerCase());

        const safeIndexA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
        const safeIndexB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;

        return safeIndexA - safeIndexB;
      });
  }

  // =======================
  // Utilidades
  // =======================

  esMiembroOCS(idUsuario: number): boolean {
    return this.miembrosOCS.some((u) => u.id_usuario === idUsuario);
  }

  cerrarModal(modalId: string): void {
  try {
    const modalEl = document.getElementById(modalId);
    if (!modalEl) return;

    // Cerrar con Bootstrap
    const modalInstance = Modal.getInstance(modalEl) || new Modal(modalEl);
    modalInstance.hide();

    // Esperar al evento 'hidden' para limpiar el body
    const onHidden = () => {
      const otrosAbiertos = document.querySelectorAll('.modal.show').length;

      if (otrosAbiertos === 0) {
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('padding-right');
      }

      // Limpiar backdrops
      document.querySelectorAll('.modal-backdrop').forEach((b) => b.remove());

      // Quitar el listener
      modalEl.removeEventListener('hidden.bs.modal', onHidden);
    };

    modalEl.addEventListener('hidden.bs.modal', onHidden);
  } catch (error) {
    console.error(`Error al cerrar el modal "${modalId}":`, error);
  }
}


  goBack() {
    this.location.back();
  }

  // =======================
  // Eventos del DOM
  // =======================
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const clickedInside = (event.target as HTMLElement).closest(
      '.custom-select'
    );
    if (!clickedInside) {
      this.showOptions = false;
    }
  }
}
