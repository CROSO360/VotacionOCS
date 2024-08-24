import { CommonModule, Location } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BarraSuperiorComponent } from '../barra-superior/barra-superior.component';
import { UsuarioService } from '../services/usuario.service';
import { IUsuario } from '../interfaces/IUsuario';
import { GrupoUsuarioService } from '../services/grupoUsuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PuntoUsuarioService } from '../services/puntoUsuario.service';
import { IPuntoUsuario } from '../interfaces/IPuntoUsuario';
import { catchError, concatMap, forkJoin, map, Observable, of, tap } from 'rxjs';
import { IPunto } from '../interfaces/IPunto';
import { PuntoService } from '../services/punto.service';
import { ToastrService } from 'ngx-toastr';

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
  sesionId: number | undefined;

  busqueda: string = '';

  todosSeleccionados: boolean = false;
  allPuntosSelected = false;

  usuarios: any[] = []; // Reemplaza con tu tipo de dato
  usuariosFiltrados: any[] = [];
  usuariosSeleccionados: any[] = [];

  grupoActual: any = null;
  gruposUsuarios: any[] = []; // Reemplaza con tu tipo de dato

  puntosSeleccionados: any[] = [];
  showOptions = false;
  puntos: any[] = [];

  constructor(
    private toastr: ToastrService,
    private usuarioService: UsuarioService,
    private grupoUsuarioService: GrupoUsuarioService,
    private puntoUsuarioService: PuntoUsuarioService,
    private puntoService: PuntoService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.puntoId = parseInt(this.route.snapshot.paramMap.get('idPunto')!, 10);
    this.sesionId = parseInt(this.route.snapshot.paramMap.get('idSesion')!, 10);

    forkJoin({
      punto: this.cargarPunto(this.puntoId),
      grupos: this.cargarGruposUsuarios(),
      usuarios: this.cargarUsuarios(),
      puntosUsuarios: this.cargarPuntosUsuarios(),
      puntos : this.cargarPuntos(this.sesionId, this.puntoId),
    }).subscribe({
      next: ({ grupos, usuarios, puntosUsuarios, punto, puntos }) => {
        this.gruposUsuarios = grupos;
        this.puntosUsuarios = puntosUsuarios;
        this.punto = punto;
        this.puntos = puntos;
        console.log('Usuarios:', this.usuarios);
        console.log('Usuarios Seleccionados:', this.usuariosSeleccionados);
        console.log('Puntos Usuarios:', this.puntosUsuarios);
        console.log('Puntos:', this.puntos);
  
        this.filtrarUsuarios();
        this.cambiarGrupo(null);
      },
      error: (err) => {
        console.error('Error en la carga de datos:', err);
        this.toastr.error('Error al cargar los datos', 'Error');
      }
    });
  }
  
  
  

  cargarPunto(id: number): Observable<any> {
    const query = `id_punto=${id}`;
    const relations = [`sesion`];
    const resultado = this.puntoService.getDataBy(query, relations);
    return resultado;
  }

  cargarPuntos(idSesion: number, idPuntoActual: number): Observable<any> {
    const query = `sesion.id_sesion=${idSesion}`;
    const relations = ['sesion'];
    return this.puntoService.getAllDataBy(query, relations).pipe(
      map((puntos: any[]) => puntos.filter(punto => punto.id_punto !== idPuntoActual))
    );
  }
  
  cargarPuntosUsuarios(): Observable<any[]> {
    const query = `punto.id_punto=${this.puntoId}`;
    const relations = [`punto`, `usuario`];
    return this.puntoUsuarioService.getAllDataBy(query, relations);
  }
  
  cargarGruposUsuarios(): Observable<any[]> {
    return this.grupoUsuarioService.getAllData();
  }
  
  cargarUsuarios(): Observable<any[]> {
    const query = `tipo=votante&estado=1`;
    const relations = [`grupoUsuario`, `usuarioReemplazo`];
  
    return this.usuarioService.getAllDataBy(query, relations).pipe(
      tap((usuarios: any[]) => {
        this.usuarios = usuarios;
        this.usuariosFiltrados = [...this.usuarios];
        
        // Reiniciar la lista de usuarios seleccionados
        this.usuariosSeleccionados = [];
  
        // Obtener puntosUsuarios antes de iterar sobre los usuarios
        this.cargarPuntosUsuarios().subscribe((puntosUsuarios: any[]) => {
          // Iterar sobre los usuarios y marcar como seleccionados los que tienen estado = true en puntosUsuarios
          this.usuarios.forEach((usuario) => {
            const puntoUsuario = puntosUsuarios.find(
              (puntoUsu) => puntoUsu.usuario.id_usuario === usuario.id_usuario
            );
            if (puntoUsuario) {
              usuario.seleccionado = true;
              this.usuariosSeleccionados.push(usuario);
            }
          });
  
          this.filtrarUsuarios();
        });
      })
    );
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
      if (!this.usuariosSeleccionados.some(u => u.id_usuario === usuario.id_usuario)) {
        this.usuariosSeleccionados.push(usuario);
      }
    } else {
      // Si se deselecciona un usuario, remuévelo de la lista de usuarios seleccionados
      this.usuariosSeleccionados = this.usuariosSeleccionados.filter(
        (u) => u.id_usuario !== usuario.id_usuario
      );
    }
  }
  

  async confirmarSeleccion() {
    const puntoUsuariosData: IPuntoUsuario[] = [];
  
    // Obtener todos los puntos seleccionados, incluyendo el punto actual
    const puntosAActualizar = [this.puntoId!, ...this.puntosSeleccionados.map(p => p.id_punto)];
  
    for (const puntoId of puntosAActualizar) {
      // Filtrar usuarios seleccionados que no existen en puntosUsuarios (nuevos usuarios a agregar)
      const nuevosUsuarios = this.usuariosSeleccionados.filter(
        (usuario) => !this.puntosUsuarios.some(puntoUsu => puntoUsu.usuario.id_usuario === usuario.id_usuario)
      );
  
      // Agregar nuevos usuarios a puntoUsuariosData
      nuevosUsuarios.forEach((usuario: IUsuario) => {
        puntoUsuariosData.push({
          punto: { id_punto: puntoId }, 
          usuario: { id_usuario: usuario.id_usuario }
        } as IPuntoUsuario);
      });
  
      // Eliminar todos los `puntoUsuario` de ese punto antes de aplicar la nueva selección
      this.puntoUsuarioService.getAllDataBy(`punto.id_punto=${puntoId}`, ['punto', 'usuario']).subscribe({
        next: (puntoUsuarios) => {
          puntoUsuarios.forEach((puntoUsu: any) => {
            this.puntoUsuarioService.deleteData(puntoUsu.id_punto_usuario).subscribe({
              next: () => {
                console.log(`PuntoUsuario del punto ${puntoId} eliminado correctamente`);
              },
              error: (error) => {
                console.error(`Error al eliminar PuntoUsuario del punto ${puntoId}:`, error);
                this.toastr.error(`Error al eliminar usuarios en el punto ${puntoId}`, 'Error');
              }
            });
          });
  
          // Después de eliminar los antiguos registros, agregamos los nuevos
          this.puntoUsuarioService.saveManyData(puntoUsuariosData).subscribe({
            next: (response) => {
              console.log(`Usuarios del punto ${puntoId} actualizados correctamente`, response);
              this.toastr.success(`Usuarios del punto ${puntoId} actualizados correctamente`, 'Éxito');
            },
            error: (error) => {
              console.error(`Error al actualizar usuarios del punto ${puntoId}:`, error);
              this.toastr.error(`Error al actualizar usuarios del punto ${puntoId}`, 'Error');
            }
          });
        },
        error: (error) => {
          console.error(`Error al obtener PuntoUsuarios del punto ${puntoId}:`, error);
          this.toastr.error(`Error al obtener datos del punto ${puntoId}`, 'Error');
        }
      });
    }
  
    this.location.back();
  }
  
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.custom-select');

    if (!clickedInside) {
      this.showOptions = false;
    }
  }

  ngOnDestroy() {
    // Elimina el HostListener cuando el componente se destruye.
  }
  
  toggleOption(option: IPunto) {
    const index = this.puntosSeleccionados.indexOf(option);
    if (index === -1) {
      this.puntosSeleccionados.push(option);
    } else {
      this.puntosSeleccionados.splice(index, 1);
    }

    // Actualizar el estado de selección de todos
    this.allPuntosSelected = this.puntosSeleccionados.length === this.puntos.length;
  }

  toggleSelectAllPuntos() {
    if (this.allPuntosSelected) {
      this.puntosSeleccionados = [];
    } else {
      this.puntosSeleccionados = [...this.puntos];
    }
    this.allPuntosSelected = !this.allPuntosSelected;
  }
  
  toggleSeleccionarTodosUsuarios() {
    this.usuariosFiltrados.forEach((usuario) => {
      usuario.seleccionado = this.todosSeleccionados;
      this.actualizarSeleccion(usuario);
    });
  }
  
  removeSelectedOption(option: IPunto) {
    const index = this.puntosSeleccionados.indexOf(option);
    if (index !== -1) {
      this.puntosSeleccionados.splice(index, 1);
    }
  }

  goBack() {
    this.location.back();
  }
}
