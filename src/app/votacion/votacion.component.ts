// =======================================
// IMPORTACIONES
// =======================================
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BarraSuperiorComponent } from '../components/barra-superior/barra-superior.component';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable, of, firstValueFrom } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

//servicios
import { PuntoService } from '../services/punto.service';
import { SesionService } from '../services/sesion.service';
import { PuntoUsuarioService } from '../services/puntoUsuario.service';
import { ResolucionService } from '../services/resolucion.service';
import { MiembroService } from '../services/miembro.service';
import { AsistenciaService } from '../services/asistencia.service';
import { UsuarioService } from '../services/usuario.service';
import { WebSocketService } from '../services/websocket.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';

import { Modal } from 'bootstrap'; // asegúrate que bootstrap está instalado

//interfaces
import { IPunto } from '../interfaces/IPunto';
import { ISesion } from '../interfaces/ISesion';
import { IPuntoUsuario } from '../interfaces/IPuntoUsuario';
import { IUsuario } from '../interfaces/IUsuario';
import { IAsistencia } from '../interfaces/IAsistencia';
import { IResolucion } from '../interfaces/IResolucion';
import { IGrupo } from '../interfaces/IGrupo';
import { GrupoService } from '../services/grupo.service';
import { BotonAtrasComponent } from '../components/boton-atras/boton-atras.component';
import { FooterComponent } from '../components/footer/footer.component';
import { data } from 'jquery';
import { ResultadoService } from '../services/resultado.service';
import { IResultado } from '../interfaces/IResultado';
import { PuntoSeleccionadoService } from '../services/punto-seleccionado.service';
import { IPuntoGrupo } from '../interfaces/IPuntoGrupo';

