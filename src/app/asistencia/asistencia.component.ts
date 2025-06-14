// =======================
// AsistenciaComponent
// Componente encargado de gestionar las asistencias a una sesión del OCS.
// Permite generar, sincronizar y eliminar asistencias, además de filtrar y seleccionar usuarios.
// =======================

// Importaciones Angular y Comunes
import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';

// Componentes
import { BarraSuperiorComponent } from '../barra-superior/barra-superior.component';

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

@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BarraSuperiorComponent,
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
        this.miembrosOCS = miembros.map(m => m.usuario);

        this.usuarios.forEach((usuario) => {
          usuario.seleccionado = this.asistencias.some(
            (asist) => asist.usuario?.id_usuario === usuario.id_usuario
          );
        });

        this.usuariosSeleccionados = this.usuarios.filter((u) => u.seleccionado);
        this.filtrarUsuarios();
        this.cambiarGrupo(null);
      },
      error: (err) => {
        console.error('Error al cargar los datos:', err);
        this.toastr.error('Error al cargar los datos', 'Error');
      },
    });
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
    const relations = ['usuario'];
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

  filtrarUsuarios() {
    this.usuariosFiltrados = this.usuarios.filter(
      (usuario) =>
        (!this.grupoActual ||
          usuario.grupoUsuario?.id_grupo_usuario === this.grupoActual.id_grupo_usuario) &&
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
      if (!this.usuariosSeleccionados.some(u => u.id_usuario === usuario.id_usuario)) {
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
    if (!this.idSesion) return;
    this.asistenciaService.generarAsistencia(this.idSesion).subscribe(() => {
      this.toastr.success('Asistencias generadas correctamente');
      this.ngOnInit();
    });
  }

  eliminarAsistencias() {
    if (!this.idSesion) return;
    this.asistenciaService.eliminarAsistencia(this.idSesion).subscribe(() => {
      this.toastr.success('Asistencia eliminada');
      this.ngOnInit();
    });
  }

  sincronizarAsistencias() {
    const usuariosSeleccionados = this.usuariosSeleccionados.map(u => u.id_usuario!);
    if (!this.idSesion) return;

    this.asistenciaService.sincronizarAsistencia(this.idSesion, usuariosSeleccionados).subscribe(() => {
      this.toastr.success('Asistencias actualizadas');
      this.cerrarModal('modalAsistencia');
      this.ngOnInit();
    });
  }

  enviarAsistencia() {
    if (!this.idSesion) return;

    this.asistenciaService.saveManyData(this.asistencias).subscribe({
      next: () => {
        this.toastr.success('Asistencias guardadas correctamente');
        this.ngOnInit();
      },
      error: (err) => {
        console.error('Error al guardar asistencias:', err);
        this.toastr.error('Error al guardar asistencias', 'Error');
      },
    });
  }

  // =======================
  // Utilidades
  // =======================

  esMiembroOCS(idUsuario: number): boolean {
    return this.miembrosOCS.some(u => u.id_usuario === idUsuario);
  }

  cerrarModal(modalId: string) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
      modalElement.setAttribute('aria-hidden', 'true');
      modalElement.removeAttribute('aria-modal');
      modalElement.removeAttribute('role');
    }

    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';

    const backdrops = document.getElementsByClassName('modal-backdrop');
    while (backdrops[0]) {
      backdrops[0].parentNode?.removeChild(backdrops[0]);
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
    const clickedInside = (event.target as HTMLElement).closest('.custom-select');
    if (!clickedInside) {
      this.showOptions = false;
    }
  }
}
