import { CommonModule, Location } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BarraSuperiorComponent } from '../components/barra-superior/barra-superior.component';
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
import { FooterComponent } from "../components/footer/footer.component";

@Component({
  selector: 'app-votantes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BarraSuperiorComponent,
    FooterComponent
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
    try {
      // Obtener todos los puntos seleccionados, incluyendo el punto actual
      const puntosAActualizar = [this.puntoId!, ...this.puntosSeleccionados.map(p => p.id_punto)];
  
      // Recorrer cada punto a actualizar
      for (const puntoId of puntosAActualizar) {
        // 1. Eliminar todos los puntoUsuario de ese punto antes de aplicar la nueva selección
        const puntoUsuarios = await this.getPuntoUsuarios(puntoId);
  
        // Si hay usuarios para eliminar, procesarlos
        if (puntoUsuarios.length > 0) {
          await this.eliminarPuntoUsuarios(puntoUsuarios);
        }
  
        // 2. Agregar los nuevos puntoUsuario si la selección no está vacía
        if (this.usuariosSeleccionados.length > 0) {
          const puntoUsuariosData:any = this.usuariosSeleccionados.map((usuario: IUsuario) => ({
            punto: { id_punto: puntoId },
            usuario: { id_usuario: usuario.id_usuario }
          }));
          await this.guardarNuevosPuntoUsuarios(puntoUsuariosData);
        }
      }
  
      // Mostrar éxito
      this.toastr.success('Selección guardada correctamente en todos los puntos', 'Éxito');
      
      // 3. Regresar de página solo si todos los procesos se completan con éxito
      this.location.back();
  
    } catch (error) {
      // Mostrar error si ocurre algún problema
      this.toastr.error('Hubo un error al guardar la selección', 'Error');
      console.error(error);
    }
  }
  
  // Método para obtener todos los puntoUsuario de un punto dado
  getPuntoUsuarios(puntoId: number): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.puntoUsuarioService.getAllDataBy(`punto.id_punto=${puntoId}`, ['punto', 'usuario']).subscribe({
        next: (puntoUsuarios) => resolve(puntoUsuarios),
        error: (error) => reject(error)
      });
    });
  }
  
  // Método para eliminar todos los puntoUsuario de un punto dado
  eliminarPuntoUsuarios(puntoUsuarios: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const deleteRequests = puntoUsuarios.map((puntoUsu: any) =>
        this.puntoUsuarioService.deleteData(puntoUsu.id_punto_usuario)
      );
  
      forkJoin(deleteRequests).subscribe({
        next: () => resolve(),
        error: (error) => reject(error)
      });
    });
  }
  
  // Método para guardar nuevos puntoUsuario para un punto dado
  guardarNuevosPuntoUsuarios(puntoUsuariosData: IPuntoUsuario[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.puntoUsuarioService.saveManyData(puntoUsuariosData).subscribe({
        next: () => resolve(),
        error: (error) => reject(error)
      });
    });
  }
  
  
  
  
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const clickedInside = (event.target as HTMLElement).closest('.custom-select');
    if (!clickedInside) {
      this.showOptions = false; // Cierra el select si se hace clic fuera
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
  
  removeSelectedOption(option: IPunto, event: MouseEvent) {
    event.stopPropagation(); // Prevenir el cierre del select
    const index = this.puntosSeleccionados.indexOf(option);
    if (index !== -1) {
      this.puntosSeleccionados.splice(index, 1);
    }
    this.updateSelectAllStatus();
  }

  updateSelectAllStatus() {
    this.allPuntosSelected =
      this.puntosSeleccionados.length === this.puntos.length;
  }

  toggleDropdown(event: MouseEvent) {
    event.stopPropagation(); // Prevenir que el dropdown se cierre en clicks internos
    this.showOptions = !this.showOptions;
  }

  goBack() {
    this.location.back();
  }
}
