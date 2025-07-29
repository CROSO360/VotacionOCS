import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

// Componentes y servicios personalizados
import { BarraSuperiorComponent } from '../components/barra-superior/barra-superior.component';
import { UsuarioService } from '../services/usuario.service';
import { GrupoUsuarioService } from '../services/grupoUsuario.service';
import { MiembroService } from '../services/miembro.service';

// RxJS
import { forkJoin, Observable, tap } from 'rxjs';
import { BotonAtrasComponent } from "../components/boton-atras/boton-atras.component";
import { FooterComponent } from "../components/footer/footer.component";

@Component({
  selector: 'app-miembros',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BarraSuperiorComponent,
    BotonAtrasComponent,
    FooterComponent
],
  templateUrl: './miembros.component.html',
  styleUrl: './miembros.component.css',
})
export class MiembrosComponent {
  // =====================
  // Variables de estado
  // =====================
  busqueda: string = '';
  todosSeleccionados: boolean = false;

  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  usuariosSeleccionados: any[] = [];

  miembros: any[] = [];
  grupoActual: any = null;
  gruposUsuarios: any[] = [];


  //falgs
  guardandoMiembros: boolean = false;

  // =====================
  // Constructor e inyección de servicios
  // =====================
  constructor(
    private toastr: ToastrService,
    private usuarioService: UsuarioService,
    private grupoUsuarioService: GrupoUsuarioService,
    private miembroService: MiembroService,
    private location: Location,
  ) {}

  // =====================
  // Inicialización de datos
  // =====================
  ngOnInit(): void {
    forkJoin({
      grupos: this.cargarGruposUsuarios(),
      usuarios: this.cargarUsuarios(),
      miembros: this.cargarMiembros(),
    }).subscribe({
      next: ({ grupos, usuarios, miembros }) => {
        this.gruposUsuarios = grupos;
        this.usuarios = usuarios;
        this.miembros = miembros || [];

        this.usuarios.forEach((usuario) => {
          if (usuario?.id_usuario) {
            usuario.seleccionado = this.miembros.some(
              (miembro) => miembro.usuario?.id_usuario === usuario.id_usuario
            );
          }
        });

        this.usuariosSeleccionados = this.usuarios.filter(u => u.seleccionado);
        this.filtrarUsuarios();
        this.cambiarGrupo(null);
      },
      error: (err) => {
        console.error("Error en la carga de datos:", err);
        this.toastr.error("Error al cargar los datos", "Error");
      },
    });
  }

  // =====================
  // Métodos de carga de datos
  // =====================
  cargarUsuarios(): Observable<any[]> {
    const query = `tipo=votante&estado=1`;
    const relations = [`grupoUsuario`, `usuarioReemplazo`];

    return this.usuarioService.getAllDataBy(query, relations).pipe(
      tap((usuarios) => {
        this.usuarios = usuarios;
        this.usuariosFiltrados = [...usuarios];
        this.usuarios.forEach((usuario) => {
          usuario.seleccionado = this.miembros.some(
            (miembro) => miembro.usuario?.id_usuario === usuario.id_usuario
          );
        });
        this.usuariosSeleccionados = this.usuarios.filter(u => u.seleccionado);
      })
    );
  }

  cargarMiembros(): Observable<any[]> {
    const query = '';
    const relations = ['usuario'];
    return this.miembroService.getAllDataBy(query, relations);
  }

  cargarGruposUsuarios(): Observable<any[]> {
    return this.grupoUsuarioService.getAllData();
  }

  // =====================
  // Métodos de filtro y grupo
  // =====================
  filtrarUsuarios() {
    this.usuariosFiltrados = this.usuarios.filter(
      (usuario) =>
        (!this.grupoActual ||
          usuario.grupoUsuario.id_grupo_usuario === this.grupoActual.id_grupo_usuario) &&
        (usuario.nombre!.toLowerCase().includes(this.busqueda.toLowerCase()) ||
          usuario.cedula!.includes(this.busqueda))
    );
  }

  cambiarGrupo(grupo: any) {
    this.grupoActual = grupo;
    this.filtrarUsuarios();
  }

  // =====================
  // Manejo de selección de usuarios
  // =====================
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

  // =====================
  // Guardar lista de miembros
  // =====================
  guardarMiembros() {
  if (this.usuariosSeleccionados.length === 0) {
    this.toastr.warning('Debes seleccionar al menos un miembro.', 'Aviso');
    return;
  }

  this.guardandoMiembros = true;

  const eliminarObservables = this.miembros.map((miembro) =>
    this.miembroService.deleteData(miembro.id_miembro!).toPromise()
  );

  Promise.all(eliminarObservables)
    .then(() => {
      this.toastr.info('Miembros anteriores eliminados', 'Proceso');

      const agregarObservables = this.usuariosSeleccionados.map((usuario) =>
        this.miembroService.saveData({
          usuario: { id_usuario: usuario.id_usuario },
          estado: true,
        }).toPromise()
      );

      return Promise.all(agregarObservables);
    })
    .then(() => {
      this.toastr.success('Lista de miembros actualizada correctamente', 'Éxito');
      this.cargarMiembros(); // Refrescar lista
    })
    .catch((error) => {
      this.toastr.error('Error al actualizar los miembros', 'Error');
      console.error(error);
    })
    .finally(() => {
      this.guardandoMiembros = false;
    });
}


  // =====================
  // Navegación
  // =====================
  goBack() {
    this.location.back();
  }
}
