import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  Renderer2,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BarraSuperiorComponent } from '../barra-superior/barra-superior.component';
import { Location } from '@angular/common';
import { PuntoService } from '../services/punto.service';
import { SesionService } from '../services/sesion.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IPunto } from '../interfaces/IPunto';
import { ISesion } from '../interfaces/ISesion';
import { PuntoUsuarioService } from '../services/puntoUsuario.service';
import { IPuntoUsuario } from '../interfaces/IPuntoUsuario';
import { WebSocketService } from '../services/websocket.service';
import { forkJoin, Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { UsuarioService } from '../services/usuario.service';
import { IUsuario } from '../interfaces/IUsuario';
import { AsistenciaService } from '../services/asistencia.service';
import { IAsistencia } from '../interfaces/IAsistencia';
import { MiembroService } from '../services/miembro.service';
import { ResolucionService } from '../services/resolucion.service';
import { IResolucion } from '../interfaces/IResolucion';
import { jwtDecode } from 'jwt-decode';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-votacion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BarraSuperiorComponent,
  ],
  templateUrl: './votacion.component.html',
  styleUrl: './votacion.component.css',
})
export class VotacionComponent implements OnInit {
  constructor(
    private puntoService: PuntoService,
    private sesionService: SesionService,
    private puntoUsuarioService: PuntoUsuarioService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private webSocketService: WebSocketService,
    private render2: Renderer2,
    private toastr: ToastrService,
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef,
    private eRef: ElementRef,
    private asistenciaService: AsistenciaService,
    private miembroService: MiembroService,
    private resolucionService: ResolucionService,
    private cookieService: CookieService
  ) {}

  payload: any = jwtDecode(this.cookieService.get('token'));

  usuario: IUsuario | undefined;

  squareElement!: HTMLElement;

  puntos: IPunto[] = [];

  idSesion: number | null = 0;

  sesion: ISesion | undefined;

  puntoUsuarios: any[] = [];

  puntosSeleccionados: IPunto[] = [];

  allPuntosSelected = false;

  showOptions = false;

  puntoSeleccionado: IPunto | undefined;

  resolucionActual: IResolucion | undefined;

  puntoUsuarioActual: IPuntoUsuario | undefined;

  usuarioActual: IUsuario | undefined;

  activeDropdown: number | null = null;

  nomina: IAsistencia[] = [];

  miembrosOCS: IUsuario[] = [];

  pasoModalResultados: number = 1;

  resultadoManualSeleccionado: 'aprobada' | 'rechazada' | 'pendiente' =
    'aprobada';

  modoCreacionResolucion = false;

  votoManualForm = new FormGroup({
    opcion: new FormControl('', Validators.required),
    razonado: new FormControl(''),
  });

  resolucionForm = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    descripcion: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    this.idSesion = parseInt(this.route.snapshot.paramMap.get('id')!);

    const querySesion = `id_sesion=${this.idSesion}`;
    const queryPuntos = `sesion.id_sesion=${this.idSesion}`;
    const queryUsuario = `codigo=${this.payload.codigo}`;
    const queryAsistencia = `sesion.id_sesion=${this.idSesion}`;
    const relationsAsistencia = ['usuario'];
    const relationsPuntos = ['sesion'];
    const relationsMiembros = ['usuario'];

    forkJoin({
      sesion: this.sesionService.getDataBy(querySesion),
      puntos: this.puntoService.getAllDataBy(queryPuntos, relationsPuntos),
      usuario: this.usuarioService.getDataBy(queryUsuario),
      asistencia: this.asistenciaService.getAllDataBy(
        queryAsistencia,
        relationsAsistencia
      ),
      miembrosOCS: this.miembroService.getAllDataBy('', relationsMiembros),
    }).subscribe({
      next: ({ sesion, puntos, usuario, asistencia, miembrosOCS }) => {
        this.sesion = sesion;
        this.puntos = puntos;
        this.usuario = usuario;
        this.nomina = asistencia;
        this.miembrosOCS = miembrosOCS.map((m: any) => m.usuario);

        if (this.puntos.length > 0) {
          this.puntoSeleccionado = this.puntos[0];
          this.onPuntoChange(); // ✅ Cargar datos iniciales del primer punto
        }
      },
      error: () => {
        this.toastr.error('Error al cargar los datos iniciales', 'Error');
      },
    });