@Component({
  selector: 'app-votacion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BarraSuperiorComponent,
    BotonAtrasComponent,
    FooterComponent,
  ],
  templateUrl: './votacion.component.html',
  styleUrl: './votacion.component.css',
})
export class VotacionComponent implements OnInit {
  // =======================================
  // CONSTRUCTOR E INYECCIÓN DE DEPENDENCIAS
  // =======================================
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
    private resultadoService: ResultadoService,
    private cookieService: CookieService,
    private grupoService: GrupoService,
    private puntoSeleccionadoService: PuntoSeleccionadoService
  ) {}

  // =======================================
  // PROPIEDADES Y VARIABLES
  // =======================================

  payload: any = jwtDecode(this.cookieService.get('token'));

  usuario: IUsuario | undefined;

  squareElement!: HTMLElement;

  puntos: IPunto[] = [];

  idSesion: number | null = 0;

  sesion: ISesion | undefined;

  puntoUsuarios: any[] = [];

  votosHibridos: any[] = [];

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
  pasoModalResultadosGrupo: number = 1; // Pasos para el modal de grupos (separado)

  resultadoManualSeleccionado: 'aprobada' | 'rechazada' | 'pendiente' | null =
    'aprobada';

  modoCreacionResolucion = false;

  grupos: IGrupo[] = []; // Lista de grupos de la sesión

  pantallaGrupo: number = 1; // 1 = gestión, 2 = crear grupo

  votoManualModalRef: any;
  modalResultadosRef: Modal | null = null;
  modalResultadosGrupoRef: Modal | null = null;

  // Estado de los resúmenes
  resultadoPunto: IResultado | null = null;
  resumenBase: any | null;

  //filtros de nomina
  busquedaNomina: string = '';
  agrupadosPorGrupoNomina: any[] = [];
  asistenciasOriginales: IAsistencia[] = [];

  filtroAsistencia: 'todos' | 'presente' | 'ausente' = 'todos';

  // Agrupación y filtrado de votos híbridos
  agrupadosVotosHibridos: { grupo: string; usuarios: any[] }[] = [];
  busquedaVotoHibrido: string = '';
  filtroVotoHibrido:
    | 'todos'
    | 'afavor'
    | 'encontra'
    | 'abstencion'
    | 'sinvoto' = 'todos';

  //flags
  cambiandoEstadoPunto: boolean = false;
  cambiandoEstadoGrupo: boolean = false;
  estadoCargaGrupo: Map<number, boolean> = new Map();
  creandoGrupo: boolean = false;
  guardandoResolucion: boolean = false;
  estadoCambioRol: Map<number, boolean> = new Map();
  confirmandoAsistencia: boolean = false;
  solicitandoReconsideracion: boolean = false;
  guardandoResultadoAutomatico = false;
  guardandoResultadoManual: boolean = false;
  guardandoFinalizacion: boolean = false;
  iniciandoSesion: boolean = false;
  guardandoVotoManual = false;
  guardandoResultadoHibrido = false;
  cargandoReconsideracion: boolean = false;

  showCodigo = false;
  codigoCopiado = false;

  agrupadosPorGrupo: { grupo: string; usuarios: IPuntoUsuario[] }[] = [];

  presentesCount: number = 0;
  ausentesCount: number = 0;
  totalCount: number = 0;

  contadoresHibrido = {
    todos: 0,
    afavor: 0,
    encontra: 0,
    abstencion: 0,
    sinvoto: 0,
  };

  agrupadosPendientes: { grupo: string; usuarios: IPuntoUsuario[] }[] = [];
  puntoUsuariosPendientes: IPuntoUsuario[] = [];
  private puntoUsuariosPendientesIds = new Set<number>();
  modalResultadosBloqueado = false;
  aplicandoCambiosPendientes = false;
  hayCambiosPendientes = false;
  reabrirResultadosTrasVotoManual = false;

  // View-model para el template (tablas)
  uiResumen = {
    // Tabla 1
    minNominal: 0,
    minPonderado: 0,
    pFavor: 0,
    pContra: 0,
    pAbstencion: 0,
    estadoPonderado: '---',
    estadoNominal: '---',

    // Tabla 2
    nFavor: 0,
    nContra: 0,
    nAbstencion: 0,
    nAusentes: 0,
    nTotal: 0,
  };

  puntoGrupo: IPuntoGrupo = {
    id_punto_grupo: 12,
  }

  grupoSeleccionadoParaResolver: IGrupo | undefined;

  private norm = (v: any) =>
    (v ?? 'ausente').toString().trim().toLowerCase() as 'presente' | 'ausente';

  @ViewChild('nominaScroll') nominaScroll?: ElementRef<HTMLElement>;
  @ViewChild('hibridoScroll') hibridoScroll?: ElementRef<HTMLElement>;

  trackByGrupo = (_: number, g: { grupo: string }) => g.grupo;
  trackByAsistencia = (_: number, a: IAsistencia) => a.id_asistencia;
  trackByVoto = (_: number, v: any) => v.idUsuario;

  // =====================
  // Formularios reactivos
  // =====================
  votoManualForm = new FormGroup({
    opcion: new FormControl('', Validators.required),
    razonado: new FormControl(''),
  });

  resolucionForm = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    descripcion: new FormControl('', [Validators.required]),
  });

  grupoForm: FormGroup = new FormGroup({
    nombre: new FormControl(''),
    puntos: new FormControl([], Validators.required),
  });

  // =====================
  // Inicialización de datos
  // =====================
  ngOnInit(): void {
    this.idSesion = parseInt(this.route.snapshot.paramMap.get('id')!);

    const querySesion = `id_sesion=${this.idSesion}`;
    const queryPuntos = `sesion.id_sesion=${this.idSesion}`;
    const queryUsuario = `codigo=${this.payload.codigo}`;
    const queryAsistencia = `sesion.id_sesion=${this.idSesion}`;
    const queryGrupo = `sesion.id_sesion=${this.idSesion}`;
    const relationsAsistencia = ['usuario', 'usuario.grupoUsuario'];
    const relationsPuntos = ['sesion', 'puntoReconsiderado'];
    const relationsMiembros = ['usuario'];
    const relationsGrupos = ['puntoGrupos', 'puntoGrupos.punto'];

    forkJoin({
      sesion: this.sesionService.getDataBy(querySesion),
      puntos: this.puntoService.getAllDataBy(queryPuntos, relationsPuntos),
      usuario: this.usuarioService.getDataBy(queryUsuario),
      asistencia: this.asistenciaService.getAllDataBy(
        queryAsistencia,
        relationsAsistencia
      ),
      miembrosOCS: this.miembroService.getAllDataBy('', relationsMiembros),
      grupos: this.grupoService.getAllDataBy(queryGrupo, relationsGrupos),
    }).subscribe({
      next: ({ sesion, puntos, usuario, asistencia, miembrosOCS, grupos }) => {
        this.sesion = sesion;
        this.puntos = puntos.sort((a: any, b: any) => a.orden - b.orden);
        this.usuario = usuario;
        this.nomina = asistencia;
        this.asistenciasOriginales = asistencia; // ✅ Esta línea es la clave
        this.miembrosOCS = miembrosOCS.map((m: any) => m.usuario);
        this.grupos = grupos;

        // Agrupar después de asignar nomina
        this.agruparNominaPorGrupo();
        this.agruparYFiltrarVotosHibridos();
        this.filtrarAsistenciasNomina();

        if (this.puntos.length > 0) {
          const idGuardado = localStorage.getItem('puntoSeleccionadoId');
          const puntoRecuperado = this.puntos.find(
            (p) => p.id_punto.toString() === idGuardado
          );

          this.puntoSeleccionado = puntoRecuperado ?? this.puntos[0];
          // Actualizar el servicio al inicializar
          this.puntoSeleccionadoService.setPuntoSeleccionado(this.puntoSeleccionado);
          this.onPuntoChange();
        }
      },
      error: () => {
        this.toastr.error('Error al cargar los datos iniciales', 'Error');
      },
    });

    this.webSocketService.onChange().subscribe((sape: any) => {
      this.actualizarPuntoUsuario(sape.puntoUsuarioId);
    });

    const votoManualEl = document.getElementById('votoManualModal');
    if (votoManualEl) {
      this.votoManualModalRef = new Modal(votoManualEl);
    }

    const modalResultadosEl = document.getElementById('modalResultados');
    if (modalResultadosEl) {
      this.modalResultadosRef = new Modal(modalResultadosEl);
    }

    // Agregar listener para el modal de grupos para limpiar el estado del body cuando se cierra
    const modalResultadosGrupoEl = document.getElementById('modalResultadosGrupo');
    if (modalResultadosGrupoEl) {
      modalResultadosGrupoEl.addEventListener('hidden.bs.modal', () => {
        // Limpiar el estado del body cuando el modal se cierra
        setTimeout(() => {
          const modalesAbiertos = document.querySelectorAll('.modal.show');
          if (modalesAbiertos.length === 0) {
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            const backdrops = document.getElementsByClassName('modal-backdrop');
            while (backdrops[0]) {
              backdrops[0].parentNode?.removeChild(backdrops[0]);
            }
          }
        }, 100);
      });
    }
  }

  // =====================
  // Métodos de carga de datos
  // =====================
  getUsuario() {
    const query = `codigo=${this.payload.codigo}`;
    this.usuarioService.getDataBy(query).subscribe((data) => {
      this.usuario = data;
      console.log(this.usuario);
    });
  }

  getPuntos(): void {
    const query = `sesion.id_sesion=${this.idSesion}`;
    const relations = ['sesion', 'puntoReconsiderado'];

    this.puntoService.getAllDataBy(query, relations).subscribe((data) => {
      this.puntos = data.sort((a: any, b: any) => a.orden - b.orden);

      const idGuardado = localStorage.getItem('puntoSeleccionadoId');
      const puntoRecuperado = this.puntos.find(
        (p) => p.id_punto.toString() === idGuardado
      );

      this.puntoSeleccionado = puntoRecuperado ?? this.puntos[0];
      // Actualizar el servicio al cargar puntos
      this.puntoSeleccionadoService.setPuntoSeleccionado(this.puntoSeleccionado);
      this.onPuntoChange(); // Se encarga de cargar puntoUsuarios y resolución
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
        // Ordenar primero por estado (activos arriba)
        this.puntoUsuarios = data.sort((a, b) => {
          return a.estado === b.estado ? 0 : a.estado ? -1 : 1;
        });

        // Agrupar por grupoUsuario
        this.agrupadosPorGrupo = this.agruparPorGrupo(this.puntoUsuarios);
        this.actualizarPendientesLocales();
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

  cargarMiembrosOCS() {
    const relations = ['usuario'];
    this.miembroService.getAllDataBy('', relations).subscribe((data) => {
      this.miembrosOCS = data.map((m) => m.usuario);
    });
  }

  getGruposDeSesion() {
    const query = `sesion.id_sesion=${this.idSesion}`;
    const relations = ['puntoGrupos', 'puntoGrupos.punto'];

    this.grupoService.getAllDataBy(query, relations).subscribe({
      next: (data) => {
        this.grupos = data;
      },
      error: () => {
        this.toastr.error('Error al cargar los grupos', 'Error');
      },
    });
  }

  toggleCodigo(): void {
    this.showCodigo = !this.showCodigo;
  }

  copiarCodigo(): void {
    if (this.sesion?.codigo) {
      navigator.clipboard.writeText(this.sesion.codigo).then(() => {
        this.codigoCopiado = true;
        this.toastr.success('Código copiado al portapapeles');
        
        // Resetear el estado después de 2 segundos
        setTimeout(() => {
          this.codigoCopiado = false;
        }, 2000);
      }).catch(() => {
        this.toastr.error('Error al copiar el código');
      });
    }
  }

  // =====================
  // Métodos de administración de puntos
  // =====================
  onPuntoChange(): void {
    if (this.puntoSeleccionado?.id_punto) {
      localStorage.setItem(
        'puntoSeleccionadoId',
        this.puntoSeleccionado.id_punto.toString()
      );

      // Actualizar el servicio compartido para notificar al navbar
      this.puntoSeleccionadoService.setPuntoSeleccionado(this.puntoSeleccionado);

      this.getPuntoUsuarios(this.puntoSeleccionado.id_punto);
      this.getResolucion(this.puntoSeleccionado.id_punto);
      this.cargarResmenesDelPunto(this.puntoSeleccionado.id_punto);
    }
  }

  /**
   * Verifica si un punto pertenece a algún grupo
   */
  puntoPerteneceAGrupo(puntoId: number): boolean {
    if (!puntoId || !this.grupos || this.grupos.length === 0) {
      return false;
    }
    
    return this.grupos.some(grupo => 
      grupo.puntoGrupos?.some(pg => pg.punto?.id_punto === puntoId)
    );
  }

  cambiarEstadoPunto(punto: IPunto) {
    // Verificar si el punto pertenece a un grupo
    if (this.puntoPerteneceAGrupo(punto.id_punto)) {
      this.toastr.warning(
        'Este punto pertenece a un grupo. Debe habilitar/deshabilitar desde la gestión de grupos.',
        'Acción no permitida'
      );
      return;
    }

    this.cambiandoEstadoPunto = true;

    const nuevoEstado = !punto.estado;
    const puntoData = {
      id_punto: punto.id_punto,
      estado: nuevoEstado,
    };

    

    this.puntoService.saveData(puntoData).subscribe({
      next: () => {
        const puntoIndex = this.puntos.findIndex(
          (p) => p.id_punto === punto.id_punto
        );
        if (puntoIndex !== -1) {
          this.puntos[puntoIndex].estado = nuevoEstado;
        }
        this.toastr.success(
          `Punto ${nuevoEstado ? 'habilitado' : 'deshabilitado'}`,
          'Estado actualizado'
        );
        this.cambiandoEstadoPunto = false;
      },
      error: () => {
        this.cambiandoEstadoPunto = false;
        this.toastr.error('Error al actualizar el estado del punto', 'Error');
        // Opcional: mostrar notificación de error
      },
    });
  }

  cambiarEstadoGrupo(grupo: IGrupo) {
    if (!grupo.id_grupo) return;

    this.estadoCargaGrupo.set(grupo.id_grupo, true);

    const grupoData = {
      id_grupo: grupo.id_grupo,
      estado: !grupo.estado,
    };

    this.grupoService.saveData(grupoData).subscribe({
      next: () => {
        grupo.estado = !grupo.estado;
        this.estadoCargaGrupo.set(grupo.id_grupo!, false);
        this.toastr.success(
          `Grupo ${grupo.nombre} ${
            grupo.estado ? 'habilitado' : 'deshabilitado'
          }`,
          'Estado actualizado'
        );
      },
      error: () => {
        this.estadoCargaGrupo.set(grupo.id_grupo!, false);
        this.toastr.error('Error al actualizar el grupo', 'Error');
      },
    });
  }

  editarGrupo(grupo: IGrupo) {
    if (!grupo?.id_grupo) return;
    const nombreActual = grupo.nombre || '';
    const nuevoNombre = prompt('Editar nombre del grupo:', nombreActual);
    if (nuevoNombre == null) return; // cancelado
    const nombre = nuevoNombre.trim();
    if (!nombre || nombre === nombreActual) return;

    const data: IGrupo = { id_grupo: grupo.id_grupo, nombre } as IGrupo;
    this.grupoService.saveData(data).subscribe({
      next: () => {
        grupo.nombre = nombre;
        this.toastr.success('Grupo actualizado', 'Éxito');
      },
      error: (e) => {
        this.toastr.error('No se pudo actualizar el grupo', `error: ${e?.message ?? 'desconocido'}`);
      },
    });
  }

  eliminarGrupo(grupo: IGrupo) {
    if (!grupo?.id_grupo) return;
    const ok = confirm(`¿Eliminar el grupo "${grupo.nombre}"? Esta acción no se puede deshacer.`);
    if (!ok) return;

    this.grupoService.deleteData(grupo.id_grupo).subscribe({
      next: () => {
        this.toastr.success('Grupo eliminado', 'Éxito');
        this.getGruposDeSesion();
      },
      error: (e) => {
        this.toastr.error('No se pudo eliminar el grupo', `error: ${e?.error.message ?? 'desconocido'}`);
      },
    });
  }

  crearGrupoDesdeFormulario() {
    const puntosSeleccionados = this.grupoForm.value.puntos;
    if (!puntosSeleccionados || puntosSeleccionados.length < 2) {
      this.toastr.warning('Debe seleccionar al menos 2 puntos');
      return;
    }

    this.creandoGrupo = true;

    const grupoData = {
      idSesion: this.idSesion!,
      nombre: this.grupoForm.value.nombre || `Grupo ${Date.now()}`,
      puntos: puntosSeleccionados.map((p: IPunto) => p.id_punto),
    };

    this.grupoService.agruparPuntos(grupoData).subscribe({
      next: (nuevoGrupo) => {
        this.toastr.success('Grupo creado correctamente');
        this.getGruposDeSesion();
        this.pantallaGrupo = 1;
        this.grupoForm.reset();
        this.creandoGrupo = false;
      },
      error: (e) => {
        this.toastr.error('Error al crear el grupo', `error: ${e?.message ?? 'desconocido'}`);
        this.creandoGrupo = false;
      },
    });
  }

  onSeleccionPuntoGrupo(punto: IPunto, event: Event) {
    const seleccionados: IPunto[] = this.grupoForm.value.puntos || [];
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      this.grupoForm.patchValue({ puntos: [...seleccionados, punto] });
    } else {
      this.grupoForm.patchValue({
        puntos: seleccionados.filter((p) => p.id_punto !== punto.id_punto),
      });
    }
  }

  solicitarReconsideracion(): void {
    if (!this.puntoSeleccionado) return;

    this.solicitandoReconsideracion = true;

    this.puntoService
      .reconsideracion(this.puntoSeleccionado.id_punto)
      .subscribe({
        next: () => {
          this.toastr.success(
            'Se ha solicitado la reconsideración correctamente.',
            'Reconsideración creada'
          );
          this.getPuntos(); // recargar puntos actualizados
          this.solicitandoReconsideracion = false;
        },
        error: (error) => {
          console.error(error);
          this.toastr.error(
            error.error.message,
            'No se pudo solicitar la reconsideración.'
          );
          this.solicitandoReconsideracion = false;
        },
      });
  }

  aprobarReconsideracion(): void {
    if (!this.puntoSeleccionado) return;

    this.cargandoReconsideracion = true;

    this.puntoService
      .aprobarReconsideracion(this.puntoSeleccionado.id_punto)
      .subscribe({
        next: () => {
          this.toastr.success(
            'Se ha creado una nueva votación basada en la reconsideración.',
            'Punto repetido creado'
          );
          this.getPuntos(); // recargar puntos actualizados
        },
        error: (error) => {
          console.error(error);
          this.toastr.error(
            error.error.message,
            'No se pudo crear el punto reconsiderado.'
          );
          this.cargandoReconsideracion = false;
        },
        complete: () => {
          this.cargandoReconsideracion = false;
        },
      });
  }

  mostrarBotonSolicitarReconsideracion(punto: IPunto): boolean {
    return (
      punto.tipo === 'normal' &&
      punto.resultado !== null &&
      punto.resultado !== 'empate' &&
      this.sesion?.fase === 'activa' &&
      !this.existeReconsideracionPara(punto.id_punto)
    );
  }

  mostrarBotonAprobarReconsideracion(punto: IPunto): boolean {
    return (
      punto.tipo === 'reconsideracion' &&
      punto.resultado === 'aprobada' &&
      this.sesion?.fase === 'activa' &&
      !this.existeRepetidoPara(punto.puntoReconsiderado?.id_punto)
    );
  }

  existeReconsideracionPara(idPuntoOriginal: number): boolean {
    return this.puntos.some(
      (p) =>
        p.tipo === 'reconsideracion' &&
        p.puntoReconsiderado?.id_punto === idPuntoOriginal
    );
  }

  existeRepetidoPara(idPuntoOriginal: number): boolean {
    const existe = this.puntos.some(
      (p) =>
        p.tipo === 'repetido' &&
        p.puntoReconsiderado?.id_punto === idPuntoOriginal &&
        p.id_punto !== this.puntoSeleccionado?.id_punto
    );
    console.log('→ existeRepetidoPara(', idPuntoOriginal, ') =', existe);
    return existe;
  }

  // =====================
  // Métodos de administración de sesion
  // =====================

  iniciarSesion(sesion: ISesion) {
    if (!sesion?.id_sesion) return;

    this.iniciandoSesion = true;

    const sesionData = {
      id_sesion: sesion.id_sesion,
      fase: 'activa',
    };

    this.sesionService.saveData(sesionData).subscribe({
      next: () => {
        window.location.reload(); // No se limpia el flag porque el reload reemplaza el contexto
      },
      error: (error) => {
        console.error('Error al iniciar la sesión:', error);
        this.toastr.error('Error al iniciar la sesión', 'Error');
        this.iniciandoSesion = false;
      },
    });
  }

  finalizarSesion(sesion: ISesion) {
    if (!sesion?.id_sesion) return;

    this.guardandoFinalizacion = true;

    const sesionData = {
      id_sesion: sesion.id_sesion,
      fase: 'finalizada',
      fecha_fin: new Date(),
      estado: false,
    };

    this.sesionService.saveData(sesionData).subscribe({
      next: () => {
        console.log('Sesión finalizada correctamente');
        const idString = sesion.id_sesion!.toString();
        this.router.navigate(['/resultados', idString]);
        this.guardandoFinalizacion = false;
      },
      error: (error) => {
        console.error('Error al finalizar la sesión:', error);
        this.toastr.error('Error al finalizar la sesión', 'Error');
        this.guardandoFinalizacion = false;
      },
    });
  }

  // =====================
  // Métodos de administración de nomina
  // =====================

  // Determina si el usuario pertenece al OCS (según tu lógica de miembros)
  esMiembroOCS(idUsuario: number): boolean {
    return this.miembrosOCS.some((u) => u.id_usuario === idUsuario);
  }

  // Guarda los cambios realizados en el tipo de asistencia
  confirmarAsistencia(opciones?: {
    onSuccess?: () => void;
    onError?: () => void;
    showToast?: boolean;
  }): void {
    if (!this.idSesion) {
      this.toastr.warning('Sesión no válida.');
      return;
    }

    this.confirmandoAsistencia = true;

    const actualizaciones = (this.asistenciasOriginales ?? []).map((a) => ({
      id_asistencia: a.id_asistencia,
      tipo_asistencia: (a.tipo_asistencia ?? 'ausente')
        .toString()
        .trim()
        .toLowerCase(),
    }));

    this.asistenciaService
      .guardarAsistencias(this.idSesion, actualizaciones)
      .subscribe({
        next: () => {
          if (opciones?.showToast !== false) {
            this.toastr.success(
              'Asistencia actualizada y votos sincronizados',
              'Éxito'
            );
          }
          this.confirmandoAsistencia = false;
          this.getPuntoUsuarios(this.puntoSeleccionado.id_punto);
          this.cargarResmenesDelPunto(this.puntoSeleccionado.id_punto);

          this.asistenciaService
            .getAllDataBy(`sesion.id_sesion=${this.idSesion}`, [
              'usuario',
              'usuario.grupoUsuario',
            ])
            .subscribe((data) => {
              this.nomina = data;
              this.asistenciasOriginales = data;
              this.agruparNominaPorGrupo();
              this.actualizarContadores();
              this.filtrarAsistenciasNomina();
              opciones?.onSuccess?.();
            });
        },
        error: () => {
          this.toastr.error('Error al actualizar la asistencia', 'Error');
          this.confirmandoAsistencia = false;
          opciones?.onError?.();
        },
      });
  }

  cambiarPrincipalAlternoNomina(idUsuario: number) {
    if (!this.idSesion || !idUsuario) return;

    this.estadoCambioRol.set(idUsuario, true);

    this.puntoUsuarioService
      .cambiarPrincipalAlterno(this.idSesion, idUsuario)
      .subscribe({
        next: () => {
          this.toastr.success('Cambio realizado correctamente', 'Éxito');

          this.puntoUsuarioService
            .getAllDataBy(`punto.id_punto=${this.puntoSeleccionado.id_punto}`, [
              'usuario',
              'usuario.usuarioReemplazo',
              'usuario.grupoUsuario',
            ])
            .subscribe((data) => {
              this.puntoUsuarios = [
                ...data.sort((a, b) =>
                  a.estado === b.estado ? 0 : a.estado ? -1 : 1
                ),
              ];

              this.agrupadosPorGrupo = this.agruparPorGrupo(this.puntoUsuarios);
              this.estadoCambioRol.set(idUsuario, false);
              this.cdr.detectChanges();
            });
        },
        error: (err) => {
          console.error('Error HTTP:', err);
          this.estadoCambioRol.set(idUsuario, false);

          const mensaje =
            err?.error?.message || 'Error al cambiar el estado del usuario.';

          this.toastr.error(mensaje, 'Error');
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

  agruparPorGrupo(puntoUsuarios: IPuntoUsuario[]) {
    const grupos: { [grupo: string]: IPuntoUsuario[] } = {};

    for (const pu of puntoUsuarios) {
      const grupo = pu.usuario?.grupoUsuario?.nombre || 'Sin grupo';

      if (!grupos[grupo]) {
        grupos[grupo] = [];
      }

      grupos[grupo].push(pu);
    }

    // Convertir en array ordenado por nombre del grupo y por nombre del usuario dentro de cada grupo
    return Object.entries(grupos)
      .sort(([a], [b]) => a.localeCompare(b)) // ordena grupos
      .map(([grupo, usuarios]) => ({
        grupo,
        usuarios: usuarios.sort((a, b) =>
          (a.usuario?.nombre ?? '').localeCompare(b.usuario?.nombre ?? '')
        ),
      }));
  }

  agruparNominaPorGrupo(): void {
    const grupos: { [grupo: string]: IAsistencia[] } = {};

    for (const asistencia of this.nomina) {
      const grupo = asistencia.usuario?.grupoUsuario?.nombre || 'Sin grupo';

      if (!grupos[grupo]) {
        grupos[grupo] = [];
      }

      grupos[grupo].push(asistencia);
    }

    this.agrupadosPorGrupoNomina = Object.entries(grupos)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([grupo, asistencias]) => ({
        grupo,
        asistencias: asistencias.sort((a, b) =>
          a.usuario.nombre.localeCompare(b.usuario.nombre)
        ),
      }));
  }

  filtrarAsistenciasNomina(): void {
    this.withNominaScroll(() => {
      const texto = this.busquedaNomina.toLowerCase().trim();
      let filtradas = this.asistenciasOriginales;

      if (texto) {
        filtradas = filtradas.filter((a) => {
          const nombre = a.usuario?.nombre?.toLowerCase() || '';
          const cedula = a.usuario?.cedula?.toLowerCase() || '';
          return nombre.includes(texto) || cedula.includes(texto);
        });
      }

      if (this.filtroAsistencia !== 'todos') {
        filtradas = filtradas.filter(
          (a) => this.norm(a.tipo_asistencia) === this.filtroAsistencia
        );
      }

      this.nomina = filtradas;
      this.agruparNominaPorGrupo();
      this.actualizarContadores();
    });
  }

  actualizarContadores(): void {
    const base = this.asistenciasOriginales ?? [];
    this.totalCount = base.length;
    this.presentesCount = base.filter(
      (a) => this.norm(a.tipo_asistencia) === 'presente'
    ).length;
    this.ausentesCount = base.filter(
      (a) => this.norm(a.tipo_asistencia) === 'ausente'
    ).length;
  }

  onCambioTipo(asistencia: IAsistencia, nuevo: 'presente' | 'ausente' | null) {
    this.withNominaScroll(() => {
      asistencia.tipo_asistencia = nuevo;
      const i = this.asistenciasOriginales.findIndex(
        (a) => a.id_asistencia === asistencia.id_asistencia
      );
      if (i !== -1) this.asistenciasOriginales[i].tipo_asistencia = nuevo;

      this.actualizarContadores();
      this.filtrarAsistenciasNomina();
    });
  }

  isPresente(a: IAsistencia): boolean {
    const v = (a?.tipo_asistencia ?? 'ausente') + '';
    return v.trim().toLowerCase() === 'presente';
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

    // Ordenar los grupos y los nombres dentro de cada grupo
    return Array.from(gruposMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([grupo, asistencias]) => ({
        grupo,
        asistencias: asistencias.sort(
          (a, b) =>
            a.usuario?.nombre?.localeCompare(b.usuario?.nombre || '') || 0
        ),
      }));
  }

  cambiarFiltro(valor: 'todos' | 'presente' | 'ausente') {
    this.withNominaScroll(() => {
      this.filtroAsistencia = valor;
      this.filtrarAsistenciasNomina();
    });
  }

  resetFiltros(): void {
    this.withNominaScroll(() => {
      this.busquedaNomina = '';
      this.filtroAsistencia = 'todos';
      this.filtrarAsistenciasNomina();
    });
  }

  // =====================
  // Métodos de administración de votos (PuntoUsuario)
  // =====================

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

  abrirVotoManual(idUsuario: number) {
    if (this.guardandoVotoManual) return; // Evitar múltiples llamadas
    
    this.usuarioActual = undefined;
    const query = `id_usuario=${idUsuario}`;

    this.usuarioService.getDataBy(query).subscribe({
      next: (data) => {
        this.usuarioActual = data;
        
        // Usar setTimeout más largo para dar tiempo a que Angular procese los cambios
        setTimeout(() => {
          try {
            const resultadosEl = document.getElementById('modalResultados');
            const resultadosVisible = resultadosEl?.classList.contains('show') ?? false;
            const pantallaCompletaEl = document.getElementById('modalVotacionPantallaCompleta');
            const pantallaCompletaVisible = pantallaCompletaEl?.classList.contains('show') ?? false;

            const mostrarVotoManual = () => {
              const modalElement = document.getElementById('votoManualModal');
              if (!modalElement) {
                console.error('No se encontró el elemento del modal de voto manual');
                return;
              }

              // Configurar z-index alto para que aparezca sobre otros modales
              (modalElement as HTMLElement).style.zIndex = '1090';
              
              // Asegurar que el backdrop también tenga z-index correcto
              setTimeout(() => {
                const backdrops = document.querySelectorAll('.modal-backdrop');
                if (backdrops.length) {
                  const backdrop = backdrops[backdrops.length - 1] as HTMLElement;
                  if (backdrop) {
                    backdrop.style.zIndex = '1085';
                  }
                }
              }, 10);
              
              if (!this.votoManualModalRef) {
                this.votoManualModalRef = new Modal(modalElement, {
                  backdrop: true,
                  keyboard: true,
                  focus: false // Evitar problemas con el focus de Bootstrap
                });
              }
              
              try {
                this.votoManualModalRef.show();
              } catch (e) {
                console.error('Error al mostrar modal de voto manual:', e);
                // Intentar mostrar el modal de forma manual como fallback
                modalElement.classList.add('show');
                modalElement.style.display = 'block';
                modalElement.setAttribute('aria-hidden', 'false');
                document.body.classList.add('modal-open');
              }
            };

            // Si hay modal de resultados abierto, cerrarlo temporalmente
            if (resultadosVisible && this.modalResultadosRef) {
              this.reabrirResultadosTrasVotoManual = true;
              this.modalResultadosRef.hide();
              setTimeout(mostrarVotoManual, 200);
            } 
            // Si hay modal de pantalla completa, no cerrarlo, solo mostrar el voto manual encima
            else if (pantallaCompletaVisible) {
              this.reabrirResultadosTrasVotoManual = false;
              // Dar un poco más de tiempo cuando viene de pantalla completa
              setTimeout(mostrarVotoManual, 100);
            } 
            // Ningún modal especial abierto, mostrar directamente
            else {
              this.reabrirResultadosTrasVotoManual = false;
              mostrarVotoManual();
            }
          } catch (e) {
            console.error('Error al abrir modal de voto manual:', e);
            this.toastr.error('Error al abrir el formulario de voto manual', 'Error');
            this.guardandoVotoManual = false;
          }
        }, 100);
      },
      error: (error) => {
        console.error('Error al cargar usuario para voto manual', error);
        this.toastr.error('Error al cargar usuario', 'Error');
        this.guardandoVotoManual = false;
      },
    });
  }

  //abre el modal de voto manual
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

  // Registra el voto manual del usuario seleccionado
  votoManual(idUsuario: number) {
    if (!this.puntoSeleccionado || this.guardandoVotoManual) return;

    const votoData = {
      idUsuario: idUsuario,
      codigo: this.sesion?.codigo,
      punto: this.puntoSeleccionado.id_punto,
      opcion: this.votoManualForm.value.opcion,
      es_razonado: this.votoManualForm.value.razonado,
      votante: this.usuario.id_usuario,
    };

    this.guardandoVotoManual = true;

    // Detectar si viene desde pantalla completa
    const pantallaCompletaEl = document.getElementById('modalVotacionPantallaCompleta');
    const desdePantallaCompleta = pantallaCompletaEl?.classList.contains('show') ?? false;

    this.puntoUsuarioService.saveVote(votoData).subscribe({
      next: () => {
        this.toastr.success('Voto manual registrado correctamente', 'Éxito');
        
        // Cerrar modal primero para evitar conflictos
        this.cerrarModal('votoManualModal', this.votoManualForm, this.votoManualModalRef);
        
        // Si viene desde pantalla completa, actualizar solo los datos locales sin recargar todo
        if (desdePantallaCompleta) {
          // Actualización ligera sin recargar todo para evitar congelamiento
          setTimeout(() => {
            const puntoUsuarioActualizado = this.puntoUsuarios.find(
              (pu: IPuntoUsuario) => pu.usuario?.id_usuario === idUsuario
            );
            if (puntoUsuarioActualizado?.id_punto_usuario) {
              const actualizado: IPuntoUsuario = {
                ...puntoUsuarioActualizado,
                opcion: this.votoManualForm.value.opcion as string,
                estado: true,
              };
              this.sincronizarPuntoUsuarioLocal(actualizado);
              this.actualizarPendientesLocales();
            }
          }, 100);
        } else {
          // Para casos normales, hacer la actualización completa
          const puntoUsuarioActualizado = this.puntoUsuarios.find(
            (pu: IPuntoUsuario) => pu.usuario?.id_usuario === idUsuario
          );
          if (puntoUsuarioActualizado?.id_punto_usuario) {
            const actualizado: IPuntoUsuario = {
              ...puntoUsuarioActualizado,
              opcion: this.votoManualForm.value.opcion as string,
              estado: true,
            };
            this.sincronizarPuntoUsuarioLocal(actualizado);
            this.actualizarPendientesLocales();
          }
        }
        
        // Si había un modal de resultados, reabrirlo (solo si no viene de pantalla completa)
        if (!desdePantallaCompleta && this.reabrirResultadosTrasVotoManual && this.modalResultadosRef) {
          setTimeout(() => {
            try {
              this.modalResultadosRef?.show();
              this.reabrirResultadosTrasVotoManual = false;
            } catch (e) {
              console.warn('Error al reabrir modal de resultados:', e);
            }
          }, 200);
        }
        
        this.guardandoVotoManual = false;
      },
      error: (err) => {
        // Siempre resetear el flag primero
        this.guardandoVotoManual = false;
        
        const mensajeError = err?.error?.message ?? 'Error al registrar el voto manual';
        this.toastr.error(mensajeError, 'Error');
      },
      complete: () => {
        // Asegurar que el flag esté en false
        this.guardandoVotoManual = false;
      },
    });
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
          this.sincronizarPuntoUsuarioLocal(puntoUsuarioActual);

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

  // Obtiene la clase CSS correspondiente al estado del puntoUsuario
  getClassForPuntoUsuario(puntoUsuario: IPuntoUsuario, punto: IPunto) {
    return {
      'sin-votar': puntoUsuario.opcion === null,
      afavor: puntoUsuario.opcion === 'afavor',
      encontra: puntoUsuario.opcion === 'encontra',
      abstencion: puntoUsuario.opcion === 'abstencion',
      'disabled-box': (puntoUsuario.estado === false && punto.resultado !== null)||(puntoUsuario.estado === false),
    };
  }

  private establecerPendientes(ids: number[]): void {
    this.hayCambiosPendientes = false;
    this.puntoUsuariosPendientesIds = new Set(
      (ids ?? []).filter(
        (id): id is number => typeof id === 'number' && Number.isFinite(id)
      )
    );
    this.actualizarPendientesLocales();
  }

  private actualizarPendientesLocales(): void {
    if (!this.puntoUsuariosPendientesIds.size) {
      this.puntoUsuariosPendientes = [];
      this.agrupadosPendientes = [];
      this.actualizarEstadoBloqueoPendientes();
      return;
    }

    const ids = this.puntoUsuariosPendientesIds;
    const pendientes = (this.puntoUsuarios ?? []).filter((pu: IPuntoUsuario) => {
      const id = pu?.id_punto_usuario;
      return id != null && ids.has(id);
    });

    if (!pendientes.length) {
      this.puntoUsuariosPendientesIds.clear();
    }

    this.puntoUsuariosPendientes = pendientes;
    this.agrupadosPendientes = this.agruparPorGrupo(pendientes);
    this.actualizarEstadoBloqueoPendientes();
  }

  private actualizarEstadoBloqueoPendientes(): void {
    const tienePendientes =
      this.puntoUsuariosPendientes.length > 0 ||
      this.puntoUsuariosPendientesIds.size > 0;
    this.modalResultadosBloqueado = tienePendientes || this.hayCambiosPendientes;
  }

  private obtenerAsistenciaPorUsuario(
    idUsuario?: number
  ): IAsistencia | undefined {
    if (!idUsuario) return undefined;
    return (this.asistenciasOriginales ?? []).find(
      (a) => a.usuario?.id_usuario === idUsuario
    );
  }

  marcarPendienteComo(
    puntoUsuario: IPuntoUsuario,
    tipo: 'presente' | 'ausente'
  ): void {
    const idUsuario = puntoUsuario?.usuario?.id_usuario;
    if (!idUsuario) {
      this.toastr.error(
        'No se pudo identificar al usuario del punto.',
        'Acción no disponible'
      );
      return;
    }

    const asistencia = this.obtenerAsistenciaPorUsuario(idUsuario);
    if (!asistencia) {
      this.toastr.error(
        'No se encontró registro de asistencia para el usuario.',
        'Acción no disponible'
      );
      return;
    }

    const tipoActual = this.norm(asistencia.tipo_asistencia);
    if (tipoActual === tipo) {
      puntoUsuario.estado = tipo === 'presente';
      this.actualizarVisualizacionPuntoUsuario(puntoUsuario);
      this.actualizarPendientesLocales();
      return;
    }

    this.onCambioTipo(asistencia, tipo);
    puntoUsuario.estado = tipo === 'presente';
    this.hayCambiosPendientes = true;
    this.actualizarVisualizacionPuntoUsuario(puntoUsuario);
    this.actualizarPendientesLocales();
  }

  marcarTodosPendientesComo(tipo: 'presente' | 'ausente'): void {
    const copia = [...this.puntoUsuariosPendientes];
    copia.forEach((pu) => this.marcarPendienteComo(pu, tipo));
  }

  onPendienteCheckboxChange(
    puntoUsuario: IPuntoUsuario,
    checked: boolean
  ): void {
    const tipo = checked ? 'ausente' : 'presente';
    this.marcarPendienteComo(puntoUsuario, tipo);
  }

  aplicarCambiosPendientes(): void {
    if (this.aplicandoCambiosPendientes || this.confirmandoAsistencia) return;
    this.aplicandoCambiosPendientes = true;

    this.confirmarAsistencia({
      onSuccess: () => {
        this.aplicandoCambiosPendientes = false;
        this.modalResultadosBloqueado = false;

        this.hayCambiosPendientes = false;
        this.actualizarPendientesLocales();
        this.actualizarEstadoBloqueoPendientes();
        if (this.pasoModalResultados !== 7) {
          return;
        }
        this.pasoModalResultados = 2;
        // this.calcularResultadoAutomatico();
      },
      onError: () => {
        this.aplicandoCambiosPendientes = false;
        this.actualizarEstadoBloqueoPendientes();
      },
      showToast: false,
    });
  }

  aplicarCambiosPendientesGrupo(): void {
    if (this.aplicandoCambiosPendientes || this.confirmandoAsistencia) return;
    this.aplicandoCambiosPendientes = true;

    this.confirmarAsistencia({
      onSuccess: () => {
        this.aplicandoCambiosPendientes = false;
        this.modalResultadosBloqueado = false;

        this.hayCambiosPendientes = false;
        this.actualizarPendientesLocales();
        this.actualizarEstadoBloqueoPendientes();
        if (this.pasoModalResultadosGrupo !== 7) {
          return;
        }
        this.pasoModalResultadosGrupo = 2;
        // Volver al paso 2 para recalcular automáticamente el grupo
      },
      onError: () => {
        this.aplicandoCambiosPendientes = false;
        this.actualizarEstadoBloqueoPendientes();
      },
      showToast: false,
    });
  }

  private limpiarPendientes(): void {
    this.puntoUsuariosPendientesIds.clear();
    this.puntoUsuariosPendientes = [];
    this.agrupadosPendientes = [];
    this.hayCambiosPendientes = false;
    this.actualizarEstadoBloqueoPendientes();
  }

  private sincronizarPuntoUsuarioLocal(puntoActualizado: IPuntoUsuario): void {
    const id = puntoActualizado?.id_punto_usuario;
    if (!id) return;

    const actualizarLista = (lista?: IPuntoUsuario[]) => {
      if (!lista) return;
      const existente = lista.find(
        (item) => item?.id_punto_usuario === id
      );
      if (existente) {
        Object.assign(existente, puntoActualizado);
      }
    };

    actualizarLista(this.puntoUsuarios as IPuntoUsuario[]);
    actualizarLista(this.puntoUsuariosPendientes);
  }

  // Obtiene el nombre del usuario principal o reemplazo
  getNombreUsuario(puntoUsuario: IPuntoUsuario): string {
    return puntoUsuario.es_principal
      ? puntoUsuario.usuario.nombre
      : puntoUsuario.usuario.usuarioReemplazo?.nombre || 'Reemplazo';
  }

  // =====================
  // Calculo de resultados
  // =====================

  /**
   * Valida que un grupo tenga puntos válidos para calcular resultados
   */
  private validarGrupoParaCalculo(grupo: IGrupo): { valido: boolean; puntos: IPunto[]; mensaje?: string } {
    if (!grupo?.id_grupo) {
      return { valido: false, puntos: [], mensaje: 'El grupo no es válido' };
    }

    const puntosDelGrupo = grupo.puntoGrupos?.map(pg => pg.punto).filter(p => p && p.id_punto) || [];
    
    if (puntosDelGrupo.length === 0) {
      return { valido: false, puntos: [], mensaje: 'El grupo no tiene puntos asignados' };
    }

    // Validar que todos los puntos tengan ID válido
    const puntosInvalidos = puntosDelGrupo.filter(p => !p.id_punto);
    if (puntosInvalidos.length > 0) {
      return { valido: false, puntos: [], mensaje: 'Algunos puntos del grupo no tienen ID válido' };
    }

    return { valido: true, puntos: puntosDelGrupo };
  }

  /**
   * Replica el resultado de un punto a otros puntos del grupo
   * Replica tanto la tabla resultado como los campos del punto relacionados
   */
  private replicarResultadoAPuntos(
    puntoOrigenId: number,
    puntosDestino: IPunto[]
  ): Observable<any> {
    const puntosDestinoIds = puntosDestino
      .map(p => p.id_punto)
      .filter(id => id !== puntoOrigenId && id != null);

    if (puntosDestinoIds.length === 0) {
      // No hay puntos para replicar, retornar exitoso
      return of(null);
    }

    // Obtener tanto el resultado como el punto origen para replicar toda la información
    return forkJoin({
      resultado: this.puntoService.getResultados(puntoOrigenId),
      punto: this.puntoService.getDataById(puntoOrigenId.toString())
    }).pipe(
      switchMap(({ resultado, punto }) => {
        if (!resultado || !resultado.id_punto) {
          throw new Error('No se pudo obtener el resultado del punto calculado');
        }
        if (!punto || !punto.id_punto) {
          throw new Error('No se pudo obtener el punto calculado');
        }

        // Preparar los resultados para replicar
        const resultadosParaReplicar: any[] = puntosDestinoIds.map(idPunto => {
          const resultadoReplicado = { ...resultado };
          resultadoReplicado.id_punto = idPunto;
          // Remover campos que no deben copiarse
          delete resultadoReplicado.id_resultado;
          return resultadoReplicado;
        });

        // Preparar los puntos para actualizar con los campos de resultado
        const puntosParaActualizar: any[] = puntosDestinoIds.map(idPunto => ({
          id_punto: idPunto,
          resultado: punto.resultado,
          n_afavor: punto.n_afavor,
          n_encontra: punto.n_encontra,
          n_abstencion: punto.n_abstencion,
          p_afavor: punto.p_afavor,
          p_encontra: punto.p_encontra,
          p_abstencion: punto.p_abstencion,
          calculo_resultado: punto.calculo_resultado
        }));

        // Guardar resultados en batch y actualizar puntos individualmente en paralelo
        const actualizacionesPuntos = puntosParaActualizar.map(p => 
          this.puntoService.saveData(p)
        );

        // Ejecutar todas las operaciones en paralelo
        return forkJoin({
          resultados: this.resultadoService.saveManyData(resultadosParaReplicar),
          puntos: forkJoin(actualizacionesPuntos)
        });
      }),
      catchError((err) => {
        console.error('Error al replicar resultados:', err);
        throw err;
      })
    );
  }

  /**
   * Calcula el resultado automático de un grupo
   * Como todos los puntos tienen los mismos votos, calcula el resultado del primer punto
   * y luego aplica el mismo cálculo a todos los demás puntos del grupo
   */
  async calcularResultadoGrupoAutomatico() {

    if (this.guardandoResultadoAutomatico || !this.grupoSeleccionadoParaResolver) return;



    // Validar el grupo

    const validacion = this.validarGrupoParaCalculo(this.grupoSeleccionadoParaResolver);

    if (!validacion.valido) {

      this.toastr.error(validacion.mensaje || 'Error al validar el grupo', 'Error');

      return;

    }



    if (!this.usuario?.id_usuario) {

      this.toastr.error('No se pudo identificar al usuario', 'Error');

      return;

    }



    const puntosDelGrupo = validacion.puntos;

    const puntosIds = puntosDelGrupo.map((p) => p.id_punto!).filter((id) => id != null);

    if (puntosIds.length === 0) {

      this.toastr.error('No hay puntos válidos en el grupo', 'Error');

      return;

    }



    const idGrupo = this.grupoSeleccionadoParaResolver.id_grupo;

    if (!idGrupo) {

      this.toastr.error('No se pudo identificar el grupo seleccionado', 'Error');

      return;

    }



    this.guardandoResultadoAutomatico = true;



    try {

      const payload = {

        idGrupo,

        modoCalculo: 'automatico',

        idUsuario: this.usuario.id_usuario,

        opciones: {

          recalcularVotos: true,

        },

      };



      await firstValueFrom(this.grupoService.calcularResultadoGrupo(payload));



      // Deshabilitar el grupo después de resolverlo exitosamente
      if (idGrupo) {
        const grupoData = {
          id_grupo: idGrupo,
          status: false, // Marcar como resuelto
        };
        await firstValueFrom(this.grupoService.saveData(grupoData));
      }

      this.pasoModalResultadosGrupo = 1;

      this.getPuntos();

      this.getResolucion(this.puntoSeleccionado.id_punto);

      this.limpiarPendientes();

      this.toastr.success('Resultado del grupo calculado correctamente', 'Éxito');

      this.cerrarModal('modalResultadosGrupo', undefined, this.modalResultadosGrupoRef);



      setTimeout(() => {

        this.getGruposDeSesion();

      }, 300);

    } catch (err: any) {

      console.error('Error al calcular resultado del grupo:', err);

      const codigo = err?.error?.code;

      const mensajeError = err?.error?.message ?? 'Error al calcular el resultado del grupo';



      if (codigo === 'VOTOS_PENDIENTES') {

        const idsPendientes = err?.error?.data?.puntoUsuariosSinVoto ?? [];

        this.establecerPendientes(idsPendientes);

        this.pasoModalResultadosGrupo = 7;

        this.modalResultadosBloqueado = true;

        this.toastr.warning(

          mensajeError ?? 'Existen miembros habilitados sin voto registrado.',

          'Votos pendientes'

        );

      } else {

        this.pasoModalResultadosGrupo = 1;

        this.modalResultadosBloqueado = false;

        this.limpiarPendientes();

        this.toastr.error(mensajeError, 'Error al calcular el resultado');

      }

    } finally {

      this.guardandoResultadoAutomatico = false;

    }

  }

  async calcularResultadoAutomatico() {

    if (this.guardandoResultadoAutomatico) return;



    if (this.grupoSeleccionadoParaResolver) {

      await this.calcularResultadoGrupoAutomatico();

      return;

    }



    if (!this.puntoSeleccionado || !this.usuario?.id_usuario) return;



    this.guardandoResultadoAutomatico = true;



    try {

      await firstValueFrom(

        this.puntoService.calcularResultados(

          this.puntoSeleccionado.id_punto,

          this.usuario.id_usuario

        )

      );



      this.toastr.success('Resultado calculado correctamente', 'Éxito');

      this.getPuntos();

      this.getResolucion(this.puntoSeleccionado.id_punto);

      this.pasoModalResultados = 1;

      this.limpiarPendientes();

      this.cerrarModal(

        'modalResultados',

        undefined,

        this.modalResultadosRef

      );

    } catch (err: any) {

      const codigo = err?.error?.code;

      if (codigo === 'VOTOS_PENDIENTES') {

        const idsPendientes = err?.error?.data?.puntoUsuariosSinVoto ?? [];

        this.establecerPendientes(idsPendientes);

        this.pasoModalResultados = 7;

        this.modalResultadosBloqueado = true;

        this.toastr.warning(

          err?.error?.message ?? 'Existen miembros habilitados sin voto registrado.',

          'Votos pendientes'

        );

      } else {

        this.toastr.error(

          err?.error?.message ?? 'Error al calcular el resultado',

          'Error al calcular el resultado'

        );

      }

    } finally {

      this.guardandoResultadoAutomatico = false;

    }

  }

  /**
   * Calcula el resultado manual de un grupo
   * Aplica el mismo resultado manual a todos los puntos del grupo
   */
  async calcularResultadoGrupoManual() {

    if (this.guardandoResultadoManual || !this.grupoSeleccionadoParaResolver) return;



    if (!this.resultadoManualSeleccionado || !this.usuario?.id_usuario) {

      this.toastr.error('Debe seleccionar un resultado y estar autenticado', 'Error');

      return;

    }



    const validacion = this.validarGrupoParaCalculo(this.grupoSeleccionadoParaResolver);

    if (!validacion.valido) {

      this.toastr.error(validacion.mensaje || 'Error al validar el grupo', 'Error');

      return;

    }



    const puntosDelGrupo = validacion.puntos;

    const puntosIds = puntosDelGrupo.map((p) => p.id_punto!).filter((id) => id != null);

    if (puntosIds.length === 0) {

      this.toastr.error('No hay puntos válidos en el grupo', 'Error');

      return;

    }



    const idGrupo = this.grupoSeleccionadoParaResolver.id_grupo;

    if (!idGrupo) {

      this.toastr.error('No se pudo identificar el grupo seleccionado', 'Error');

      return;

    }



    this.guardandoResultadoManual = true;



    try {

      const payload = {

        idGrupo,

        modoCalculo: 'manual',

        idUsuario: this.usuario.id_usuario,

        opciones: {

          overrideResultado: this.resultadoManualSeleccionado,

        },

      };



      await firstValueFrom(this.grupoService.calcularResultadoGrupo(payload));



      // Deshabilitar el grupo después de resolverlo exitosamente
      if (idGrupo) {
        const grupoData = {
          id_grupo: idGrupo,
          status: false, // Marcar como resuelto
        };
        await firstValueFrom(this.grupoService.saveData(grupoData));
      }

      this.pasoModalResultadosGrupo = 1;

      this.getPuntos();

      this.getResolucion(this.puntoSeleccionado.id_punto);

      this.toastr.success('Resultado manual del grupo guardado correctamente', 'Éxito');

      this.cerrarModal('modalResultadosGrupo', undefined, this.modalResultadosGrupoRef);



      setTimeout(() => {

        this.getGruposDeSesion();

      }, 300);

    } catch (err: any) {

      console.error('Error al guardar resultado manual del grupo:', err);

      const mensajeError = err?.error?.message ?? 'Error al guardar resultado manual del grupo';

      this.toastr.error(mensajeError, 'Error');

    } finally {

      this.guardandoResultadoManual = false;

    }

  }

  async calcularResultadoManual() {

    if (this.grupoSeleccionadoParaResolver) {

      await this.calcularResultadoGrupoManual();

      return;

    }



    if (!this.puntoSeleccionado || !this.usuario?.id_usuario) return;



    this.guardandoResultadoManual = true;



    const data = {

      id_punto: this.puntoSeleccionado.id_punto,

      id_usuario: this.usuario.id_usuario,

      resultado: this.resultadoManualSeleccionado,

    };



    try {

      await firstValueFrom(this.puntoService.calcularResultadosManual(data));



      this.toastr.success('Resultado manual guardado correctamente', 'Éxito');

      this.getPuntos();

      this.getResolucion(this.puntoSeleccionado.id_punto);

      this.pasoModalResultados = 1;

      this.cerrarModal('modalResultados', undefined, this.modalResultadosRef);

    } catch (err: any) {

      this.toastr.error(

        err?.error?.message ?? 'Error al guardar resultado manual',

        'Error al guardar resultado manual'

      );

      console.log(this.resultadoManualSeleccionado);

      console.log(this.usuario?.id_usuario);

      console.log(this.puntoSeleccionado?.id_punto);

    } finally {

      this.guardandoResultadoManual = false;

    }

  }

  /**
   * Calcula el resultado híbrido de un grupo
   * Aplica el mismo cálculo híbrido a todos los puntos del grupo
   */
  async calcularResultadoGrupoHibrido() {

    if (this.guardandoResultadoHibrido || !this.grupoSeleccionadoParaResolver) return;



    const validacion = this.validarGrupoParaCalculo(this.grupoSeleccionadoParaResolver);

    if (!validacion.valido) {

      this.toastr.error(validacion.mensaje || 'Error al validar el grupo', 'Error');

      return;

    }



    if (!this.usuario?.id_usuario) {

      this.toastr.error('No se pudo identificar al usuario', 'Error');

      return;

    }



    const puntosUnicos = new Set(this.votosHibridos.map((v) => v.punto));

    if (puntosUnicos.size > 1) {

      this.toastr.error('Los votos contienen puntos inconsistentes', 'Error');

      return;

    }



    if (!this.votosHibridos || this.votosHibridos.length === 0) {

      this.toastr.error('Debe configurar los votos híbridos', 'Error');

      return;

    }



    const puntosDelGrupo = validacion.puntos;

    const puntosIds = puntosDelGrupo.map((p) => p.id_punto!).filter((id) => id != null);

    if (puntosIds.length === 0) {

      this.toastr.error('No hay puntos válidos en el grupo', 'Error');

      return;

    }



    const idGrupo = this.grupoSeleccionadoParaResolver.id_grupo;

    if (!idGrupo) {

      this.toastr.error('No se pudo identificar el grupo seleccionado', 'Error');

      return;

    }



    const votosParaGrupo = puntosIds.flatMap((idPunto) =>

      this.votosHibridos.map((v) => ({

        idUsuario: v.idUsuario,

        votante: v.votante,

        codigo: v.codigo,

        punto: idPunto,

        opcion: v.opcion,

        es_razonado: !!v.es_razonado,

      }))

    );



    this.guardandoResultadoHibrido = true;



    try {

      const payload = {

        idGrupo,

        modoCalculo: 'hibrido',

        idUsuario: this.usuario.id_usuario,

        votos: votosParaGrupo,

        opciones: {

          recalcularVotos: true,

        },

      };



      await firstValueFrom(this.grupoService.calcularResultadoGrupo(payload));



      // Deshabilitar el grupo después de resolverlo exitosamente
      if (idGrupo) {
        const grupoData = {
          id_grupo: idGrupo,
          status: false, // Marcar como resuelto
        };
        await firstValueFrom(this.grupoService.saveData(grupoData));
      }

      this.pasoModalResultadosGrupo = 1;

      this.getPuntos();

      this.getResolucion(this.puntoSeleccionado.id_punto);

      this.toastr.success('Resultado híbrido del grupo calculado correctamente', 'Éxito');

      this.cerrarModal('modalResultadosGrupo', undefined, this.modalResultadosGrupoRef);



      setTimeout(() => {

        this.getGruposDeSesion();

      }, 300);

    } catch (err: any) {

      console.error('Error al calcular resultado híbrido del grupo:', err);

      const mensajeError = err?.error?.message ?? 'Error al calcular el resultado híbrido del grupo';

      this.toastr.error(mensajeError, 'Error');

    } finally {

      this.guardandoResultadoHibrido = false;

    }

  }

  async calcularResultadoHibrido() {

    if (this.grupoSeleccionadoParaResolver) {

      await this.calcularResultadoGrupoHibrido();

      return;

    }



    if (!this.puntoSeleccionado) return;



    const puntosUnicos = new Set(this.votosHibridos.map((v) => v.punto));

    if (puntosUnicos.size > 1) {

      console.warn('? Hay múltiples puntos en los votos:', puntosUnicos);

      this.toastr.error('Los votos contienen puntos inconsistentes');

      return;

    }



    this.guardandoResultadoHibrido = true;



    try {

      await firstValueFrom(

        this.puntoService.calcularResultadosHibrido(

          this.puntoSeleccionado.id_punto,

          this.votosHibridos

        )

      );



      this.toastr.success('Resultado calculado correctamente');

      this.getPuntos();

      this.getResolucion(this.puntoSeleccionado.id_punto);

      this.pasoModalResultados = 1;

      this.cerrarModal(

        'modalResultados',

        undefined,

        this.modalResultadosRef

      );

    } catch (err: any) {

      this.toastr.error(

        'Error al calcular el resultado híbrido',

        err?.error?.message

      );

    } finally {

      this.guardandoResultadoHibrido = false;

    }

  }

  //RESULTADO RECIBE 3 VALORES: 'automatica', 'manual', 'hibrida'
  /*calculoPorGrupo(grupo: IGrupo, resultado: string): void {
    if (!grupo?.id_grupo) return;
    
    const grupoData: any = {
      id_grupo: grupo.id_grupo,
      resultado: resultado
    };
    
    this.grupoService.saveData(grupoData).subscribe({
      next: () => {
        this.toastr.success('Resultado del grupo guardado correctamente', 'Éxito');
        this.getGruposDeSesion();
        this.cerrarModal('modalResultados', undefined, this.modalResultadosRef);
      },
      error: (err) => {
        this.toastr.error(
          err?.error?.message ?? 'Error al guardar el resultado del grupo',
          'Error'
        );
      },
    });
  }*/

  abrirModalResultados(tipo: 'normal' | 'dirimente' = 'normal'): void {
    this.pasoModalResultados = 1;
    this.resultadoManualSeleccionado = null;
    this.busquedaVotoHibrido = '';
    this.filtroVotoHibrido = 'todos';
    this.grupoSeleccionadoParaResolver = undefined; // Asegurar que no hay grupo seleccionado
    this.agruparYFiltrarVotosHibridos();

    if (this.modalResultadosRef) {
      this.modalResultadosRef.show();
    } else {
      const modalElement = document.getElementById('modalResultados');
      if (modalElement) {
        this.modalResultadosRef = new Modal(modalElement);
        this.modalResultadosRef.show();
      }
    }
  }

  abrirModalResultadosGrupo(grupo: IGrupo): void {
    if (!grupo?.id_grupo) return;
    
    // Cerrar el modal de grupos si está abierto
    this.cerrarModal('modalGrupos');
    
    this.grupoSeleccionadoParaResolver = grupo;
    this.pasoModalResultadosGrupo = 1;
    this.resultadoManualSeleccionado = null;
    this.busquedaVotoHibrido = '';
    this.filtroVotoHibrido = 'todos';
    this.agruparYFiltrarVotosHibridos();

    // Usar el modal separado para grupos con manejo seguro de Bootstrap
    // Esperar un poco más para asegurar que el modal de grupos se cierre primero
    setTimeout(() => {
      try {
        if (this.modalResultadosGrupoRef) {
          this.modalResultadosGrupoRef.show();
        } else {
          const modalElement = document.getElementById('modalResultadosGrupo');
          if (modalElement) {
            this.modalResultadosGrupoRef = new Modal(modalElement, {
              backdrop: true,
              keyboard: true,
              focus: false // Evitar el focus automático que causa problemas
            });
            this.modalResultadosGrupoRef.show();
          }
        }
      } catch (e) {
        console.error('Error al abrir modal de grupos:', e);
        this.toastr.error('Error al abrir el modal de resultados del grupo', 'Error');
      }
    }, 150);
  }

  /** Cargar y componer los datos de ambas tablas en un solo método */
  cargarResmenesDelPunto(idPunto: number): void {
    this.resultadoPunto = null;
    this.actualizarResumenes(null);

    this.resultadoService
      .getDataBy(`id_punto=${idPunto}`)
      .subscribe({
        next: (resultado) => {
          this.resultadoPunto = resultado ?? null;
          this.actualizarResumenes(this.resultadoPunto);
        },
        error: () => {
          this.resultadoPunto = null;
          this.actualizarResumenes(null);
        },
      });
  }

  private actualizarResumenes(resultado: IResultado | null): void {
    const punto = this.puntoSeleccionado;

    const minNominal = resultado?.n_mitad_miembros_presente ?? 0;
    const minPonderado = resultado?.mitad_miembros_ponderado ?? 0;

    const pFavor = punto?.p_afavor ?? 0;
    const pContra = punto?.p_encontra ?? 0;
    const pAbstencion = punto?.p_abstencion ?? 0;

    const estadoPonderado =
      resultado?.estado_ponderado ?? punto?.resultado ?? '---';
    const estadoNominal = resultado?.estado_nominal ?? '---';

    const nFavor = punto?.n_afavor ?? 0;
    const nContra = punto?.n_encontra ?? 0;
    const nAbstencion = punto?.n_abstencion ?? 0;

    let nAusentes = resultado?.n_ausentes;
    if (nAusentes == null) {
      const total = resultado?.n_total;
      if (total != null) {
        const restante = total - (nFavor + nContra + nAbstencion);
        nAusentes = Math.max(restante, 0);
      } else {
        nAusentes = 0;
      }
    }

    const nTotal =
      resultado?.n_total ?? nFavor + nContra + nAbstencion + nAusentes;

    this.uiResumen = {
      minNominal,
      minPonderado,
      pFavor,
      pContra,
      pAbstencion,
      estadoPonderado,
      estadoNominal,
      nFavor,
      nContra,
      nAbstencion,
      nAusentes,
      nTotal,
    };

    const dosTerciosPonderado = resultado?.dos_terceras_ponderado ?? 0;
    const dosTerciosMiembros = resultado?.n_dos_terceras_miembros ?? 0;
    this.resumenBase = {
      resumen_excel: {
        minimos: {
          mitad_presentes_nominal: minNominal,
          mitad_miembros_ponderado: minPonderado,
          dos_tercios_ponderado: dosTerciosPonderado,
          dos_tercios_miembros_nominal: dosTerciosMiembros,
          mayoria_simple: minNominal,
        },
      },
    };
  }

  // (opcional) helper si necesitas mostrar el dirimente
  get requiereDirimente(): boolean {
    return !!this.puntoSeleccionado?.requiere_voto_dirimente;
  }

  // =====================
  // Funcionalidad de voto hibrido
  // =====================

  agruparYFiltrarVotosHibridos(): void {
    this.withHibridoScroll(() => {
      const texto = (this.busquedaVotoHibrido || '').toLowerCase().trim();

      // 1) Búsqueda
      const listaConBusqueda = (this.votosHibridos ?? []).filter(
        (voto) =>
          !texto || (voto.usuario?.nombre || '').toLowerCase().includes(texto)
      );

      // 2) Contadores
      const c = { todos: 0, afavor: 0, encontra: 0, abstencion: 0, sinvoto: 0 };
      c.todos = listaConBusqueda.length;
      for (const v of listaConBusqueda) {
        if (!v.opcion) c.sinvoto++;
        else if (v.opcion === 'afavor') c.afavor++;
        else if (v.opcion === 'encontra') c.encontra++;
        else if (v.opcion === 'abstencion') c.abstencion++;
      }
      this.contadoresHibrido = c;

      // 3) Filtro activo
      const filtradas = listaConBusqueda
        .filter((v) =>
          this.filtroVotoHibrido === 'todos'
            ? true
            : this.filtroVotoHibrido === 'sinvoto'
            ? !v.opcion
            : v.opcion === this.filtroVotoHibrido
        )
        .sort((a, b) => a.usuario.nombre.localeCompare(b.usuario.nombre));

      // 4) Agrupar
      const agrupados = new Map<string, any[]>();
      for (const v of filtradas) {
        const g = v.usuario.grupoUsuario?.nombre || 'Otros';
        if (!agrupados.has(g)) agrupados.set(g, []);
        agrupados.get(g)!.push(v);
      }

      const ordenGrupos = [
        'Decanos',
        'Estudiantes',
        'Profesores',
        'Rector',
        'Trabajadores',
        'Vicerrector',
        'Otros',
      ];

      this.agrupadosVotosHibridos = Array.from(
        agrupados,
        ([grupo, usuarios]) => ({
          grupo,
          usuarios,
        })
      ).sort(
        (a, b) => ordenGrupos.indexOf(a.grupo) - ordenGrupos.indexOf(b.grupo)
      );
    });
  }

  cambiarFiltroVotoHibrido(
    filtro: 'todos' | 'afavor' | 'encontra' | 'abstencion' | 'sinvoto'
  ): void {
    this.filtroVotoHibrido = filtro;
    this.agruparYFiltrarVotosHibridos();
  }

  onCambioOpcionHibrido() {
    this.agruparYFiltrarVotosHibridos();
  }

  actualizarBusquedaVotoHibrido(valor: string): void {
    this.busquedaVotoHibrido = valor ?? '';
    this.agruparYFiltrarVotosHibridos();
  }

  // =====================
  // Resolucion
  // =====================

  crearResolucion() {
    this.guardandoResolucion = true;

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
        this.modoCreacionResolucion = false;
        this.guardandoResolucion = false;
      },
      error: () => {
        this.toastr.error('Error al crear la resolución');
        this.guardandoResolucion = false;
      },
    });
  }

  editarResolucion() {
    if (!this.puntoSeleccionado || !this.resolucionActual) return;

    this.guardandoResolucion = true;

    const updateResolucionData: any = {
      id_punto: this.puntoSeleccionado.id_punto,
      id_usuario: this.usuario?.id_usuario,
      nombre: this.resolucionForm.value.nombre!,
      descripcion: this.resolucionForm.value.descripcion!,
    };

    this.resolucionService.updateData(updateResolucionData).subscribe({
      next: () => {
        this.toastr.success('Resolución actualizada', 'Éxito');
        this.getResolucion(this.puntoSeleccionado!.id_punto);
        this.guardandoResolucion = false;
      },
      error: (err) => {
        this.toastr.error(
          err.error.message,
          'Error al actualizar la resolución'
        );
        this.guardandoResolucion = false;
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

  // =====================
  // Utilidades de la interfaz
  // =====================

  private preserveScroll(run: () => void, ref?: ElementRef<HTMLElement>) {
    const el = ref?.nativeElement;
    const y = el?.scrollTop ?? null;
    run();
    setTimeout(() => {
      if (el && y != null) el.scrollTop = y;
    }, 0);
  }

  private withNominaScroll(run: () => void) {
    this.preserveScroll(run, this.nominaScroll);
  }
  private withHibridoScroll(run: () => void) {
    this.preserveScroll(run, this.hibridoScroll);
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

  cerrarModal(modalId: string, form?: FormGroup, modalRef?: any) {
    try {
      const modalElement = document.getElementById(modalId);
      if (modalElement) {
        const modalInstance = modalRef;
        if (modalInstance) {
          modalInstance.hide();
        } else {
          modalElement.classList.remove('show');
          modalElement.style.display = 'none';
          modalElement.setAttribute('aria-hidden', 'true');
          modalElement.removeAttribute('aria-modal');
          modalElement.removeAttribute('role');
        }
      }

      // Verificar si hay otros modales abiertos después de un breve delay
      // para asegurar que el DOM se haya actualizado
      setTimeout(() => {
        const modalesAbiertos = document.querySelectorAll('.modal.show');
        
        // Si no hay modales abiertos, limpiar completamente el estado del body
        if (modalesAbiertos.length === 0) {
          document.body.classList.remove('modal-open');
          document.body.style.overflow = '';
          document.body.style.paddingRight = '';
          
          // Remover todos los backdrops
          const backdrops = document.getElementsByClassName('modal-backdrop');
          while (backdrops[0]) {
            backdrops[0].parentNode?.removeChild(backdrops[0]);
          }
        } else {
          // Si hay otros modales, solo remover el backdrop correspondiente
          const backdrops = document.getElementsByClassName('modal-backdrop');
          if (backdrops.length > modalesAbiertos.length) {
            const ultimoBackdrop = backdrops[backdrops.length - 1];
            ultimoBackdrop.parentNode?.removeChild(ultimoBackdrop);
          }
        }
      }, 100);

      if (form) form.reset();
      
      // Limpiar grupo seleccionado si se cierra el modal de resultados o de grupos
      if (modalId === 'modalResultados' || modalId === 'modalResultadosGrupo') {
        this.grupoSeleccionadoParaResolver = undefined;
        this.pasoModalResultadosGrupo = 1;
      }
    } catch (e) {
      console.warn(`Error al cerrar modal ${modalId}:`, e);
      // Asegurar limpieza del body incluso si hay error
      setTimeout(() => {
        const modalesAbiertos = document.querySelectorAll('.modal.show');
        if (modalesAbiertos.length === 0) {
          document.body.classList.remove('modal-open');
          document.body.style.overflow = '';
          document.body.style.paddingRight = '';
          const backdrops = document.getElementsByClassName('modal-backdrop');
          while (backdrops[0]) {
            backdrops[0].parentNode?.removeChild(backdrops[0]);
          }
        }
      }, 100);
    }
  }

  // Alterna la visibilidad del dropdown asociado a un puntoUsuario específico
  toggleDropdownxd(id_punto_usuario: number, event: Event) {
    console.log('Dropdown clickeado', id_punto_usuario);
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

  irAAsistencia(id: number) {
    this.navegarA('asistencia', id);
  }

  navegarA(ruta: string, id: number) {
    if (id) {
      this.router.navigate([`/${ruta}`, id]);
    } else {
      console.error(`ID no definido: ${id}`);
    }
  }

  // =====================
  // Flujo de pasos del modal de resultados
  // =====================
  irAPasoConfirmarAutomatico() {
    this.pasoModalResultados = 2;
  }

  irAPasoManual() {
    this.pasoModalResultados = 3;
  }

  /**
   * Valida si el resultado manual seleccionado es válido
   */
  esResultadoManualValido(): boolean {
    return this.resultadoManualSeleccionado !== null && 
           this.resultadoManualSeleccionado !== undefined &&
           ['aprobada', 'rechazada', 'pendiente'].includes(this.resultadoManualSeleccionado);
  }

  irAPasoConfirmacion() {
    // Validar que se haya seleccionado una opción válida
    if (!this.esResultadoManualValido()) {
      this.toastr.warning('Debe seleccionar una opción válida antes de continuar', 'Validación requerida');
      return;
    }
    this.pasoModalResultados = 4;
  }

  volverAlPasoInicial() {
    this.pasoModalResultados = 1;
  }

  volverAlPasoManual() {
    this.pasoModalResultados = 3;
  }

  volverAGestionGrupos() {
    this.pantallaGrupo = 1;
    this.grupoForm.reset({ nombre: '', puntos: [] });
  }

  irAPasoConfirmarHibrido() {
    this.pasoModalResultados = 6;
  }

  volverAPasoHibrido() {
    this.pasoModalResultados = 5;
  }

  // =====================
  // Métodos de navegación para el modal de GRUPOS (separado)
  // =====================
  irAPasoConfirmarAutomaticoGrupo() {
    this.pasoModalResultadosGrupo = 2;
  }

  irAPasoManualGrupo() {
    this.pasoModalResultadosGrupo = 3;
  }

  irAPasoConfirmacionGrupo() {
    // Validar que se haya seleccionado una opción válida
    if (!this.esResultadoManualValido()) {
      this.toastr.warning('Debe seleccionar una opción válida antes de continuar', 'Validación requerida');
      return;
    }
    this.pasoModalResultadosGrupo = 4;
  }

  volverAlPasoInicialGrupo() {
    this.pasoModalResultadosGrupo = 1;
  }

  volverAlPasoManualGrupo() {
    this.pasoModalResultadosGrupo = 3;
  }

  irAPasoConfirmarHibridoGrupo() {
    this.pasoModalResultadosGrupo = 6;
  }

  volverAPasoHibridoGrupo() {
    this.pasoModalResultadosGrupo = 5;
  }

  irAPasoHibridoGrupo() {
    if (!this.grupoSeleccionadoParaResolver) return;
    
    const puntosDelGrupo = this.grupoSeleccionadoParaResolver.puntoGrupos
      ?.map(pg => pg.punto)
      .filter(p => p) || [];
    
    if (puntosDelGrupo.length === 0 || !puntosDelGrupo[0]?.id_punto) {
      this.toastr.error('El grupo no tiene puntos asignados', 'Error');
      return;
    }
    
    const primerPuntoId = puntosDelGrupo[0].id_punto;
    const esAdmin = puntosDelGrupo[0]?.es_administrativa || false;
    
    const query = `punto.id_punto=${primerPuntoId}`;
    const relations = [
      `usuario`,
      `usuario.usuarioReemplazo`,
      `usuario.grupoUsuario`,
    ];

    this.puntoUsuarioService
      .getAllDataBy(query, relations)
      .subscribe((data) => {
        const puntoUsuariosGrupo = data.sort((a, b) => {
          return a.estado === b.estado ? 0 : a.estado ? -1 : 1;
        });
        
        if (!puntoUsuariosGrupo?.length) {
          this.toastr.warning('No hay votos disponibles para configurar', 'Advertencia');
          this.pasoModalResultadosGrupo = 5;
          return;
        }
        
        const asistenciaMap = new Map<number, string>(
          (this.nomina || []).map((a: any) => [
            a.usuario?.id_usuario,
            (a.tipo_asistencia ?? 'ausente').toString().trim().toLowerCase(),
          ])
        );

        this.votosHibridos = puntoUsuariosGrupo.map((pu) => {
          const u = pu.usuario;
          const grupoUsuario = (u?.grupoUsuario?.nombre || '').toLowerCase();

          const esPresente = asistenciaMap.get(u.id_usuario) === 'presente';
          const esRector = grupoUsuario === 'rector';
          const esTrabajador = grupoUsuario === 'trabajador';

          const habilitado = esPresente && !esRector && !(esAdmin && esTrabajador);

          return {
            idUsuario: u.id_usuario,
            votante: this.usuario.id_usuario,
            punto: primerPuntoId,
            opcion: habilitado ? 'afavor' : null,
            es_razonado: false,
            habilitado,
            usuario: { ...u },
          };
        });

        this.agruparYFiltrarVotosHibridos();
        this.pasoModalResultadosGrupo = 5;
      });
  }

  irAPasoHibrido() {
    // Para grupos, preparar votos híbridos igual que un punto individual
    if (this.grupoSeleccionadoParaResolver) {
      // Los puntos del grupo tienen los mismos votos, usamos el primer punto como referencia
      const puntosDelGrupo = this.grupoSeleccionadoParaResolver.puntoGrupos
        ?.map(pg => pg.punto)
        .filter(p => p) || [];
      
      if (puntosDelGrupo.length === 0 || !puntosDelGrupo[0]?.id_punto) {
        this.toastr.error('El grupo no tiene puntos asignados', 'Error');
        return;
      }
      
      const primerPuntoId = puntosDelGrupo[0].id_punto;
      const esAdmin = puntosDelGrupo[0]?.es_administrativa || false;
      
      // Cargar puntoUsuarios del primer punto del grupo (tienen los mismos votos que todos)
      // Usamos la misma lógica que para puntos individuales
      const query = `punto.id_punto=${primerPuntoId}`;
      const relations = [
        `usuario`,
        `usuario.usuarioReemplazo`,
        `usuario.grupoUsuario`,
      ];

      this.puntoUsuarioService
        .getAllDataBy(query, relations)
        .subscribe((data) => {
          // Ordenar primero por estado (activos arriba)
          const puntoUsuariosGrupo = data.sort((a, b) => {
            return a.estado === b.estado ? 0 : a.estado ? -1 : 1;
          });
          
          if (!puntoUsuariosGrupo?.length) {
            this.toastr.warning('No hay votos disponibles para configurar', 'Advertencia');
            this.pasoModalResultados = 5;
            return;
          }
          
          // Mapa de asistencia
          const asistenciaMap = new Map<number, string>(
            (this.nomina || []).map((a: any) => [
              a.usuario?.id_usuario,
              (a.tipo_asistencia ?? 'ausente').toString().trim().toLowerCase(),
            ])
          );

          this.votosHibridos = puntoUsuariosGrupo.map((pu) => {
            const u = pu.usuario;
            const grupoUsuario = (u?.grupoUsuario?.nombre || '').toLowerCase();

            const esPresente = asistenciaMap.get(u.id_usuario) === 'presente';
            const esRector = grupoUsuario === 'rector';
            const esTrabajador = grupoUsuario === 'trabajador';

            // regla: presente ∧ !rector ∧ !(administrativa ∧ trabajador)
            const habilitado = esPresente && !esRector && !(esAdmin && esTrabajador);

            return {
              idUsuario: u.id_usuario,
              votante: this.usuario.id_usuario,
              punto: primerPuntoId, // Usamos el primer punto del grupo (todos tienen los mismos votos)
              opcion: habilitado ? 'afavor' : null,
              es_razonado: false,
              habilitado,
              usuario: { ...u },
            };
          });
          
          this.agruparYFiltrarVotosHibridos();
          this.pasoModalResultados = 5;
        });
      return;
    }
    
    if (!this.puntoUsuarios?.length) return;

    // mapa rápido: id_usuario -> 'presente' | 'ausente'
    const asistenciaMap = new Map<number, string>(
      (this.nomina || []).map((a: any) => [
        a.usuario?.id_usuario,
        (a.tipo_asistencia ?? 'ausente').toString().trim().toLowerCase(),
      ])
    );

    const esAdmin = !!this.puntoSeleccionado?.es_administrativa;

    this.votosHibridos = this.puntoUsuarios.map((pu) => {
      const u = pu.usuario;
      const grupo = (u?.grupoUsuario?.nombre || '').toLowerCase();

      const esPresente = asistenciaMap.get(u.id_usuario) === 'presente';
      const esRector = grupo === 'rector';
      const esTrabajador = grupo === 'trabajador';

      // regla: presente ∧ !rector ∧ !(administrativa ∧ trabajador)
      const habilitado = esPresente && !esRector && !(esAdmin && esTrabajador);

      return {
        idUsuario: u.id_usuario,
        votante: this.usuario.id_usuario,
        punto: this.puntoSeleccionado.id_punto,
        opcion: habilitado ? 'afavor' : null, // los no habilitados salen "sin votar"
        es_razonado: false,
        habilitado, // ⬅️ usamos esto para [disabled]
        usuario: { ...u }, // mantener datos en la UI
      };
    });

    this.agruparYFiltrarVotosHibridos(); // actualiza contadores/tabs
    this.pasoModalResultados = 5;
  }

  goBack() {
    this.location.back();
  }
}
