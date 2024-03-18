import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BarraSuperiorComponent } from '../barra-superior/barra-superior.component';
import { UsuarioService } from '../services/usuario.service';
import { IUsuario } from '../interfaces/IUsuario';
import { GrupoUsuarioService } from '../services/grupoUsuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PuntoUsuarioService } from '../services/puntoUsuario.service';
import { IPuntoUsuario } from '../interfaces/IPuntoUsuario';
import { catchError, concatMap, forkJoin, map, of, tap } from 'rxjs';
import { IPunto } from '../interfaces/IPunto';
import { PuntoService } from '../services/punto.service';

@Component({
  selector: 'app-votantes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BarraSuperiorComponent,
  ],
  templateUrl: './votantes.component.html',
  styleUrl: './votantes.component.css',
})
export class VotantesComponent implements OnInit {
  punto: any | undefined;
  puntoId: number | undefined;
  puntosUsuarios: any[] = [];

  busqueda: string = '';

  usuarios: any[] = []; // Reemplaza con tu tipo de dato
  usuariosFiltrados: any[] = [];
  usuariosSeleccionados: any[] = [];

  grupoActual: any = null;
  gruposUsuarios: any[] = []; // Reemplaza con tu tipo de dato

  constructor(
    private usuarioService: UsuarioService,
    private grupoUsuarioService: GrupoUsuarioService,
    private puntoUsuarioService: PuntoUsuarioService,
    private puntoService: PuntoService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.puntoId = parseInt(this.route.snapshot.paramMap.get('id')!);
    this.cargarGruposUsuarios();

    // Establecer la pestaña "Todos" por defecto
    this.cambiarGrupo(null);

    // Cargar usuarios y luego filtrar al inicio
    this.cargarUsuarios();

    this.cargarPuntosUsuarios();

    this.cargarPunto(this.puntoId);
  }

  cargarPunto(id:number){
    const query = `id_punto=${id}`;
    const relaions = [`sesion`];
    this.puntoService.getDataBy(query,relaions).subscribe((data) =>{
      this.punto = data;
    });
  }

  cargarPuntosUsuarios() {
    const query = `punto.id_punto=${this.puntoId}`;
    const relatios = [`punto`, `usuario`];
    return this.puntoUsuarioService.getAllDataBy(query, relatios).pipe(
      map((data: any) => {
        this.puntosUsuarios = data;
      })
    );
  }

  cargarGruposUsuarios() {
    this.grupoUsuarioService.getAllData().subscribe((data: any) => {
      this.gruposUsuarios = data;
    });
  }

  cargarUsuarios() {
    const query = `tipo=votante&estado=1`;
    const relations = [`grupoUsuario`, `usuarioReemplazo`];

    this.usuarioService
      .getAllDataBy(query, relations)
      .subscribe((data: any) => {
        this.usuarios = data;
        this.usuariosFiltrados = [...this.usuarios];

        // Reiniciar la lista de usuarios seleccionados
        this.usuariosSeleccionados = [];

        // Obtener puntosUsuarios antes de iterar sobre los usuarios
        this.cargarPuntosUsuarios().subscribe(() => {
          // Iterar sobre los usuarios y marcar como seleccionados los que tienen estado = true en puntosUsuarios
          this.usuarios.forEach((usuario) => {
            const puntoUsuario = this.puntosUsuarios.find(
              (puntoUsu) =>
                puntoUsu.usuario.id_usuario === usuario.id_usuario /*&&
                puntoUsu.estado === true*/
            );
            if (puntoUsuario) {
              usuario.seleccionado = true;
              this.usuariosSeleccionados.push(usuario);
            }
          });

          this.filtrarUsuarios();
        });
      });
  }

  cambiarGrupo(grupo: any) {
    this.grupoActual = grupo;
    this.filtrarUsuarios();
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
      this.usuariosSeleccionados.push(usuario);
    } else {
      // Si se deselecciona un usuario, remuévelo de la lista de usuarios seleccionados
      const index = this.usuariosSeleccionados.findIndex(
        (u) => u.id_usuario === usuario.id_usuario
      );
      if (index !== -1) {
        this.usuariosSeleccionados.splice(index, 1);
      }
    }
  }

  async confirmarSeleccion() {
    const puntoUsuariosData: any[] = [];
  
    // Filtrar usuarios seleccionados que no existen en puntosUsuarios (nuevos usuarios a agregar)
    const nuevosUsuarios = this.usuariosSeleccionados.filter(
      (usuario) => !this.puntosUsuarios.some(puntoUsu => puntoUsu.usuario.id_usuario === usuario.id_usuario)
    );
  
    // Agregar nuevos usuarios a puntoUsuariosData
    nuevosUsuarios.forEach((usuario: IUsuario) => {
      puntoUsuariosData.push({
        punto: { id_punto: this.puntoId },
        usuario: { id_usuario: usuario.id_usuario }
      });
    });
  
    // Filtrar puntosUsuarios que no existen en usuariosSeleccionados (usuarios deseleccionados)
    const usuariosDeseleccionados = this.puntosUsuarios.filter(
      (puntoUsu) => !this.usuariosSeleccionados.some(usuario => puntoUsu.usuario.id_usuario === usuario.id_usuario)
    );
  
    // Eliminar puntosUsuarios de la base de datos
    usuariosDeseleccionados.forEach((puntoUsu: any) => {
      this.puntoUsuarioService.deleteData(puntoUsu.id_punto_usuario).subscribe(
        () => {
          console.log('PuntoUsuario eliminado correctamente:');
        },
        (error) => {
          console.error('Error al eliminar PuntoUsuario:', error);
        }
      );
    });
  
    // Agregar lógica para marcar como seleccionados o deseleccionados los usuarios existentes según sea necesario
  
    try {
      // Lógica para agregar o actualizar los nuevos usuarios en la base de datos
      this.puntoUsuarioService.saveManyData(puntoUsuariosData).subscribe(
        (response) => {
          console.log('Operación completada correctamente', response);
        },
        (error) => {
          console.error('Error al realizar la operación:', error);
        }
      );
    } catch (error) {
      console.error('Error al realizar la operación:', error);
    }

    this.location.back();

  }
  

  goBack() {
    this.location.back();
  }
}
