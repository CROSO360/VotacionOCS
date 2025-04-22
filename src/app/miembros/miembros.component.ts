import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { BarraSuperiorComponent } from '../barra-superior/barra-superior.component';
import { ToastrService } from 'ngx-toastr';
import { UsuarioService } from '../services/usuario.service';
import { GrupoUsuarioService } from '../services/grupoUsuario.service';
import { MiembroService } from '../services/miembro.service';
import { forkJoin, Observable, tap } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-miembros',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BarraSuperiorComponent,
  ],
  templateUrl: './miembros.component.html',
  styleUrl: './miembros.component.css',
})
export class MiembrosComponent {
  busqueda: string = '';

  todosSeleccionados: boolean = false;

  usuarios: any[] = []; // Reemplaza con tu tipo de dato
  usuariosFiltrados: any[] = [];
  usuariosSeleccionados: any[] = [];

  miembros: any[] = []; // Reemplaza con tu tipo de dato

  grupoActual: any = null;
  gruposUsuarios: any[] = []; // Reemplaza con tu tipo de dato

  constructor(
    private toastr: ToastrService,
    private usuarioService: UsuarioService,
    private grupoUsuarioService: GrupoUsuarioService,
    private miembroService: MiembroService,
    private location: Location,
  ) {}

  ngOnInit(): void {
    forkJoin({
      grupos: this.cargarGruposUsuarios(),
      usuarios: this.cargarUsuarios(),
      miembros: this.cargarMiembros(),
    }).subscribe({
      next: ({ grupos, usuarios, miembros }) => {
        this.gruposUsuarios = grupos;
        this.usuarios = usuarios;
        this.miembros = miembros || []; // Asegurar que no sea undefined
  
        // 🚀 Marcar usuarios que ya son miembros
        this.usuarios.forEach((usuario) => {
          if (usuario?.id_usuario) {
            usuario.seleccionado = this.miembros.some(
              (miembro) => miembro.usuario?.id_usuario === usuario.id_usuario
            );
          }
        });
  
        // 🚀 Inicializar lista de seleccionados después de marcar
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
  

  cargarUsuarios(): Observable<any[]> {
    const query = `tipo=votante&estado=1`;
    const relations = [`grupoUsuario`, `usuarioReemplazo`];

    return this.usuarioService.getAllDataBy(query, relations).pipe(
      tap((usuarios) => {
        this.usuarios = usuarios;
        this.usuariosFiltrados = [...usuarios];

        // 🚀 Marcamos aquí mismo los seleccionados antes de que termine la llamada
        this.usuarios.forEach((usuario) => {
          usuario.seleccionado = this.miembros.some(
            (miembro) => miembro.usuario?.id_usuario === usuario.id_usuario
          );
        });

        this.usuariosSeleccionados = this.usuarios.filter(
          (u) => u.seleccionado
        );
      })
    );
  }

  cargarMiembros(): Observable<any[]> {
    const query = ''; // Si necesitas filtrar por estado o algún otro criterio, agrégalo aquí
    const relations = ['usuario']; // Importante: aseguramos que se cargue el usuario asociado al miembro
  
    return this.miembroService.getAllDataBy(query, relations);
  }
  

  cargarGruposUsuarios(): Observable<any[]> {
    return this.grupoUsuarioService.getAllData();
  }

  filtrarUsuarios() {
    // Lógica para filtrar los usuarios según el grupo y la búsqueda
    this.usuariosFiltrados = this.usuarios.filter(
      (usuario) =>
        (!this.grupoActual ||
          usuario.grupoUsuario.id_grupo_usuario ===
            this.grupoActual.id_grupo_usuario) &&
        (usuario.nombre!.toLowerCase().includes(this.busqueda.toLowerCase()) ||
          usuario.cedula!.includes(this.busqueda))
    );
  }

  actualizarSeleccion(usuario: any) {
    if (usuario.seleccionado) {
      // Si se selecciona un usuario, agrégalo a la lista de usuarios seleccionados
      if (
        !this.usuariosSeleccionados.some(
          (u) => u.id_usuario === usuario.id_usuario
        )
      ) {
        this.usuariosSeleccionados.push(usuario);
      }
    } else {
      // Si se deselecciona un usuario, remuévelo de la lista de usuarios seleccionados
      this.usuariosSeleccionados = this.usuariosSeleccionados.filter(
        (u) => u.id_usuario !== usuario.id_usuario
      );
    }
  }

  guardarMiembros() {
    // 1️⃣ Eliminar los miembros actuales uno por uno
    const eliminarObservables = this.miembros.map((miembro) =>
      this.miembroService.deleteData(miembro.id_miembro!).toPromise()
    );

    Promise.all(eliminarObservables)
      .then(() => {
        this.toastr.info('Miembros anteriores eliminados', 'Proceso');

        // 2️⃣ Guardar los nuevos miembros uno por uno
        const agregarObservables = this.usuariosSeleccionados.map((usuario) =>
          this.miembroService
            .saveData({
              usuario: { id_usuario: usuario.id_usuario },
              estado: true,
            })
            .toPromise()
        );

        Promise.all(agregarObservables).then(() => {
          this.toastr.success(
            'Lista de miembros actualizada correctamente',
            'Éxito'
          );
          this.cargarMiembros(); // Recargar la lista después de actualizar
        });
      })
      .catch((error) => {
        this.toastr.error('Error al actualizar los miembros', 'Error');
        console.error(error);
      });
  }

  cambiarGrupo(grupo: any) {
    this.grupoActual = grupo;
    this.filtrarUsuarios();
  }

  toggleSeleccionarTodosUsuarios() {
    this.usuariosFiltrados.forEach((usuario) => {
      usuario.seleccionado = this.todosSeleccionados;
      this.actualizarSeleccion(usuario);
    });
  }

  goBack() {
    this.location.back();
  }
}