    this.webSocketService.onChange().subscribe((sape: any) => {
      this.actualizarPuntoUsuario(sape.puntoUsuarioId);
    });
  }

  getUsuario() {
    const query = `codigo=${this.payload.codigo}`;
    this.usuarioService.getDataBy(query).subscribe((data) => {
      this.usuario = data;
      console.log(this.usuario);
    });
  }

  getPuntos() {
    const query = `sesion.id_sesion=${this.idSesion}`;
    const relations = ['sesion'];

    this.puntoService.getAllDataBy(query, relations).subscribe((data) => {
      this.puntos = data;

      if (this.puntos.length > 0) {
        this.puntoSeleccionado = this.puntos[0];
        this.onPuntoChange(); // ⚡ Cargamos los nuevos puntoUsuarios del primer punto
      }
    });
  }

  getSesion() {
    const query = `id_sesion=${this.idSesion}`;
    this.sesionService.getDataBy(query).subscribe((data) => {
      this.sesion = data;
    });
  }

  async getPuntoUsuarios(puntoId: number) {
    const query = `punto.id_punto=${puntoId}`;
    const relations = [
      `usuario`,
      `usuario.usuarioReemplazo`,
      `usuario.grupoUsuario`,
    ];
    await this.puntoUsuarioService
      .getAllDataBy(query, relations)
      .subscribe((data) => {
        this.puntoUsuarios = data.sort((a, b) => {
          return a.estado === b.estado ? 0 : a.estado ? -1 : 1;
        });
      });
    console.log('puntosUsuarios cargados');
  }

  getAsistencia() {
    const query = `sesion.id_sesion=${this.idSesion}`;
    const relations = ['usuario'];
    this.asistenciaService.getAllDataBy(query, relations).subscribe((data) => {
      this.nomina = data;
    });
  }

  getResolucion(id: number) {
    const query = `id_punto=${id}`;
    this.resolucionService.getDataBy(query).subscribe((data) => {
      this.resolucionActual = data;
      if (data) {
        this.resolucionForm.patchValue({
          nombre: data.nombre,
          descripcion: data.descripcion,
        });
      } else {
        this.resolucionForm.reset();
      }
    });
  }

  onPuntoChange() {
    if (this.puntoSeleccionado) {
      this.getPuntoUsuarios(this.puntoSeleccionado.id_punto);
      this.getResolucion(this.puntoSeleccionado.id_punto);
    }
  }

  cambiarEstadoPunto(punto: IPunto) {
    const nuevoEstado = !punto.estado;
    const puntoData = {
      id_punto: punto.id_punto,
      estado: nuevoEstado,
    };

    this.puntoService.saveData(puntoData).subscribe((r) => {
      const puntoIndex = this.puntos.findIndex(
        (p) => p.id_punto === punto.id_punto
      );
      if (puntoIndex !== -1) {
        this.puntos[puntoIndex].estado = nuevoEstado;
      }
    });
  }

  cargarMiembrosOCS() {
    const relations = ['usuario'];
    this.miembroService.getAllDataBy('', relations).subscribe((data) => {
      this.miembrosOCS = data.map((m) => m.usuario);
    });
  }

  // Determina si el usuario pertenece al OCS (según tu lógica de miembros)
  esMiembroOCS(idUsuario: number): boolean {
    return this.miembrosOCS.some((u) => u.id_usuario === idUsuario);
  }

  // Guarda los cambios realizados en el tipo de asistencia
  confirmarAsistencia() {
    const actualizaciones = this.nomina.map((asistencia) => {
      return {
        id_asistencia: asistencia.id_asistencia,
        tipo_asistencia: asistencia.tipo_asistencia,
      };
    });

    this.asistenciaService.saveManyData(actualizaciones).subscribe({
      next: () => {
        this.toastr.success('Asistencia actualizada correctamente', 'Éxito');
      },
      error: () => {
        this.toastr.error('Error al actualizar la asistencia', 'Error');
      },
    });
  }

  generarVotos() {
    const eliminar = this.puntoUsuarioService.eliminarPuntosUsuario(
      this.idSesion
    );
    const generar = this.puntoUsuarioService.generarPuntosUsuario(
      this.idSesion
    );

    eliminar.subscribe({
      next: () => {
        generar.subscribe({
          next: () => {
            this.toastr.success('Votos generados correctamente', 'Éxito');

            location.reload();

            /*this.getPuntos(); // ⚡ Recarga todos los puntos
            this.getSesion();*/ // ⚡ Actualiza sesión
          },
          error: () => {
            this.toastr.error('Error al generar los votos', 'Error');
          },
        });
      },
      error: () => {
        this.toastr.error('Error al eliminar votos anteriores', 'Error');
      },
    });
  }

  getClassForPuntoUsuario(puntoUsuario: IPuntoUsuario) {
    return {
      'sin-votar': puntoUsuario.opcion === null,
      afavor: puntoUsuario.opcion === 'afavor',
      encontra: puntoUsuario.opcion === 'encontra',
      abstencion: puntoUsuario.opcion === 'abstencion',
      'disabled-box': puntoUsuario.estado === false,
    };
  }

  getNombreUsuario(puntoUsuario: IPuntoUsuario): string {
    return puntoUsuario.es_principal
      ? puntoUsuario.usuario.nombre
      : puntoUsuario.usuario.usuarioReemplazo?.nombre || 'Reemplazo';
  }

  iniciarSesion(sesion: ISesion) {
    const sesionData = {
      id_sesion: sesion.id_sesion,
      fase: 'activa',
    };

    this.sesionService.saveData(sesionData).subscribe(
      () => {
        window.location.reload();
      },
      (error) => {
        console.error('Error al iniciar la sesión:', error);
      }
    );
  }

  finalizarSesion(sesion: ISesion) {
    /*const observables = this.puntos.map((punto: IPunto) => {
      return this.puntoService.registerResultados({ idPunto: punto.id_punto });
    });*/
        const sesionData = {
          id_sesion: sesion.id_sesion,
          fase: 'finalizada',
          fecha_fin: new Date(),
          estado: false,
        };

        this.sesionService.saveData(sesionData).subscribe(
          () => {
            console.log('Sesión finalizada correctamente');
            const idString = sesion.id_sesion!.toString();
            this.router.navigate(['/resultados', idString]);
          },
          (error) => {
            console.error('Error al finalizar la sesión:', error);
          }
        );
  }

  async actualizarPuntoUsuario(puntoUsuarioId: number) {
    const query = `id_punto_usuario=${puntoUsuarioId}`;
    const timestamp = new Date().getTime();

    // Obtiene los datos actualizados del puntoUsuario
    await this.puntoUsuarioService
      .getDataBy(`${query}?timestamp=${timestamp}`)
      .subscribe((puntoUsuarioActual) => {
        // Actualiza los datos del puntoUsuario en la base de datos (si es necesario)
        this.puntoUsuarioService.saveData(puntoUsuarioActual).subscribe(() => {
          this.puntoUsuarioActual = puntoUsuarioActual;

          // Actualiza la visualización del puntoUsuario
          this.actualizarVisualizacionPuntoUsuario(puntoUsuarioActual);

          // Vuelve a cargar los puntoUsuarios del punto seleccionado
          //this.getPuntoUsuarios(this.puntoSeleccionado!);
        });
      });
  }

  actualizarVisualizacionPuntoUsuario(puntoUsuario: IPuntoUsuario) {
    const squareElement = document.querySelector(
      `.square[id="${puntoUsuario.id_punto_usuario}"]`
    );

    if (squareElement) {
      // Limpia clases anteriores
      squareElement.classList.remove(
        'sin-votar',
        'afavor',
        'encontra',
        'abstencion',
        'disabled-box'
      );

      // Aplica clase de voto
      if (puntoUsuario.opcion === null) {
        squareElement.classList.add('sin-votar');
      } else if (puntoUsuario.opcion === 'afavor') {
        squareElement.classList.add('afavor');
      } else if (puntoUsuario.opcion === 'encontra') {
        squareElement.classList.add('encontra');
      } else if (puntoUsuario.opcion === 'abstencion') {
        squareElement.classList.add('abstencion');
      }

      // Aplica desactivación si estado === false
      if (puntoUsuario.estado === false) {
        squareElement.classList.add('disabled-box');
      }

      // Actualiza clase del botón razonado
      const buttonElement = squareElement.querySelector('.btn');
      if (buttonElement) {
        buttonElement.classList.remove('noRazonado', 'razonado');
        buttonElement.classList.add(
          puntoUsuario.es_razonado ? 'razonado' : 'noRazonado'
        );
      }
    }
  }

  usuarioVotoManual(idUsuario: number) {
    console.log('usuarioVotoManual', this.puntoSeleccionado.id_punto);
    if (!idUsuario) return;

    const query = `id_usuario=${idUsuario}`;
    this.usuarioActual = undefined;

    this.usuarioService.getDataBy(query).subscribe({
      next: (data) => {
        this.usuarioActual = data;
      },
      error: (error) => {
        console.error('Error al cargar usuario para voto manual', error);
        this.toastr.error('Error al cargar usuario', 'Error');
      },
    });
  }

  votoManual() {
    if (this.puntoSeleccionado === undefined) {
      console.log('No hay punto seleccionado');
      return;
    } else {
      let votoData = {
        id_usuario: this.usuarioActual?.id_usuario,
        codigo: this.sesion?.codigo,
        punto: this.puntoSeleccionado.id_punto,
        opcion: this.votoManualForm.value.opcion,
        es_razonado: this.votoManualForm.value.razonado,
        votante: this.usuario.id_usuario,
      };

      this.puntoUsuarioService.saveVote(votoData).subscribe(() => {
        console.log(`solicitud realizada`);
        this.resetForm();
        this.toastr.success('Voto manual registrado correctamente', 'Éxito');
        this.cerrarModal('votoManualModal', this.votoManualForm);
      });
    }
  }

  resetForm() {
    this.votoManualForm.patchValue({
      opcion: '',
      razonado: '',
    }); // Reiniciar el formulario
    this.usuarioActual = undefined;
    this.puntosSeleccionados = [];
    this.allPuntosSelected = false;
  }

  toggleOption(option: IPunto) {
    const index = this.puntosSeleccionados.indexOf(option);
    if (index !== -1) {
      this.puntosSeleccionados.splice(index, 1);
    } else {
      this.puntosSeleccionados.push(option);
    }
    this.allPuntosSelected =
      this.puntosSeleccionados.length === this.puntos.length;
  }

  removeSelectedOption(option: IPunto, event: MouseEvent) {
    event.stopPropagation();
    const index = this.puntosSeleccionados.indexOf(option);
    if (index !== -1) {
      this.puntosSeleccionados.splice(index, 1);
    }
    this.updateSelectAllStatus();
  }

  toggleSelectAllPuntos() {
    if (this.allPuntosSelected) {
      this.puntosSeleccionados = [];
    } else {
      this.puntosSeleccionados = [...this.puntos];
    }
    this.allPuntosSelected = !this.allPuntosSelected;
  }

  updateSelectAllStatus() {
    this.allPuntosSelected =
      this.puntosSeleccionados.length === this.puntos.length;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const clickedInside = (event.target as HTMLElement).closest(
      '.custom-select'
    );
    if (!clickedInside) {
      this.showOptions = false; // Cierra el select si se hace clic fuera
    }
  }

  toggleDropdown(event: MouseEvent) {
    event.stopPropagation(); // Prevenir que el dropdown se cierre en clicks internos
    this.showOptions = !this.showOptions;
  }

  cerrarModal(modalId: string, form?: FormGroup) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
      modalElement.setAttribute('aria-hidden', 'true');
      modalElement.removeAttribute('aria-modal');
      modalElement.removeAttribute('role');
    }

    // Limpieza de estilos y clases
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';

    // Elimina cualquier backdrop sobrante
    const backdrops = document.getElementsByClassName('modal-backdrop');
    while (backdrops[0]) {
      backdrops[0].parentNode?.removeChild(backdrops[0]);
    }

    // Restablecer el formulario
    this.resetForm();
    form.reset();
  }

  // Alterna la visibilidad del dropdown asociado a un puntoUsuario específico
  toggleDropdownxd(id_punto_usuario: number, event: Event) {
    event.stopPropagation();
    this.activeDropdown =
      this.activeDropdown === id_punto_usuario ? null : id_punto_usuario;
  }

  // Maneja la acción de click en los elementos del dropdown
  onItemClick(action: string, id_punto_usuario: number) {
    console.log(`Selected ${action} from Dropdown ${id_punto_usuario}`);
    this.activeDropdown = null; // Cierra el dropdown después de seleccionar
  }

  // Cierra el dropdown si se hace clic fuera de él
  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event) {
    this.activeDropdown = null;
  }

  cambiarPrincipalAlternoNomina(idUsuario: number) {
  if (!this.idSesion || !idUsuario) return;

  this.puntoUsuarioService
    .cambiarPrincipalAlterno(this.idSesion, idUsuario)
    .subscribe({
      next: () => {
        this.toastr.success('Cambio realizado correctamente', 'Éxito');

        // Recarga forzada de votos con referencia nueva
        this.puntoUsuarioService
          .getAllDataBy(
            `punto.id_punto=${this.puntoSeleccionado.id_punto}`,
            ['usuario', 'usuario.usuarioReemplazo', 'usuario.grupoUsuario']
          )
          .subscribe((data) => {
            this.puntoUsuarios = [...data.sort((a, b) => a.estado === b.estado ? 0 : a.estado ? -1 : 1)];
            this.cdr.detectChanges(); // 🔁 Reforzar actualización visual
          });
      },
      error: (err) => {
        console.error('Error HTTP:', err);
        this.toastr.error('Error al cambiar el estado', 'Error');
      },
    });
}




  reemplazo(puntoUsuario: any) {
    if (!puntoUsuario?.usuario?.usuarioReemplazo) {
      this.toastr.error(
        `${puntoUsuario.usuario.nombre} no tiene asignado un reemplazo`,
        'Error'
      );
      return;
    }

    const data = {
      id_punto_usuario: puntoUsuario.id_punto_usuario,
      es_principal: !puntoUsuario.es_principal,
    };

    this.puntoUsuarioService.saveData(data).subscribe({
      next: () => {
        puntoUsuario.es_principal = !puntoUsuario.es_principal;
        this.toastr.success(
          puntoUsuario.es_principal
            ? `Cambio a principal: ${puntoUsuario.usuario.nombre}`
            : `Cambio a reemplazo: ${puntoUsuario.usuario.usuarioReemplazo.nombre}`,
          'Éxito'
        );
      },
      error: () => {
        this.toastr.error('No se pudo realizar el cambio', 'Error');
      },
    });

    this.activeDropdown = null; // Cerrar el dropdown
  }

  irAPasoManual() {
    this.pasoModalResultados = 2;
  }

  volverAlPasoInicial() {
    this.pasoModalResultados = 1;
  }

  irAPasoConfirmacion() {
    this.pasoModalResultados = 3;
  }

  volverAlPasoManual() {
    this.pasoModalResultados = 2;
  }

  calcularResultadoAutomatico() {
    if (!this.puntoSeleccionado) return;

    this.puntoService
      .calcularResultados(this.puntoSeleccionado.id_punto)
      .subscribe({
        next: () => {
          this.toastr.success('Resultado calculado correctamente', 'Éxito');
          this.getPuntos(); // Actualiza los valores del punto actual
          this.getResolucion(this.puntoSeleccionado.id_punto);
        },
        error: () => {
          this.toastr.error('Error al calcular el resultado', 'Error');
        },
      });
  }

  calcularResultadoManual() {
    if (!this.puntoSeleccionado || !this.usuario?.id_usuario) return;

    const data = {
      id_punto: this.puntoSeleccionado.id_punto,
      id_usuario: this.usuario.id_usuario,
      resultado: this.resultadoManualSeleccionado, // 'aprobada' | 'rechazada' | 'pendiente'
    };

    this.puntoService.calcularResultadosManual(data).subscribe({
      next: () => {
        this.toastr.success('Resultado manual guardado correctamente', 'Éxito');
        this.getPuntos();
        this.getResolucion(this.puntoSeleccionado.id_punto);
        this.pasoModalResultados = 1;
      },
      error: () => {
        this.toastr.error('Error al guardar resultado manual', 'Error');
        console.log(this.resultadoManualSeleccionado);
        console.log(this.usuario?.id_usuario);
        console.log(this.puntoSeleccionado?.id_punto);
      },
    });
  }

  crearResolucion() {
    const resolucionData: IResolucion = {
      punto: { id_punto: this.puntoSeleccionado.id_punto },
      nombre: this.resolucionForm.value.nombre,
      descripcion: this.resolucionForm.value.descripcion,
      fecha: new Date(),
    };

    this.resolucionService.saveData(resolucionData).subscribe({
      next: () => {
        this.toastr.success('Resolución creada con éxito');
        this.getResolucion(this.puntoSeleccionado.id_punto);
        this.modoCreacionResolucion = false; // ✅ Oculta el formulario
        //window.location.reload();
      },
      error: () => {
        this.toastr.error('Error al crear la resolución');
      },
    });
  }

  editarResolucion() {
    if (!this.puntoSeleccionado || !this.resolucionActual) return;

    const updateResolucionData: IResolucion = {
      punto: { id_punto: this.puntoSeleccionado.id_punto },
      nombre: this.resolucionForm.value.nombre!,
      descripcion: this.resolucionForm.value.descripcion!,
    };

    this.resolucionService.updateData(updateResolucionData).subscribe({
      next: () => {
        this.toastr.success('Resolución actualizada', 'Éxito');
        this.getResolucion(this.puntoSeleccionado!.id_punto);
      },
      error: () => {
        this.toastr.error('Error al actualizar la resolución', 'Error');
      },
    });
  }

  formularioResolucionModificado(): boolean {
    return (
      this.resolucionForm.value.nombre !== this.resolucionActual?.nombre ||
      this.resolucionForm.value.descripcion !==
        this.resolucionActual?.descripcion
    );
  }

  goBack() {
    this.location.back();
  }
}
