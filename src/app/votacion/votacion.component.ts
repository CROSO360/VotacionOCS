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
import { forkJoin, Observable } from 'rxjs';
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
import { FooterComponent } from "../components/footer/footer.component";

@Component({
  selector: 'app-votacion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BarraSuperiorComponent,
    BotonAtrasComponent,
    FooterComponent
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
    private cookieService: CookieService,
    private grupoService: GrupoService
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

  resultadoManualSeleccionado: 'aprobada' | 'rechazada' | 'pendiente' =
    'aprobada';

  modoCreacionResolucion = false;

  grupos: IGrupo[] = []; // Lista de grupos de la sesión

  pantallaGrupo: number = 1; // 1 = gestión, 2 = crear grupo

  votoManualModalRef: any;
  modalResultadosRef: Modal | null = null;

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

  agrupadosPorGrupo: { grupo: string; usuarios: IPuntoUsuario[] }[] = [];

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
        this.puntos = puntos;
        this.usuario = usuario;
        this.nomina = asistencia;
        this.asistenciasOriginales = asistencia; // ✅ Esta línea es la clave
        this.miembrosOCS = miembrosOCS.map((m: any) => m.usuario);
        this.grupos = grupos;

        // Agrupar después de asignar nomina
        this.agruparNominaPorGrupo();
        this.agruparYFiltrarVotosHibridos();

        if (this.puntos.length > 0) {
          const idGuardado = localStorage.getItem('puntoSeleccionadoId');
          const puntoRecuperado = this.puntos.find(
            (p) => p.id_punto.toString() === idGuardado
          );

          this.puntoSeleccionado = puntoRecuperado ?? this.puntos[0];
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
      this.puntos = data;

      const idGuardado = localStorage.getItem('puntoSeleccionadoId');
      const puntoRecuperado = this.puntos.find(
        (p) => p.id_punto.toString() === idGuardado
      );

      this.puntoSeleccionado = puntoRecuperado ?? this.puntos[0];
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

  // =====================
  // Métodos de administración de puntos
  // =====================
  onPuntoChange(): void {
    if (this.puntoSeleccionado?.id_punto) {
      localStorage.setItem(
        'puntoSeleccionadoId',
        this.puntoSeleccionado.id_punto.toString()
      );

      this.getPuntoUsuarios(this.puntoSeleccionado.id_punto);
      this.getResolucion(this.puntoSeleccionado.id_punto);
    }
  }

  cambiarEstadoPunto(punto: IPunto) {
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
      error: () => {
        this.toastr.error('Error al crear el grupo');
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
  confirmarAsistencia() {
    if (this.nomina.length === 0) return;

    this.confirmandoAsistencia = true;

    const actualizaciones = this.nomina.map((asistencia) => ({
      id_asistencia: asistencia.id_asistencia,
      tipo_asistencia: asistencia.tipo_asistencia,
    }));

    this.asistenciaService.saveManyData(actualizaciones).subscribe({
      next: () => {
        this.toastr.success('Asistencia actualizada correctamente', 'Éxito');
        this.confirmandoAsistencia = false;
      },
      error: () => {
        this.toastr.error('Error al actualizar la asistencia', 'Error');
        this.confirmandoAsistencia = false;
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
        (a) => a.tipo_asistencia === this.filtroAsistencia
      );
    }

    this.nomina = filtradas;
    this.agruparNominaPorGrupo();
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
    this.filtroAsistencia = valor;
    this.filtrarAsistenciasNomina();
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
    this.usuarioActual = undefined;
    const query = `id_usuario=${idUsuario}`;

    this.usuarioService.getDataBy(query).subscribe({
      next: (data) => {
        this.usuarioActual = data;
        setTimeout(() => {
          this.votoManualModalRef?.show();
        }, 0);
      },
      error: (error) => {
        console.error('Error al cargar usuario para voto manual', error);
        this.toastr.error('Error al cargar usuario', 'Error');
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
    if (!this.puntoSeleccionado) return;

    const votoData = {
      idUsuario: idUsuario,
      codigo: this.sesion?.codigo,
      punto: this.puntoSeleccionado.id_punto,
      opcion: this.votoManualForm.value.opcion,
      es_razonado: this.votoManualForm.value.razonado,
      votante: this.usuario.id_usuario,
    };

    this.guardandoVotoManual = true;

    this.puntoUsuarioService.saveVote(votoData).subscribe({
      next: () => {
        this.toastr.success('Voto manual registrado correctamente', 'Éxito');
        this.cerrarModal(
          'votoManualModal',
          this.votoManualForm,
          this.votoManualModalRef
        );
      },
      error: (err) => {
        this.toastr.error('Error al registrar el voto manual', err.error.message);
        this.guardandoVotoManual = false;
      },
      complete: () => {
        this.guardandoVotoManual = false;
        this.resetForm(); // si lo necesitas aquí
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
  getClassForPuntoUsuario(puntoUsuario: IPuntoUsuario) {
    return {
      'sin-votar': puntoUsuario.opcion === null,
      afavor: puntoUsuario.opcion === 'afavor',
      encontra: puntoUsuario.opcion === 'encontra',
      abstencion: puntoUsuario.opcion === 'abstencion',
      'disabled-box': puntoUsuario.estado === false,
    };
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

  calcularResultadoAutomatico() {
    if (!this.puntoSeleccionado) return;

    this.guardandoResultadoAutomatico = true;

    this.puntoService
      .calcularResultados(
        this.puntoSeleccionado.id_punto,
        this.usuario.id_usuario
      )
      .subscribe({
        next: () => {
          this.toastr.success('Resultado calculado correctamente', 'Éxito');
          this.getPuntos();
          this.getResolucion(this.puntoSeleccionado.id_punto);
          this.pasoModalResultados = 1;
          this.cerrarModal(
            'modalResultados',
            undefined,
            this.modalResultadosRef
          );
        },
        error: (err) => {
          this.toastr.error('Error al calcular el resultado', err.error.message);
          this.guardandoResultadoAutomatico = false;
        },
        complete: () => {
          this.guardandoResultadoAutomatico = false;
        },
      });
  }

  calcularResultadoManual() {
    if (!this.puntoSeleccionado || !this.usuario?.id_usuario) return;

    this.guardandoResultadoManual = true;

    const data = {
      id_punto: this.puntoSeleccionado.id_punto,
      id_usuario: this.usuario.id_usuario,
      resultado: this.resultadoManualSeleccionado,
    };

    this.puntoService.calcularResultadosManual(data).subscribe({
      next: () => {
        this.toastr.success('Resultado manual guardado correctamente', 'Éxito');
        this.getPuntos();
        this.getResolucion(this.puntoSeleccionado.id_punto);
        this.pasoModalResultados = 1;

        this.guardandoResultadoManual = false;
        this.cerrarModal('modalResultados', undefined, this.modalResultadosRef);
      },
      error: () => {
        this.toastr.error('Error al guardar resultado manual', 'Error');
        console.log(this.resultadoManualSeleccionado);
        console.log(this.usuario?.id_usuario);
        console.log(this.puntoSeleccionado?.id_punto);
        this.guardandoResultadoManual = false;
      },
    });
  }

  async calcularResultadoHibrido() {
    if (!this.puntoSeleccionado) return;

    const puntosUnicos = new Set(this.votosHibridos.map((v) => v.punto));
    if (puntosUnicos.size > 1) {
      console.warn('❌ Hay múltiples puntos en los votos:', puntosUnicos);
      this.toastr.error('Los votos contienen puntos inconsistentes');
      return;
    }

    this.guardandoResultadoHibrido = true;

    this.puntoService
      .calcularResultadosHibrido(
        this.puntoSeleccionado.id_punto,
        this.votosHibridos
      )
      .subscribe({
        next: () => {
          this.toastr.success('Resultado calculado correctamente');
          this.getPuntos();
          this.getResolucion(this.puntoSeleccionado.id_punto);
          this.pasoModalResultados = 1;
          this.cerrarModal(
            'modalResultados',
            undefined,
            this.modalResultadosRef
          );
          //console.table(this.votosHibridos, ['idUsuario', 'punto', 'opcion']);
        },
        error: (err) => {
          this.toastr.error('Error al calcular el resultado híbrido', err.error.message);
          //console.table(this.votosHibridos, ['idUsuario', 'punto', 'opcion']);
          this.guardandoResultadoHibrido = false;
        },
        complete: () => {
          this.guardandoResultadoHibrido = false;
        },
      });
  }

  abrirModalResultados(tipo: 'normal' | 'dirimente' = 'normal'): void {
    this.pasoModalResultados = 1;
    this.resultadoManualSeleccionado = null;
    this.busquedaVotoHibrido = '';
    this.filtroVotoHibrido = 'todos';
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

  // =====================
  // Funcionalidad de voto hibrido
  // =====================

  agruparYFiltrarVotosHibridos(): void {
    const normalizados = this.votosHibridos
      .filter((voto) => {
        const coincideBusqueda =
          this.busquedaVotoHibrido.trim().length === 0 ||
          voto.usuario.nombre
            .toLowerCase()
            .includes(this.busquedaVotoHibrido.toLowerCase());

        const coincideFiltro =
          this.filtroVotoHibrido === 'todos' ||
          (this.filtroVotoHibrido === 'sinvoto' && !voto.opcion) ||
          voto.opcion === this.filtroVotoHibrido;

        return coincideBusqueda && coincideFiltro;
      })
      .sort((a, b) => a.usuario.nombre.localeCompare(b.usuario.nombre));

    const agrupados = new Map<string, any[]>();
    for (const voto of normalizados) {
      const grupoNombre = voto.usuario.grupoUsuario?.nombre || 'Otros';
      if (!agrupados.has(grupoNombre)) {
        agrupados.set(grupoNombre, []);
      }
      agrupados.get(grupoNombre)!.push(voto);
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
    ).sort((a, b) => {
      const indexA = ordenGrupos.indexOf(a.grupo);
      const indexB = ordenGrupos.indexOf(b.grupo);
      return indexA - indexB;
    });
  }

  cambiarFiltroVotoHibrido(
    filtro: 'todos' | 'afavor' | 'encontra' | 'abstencion' | 'sinvoto'
  ): void {
    this.filtroVotoHibrido = filtro;
    this.agruparYFiltrarVotosHibridos();
  }

  actualizarBusquedaVotoHibrido(valor: string): void {
    this.busquedaVotoHibrido = valor;
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

    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';

    const backdrops = document.getElementsByClassName('modal-backdrop');
    while (backdrops[0]) {
      backdrops[0].parentNode?.removeChild(backdrops[0]);
    }

    if (form) form.reset(); // ✅ solo el form
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

  // =====================
  // Flujo de pasos del modal de resultados
  // =====================
  irAPasoConfirmarAutomatico() {
    this.pasoModalResultados = 2;
  }

  irAPasoManual() {
    this.pasoModalResultados = 3;
  }

  irAPasoConfirmacion() {
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

  irAPasoHibrido() {
    if (!this.puntoUsuarios?.length) return;

    // Clonar con opción por defecto 'afavor'
    this.votosHibridos = this.puntoUsuarios.map((pu) => ({
      idUsuario: pu.usuario.id_usuario,
      votante: this.usuario.id_usuario,
      punto: this.puntoSeleccionado.id_punto,
      opcion: 'afavor',
      es_razonado: false,
      usuario: { ...pu.usuario }, // clonar todo el objeto usuario, incluyendo grupoUsuario
    }));

    this.agruparYFiltrarVotosHibridos(); // ⚡ fuerza el agrupamiento inicial

    this.pasoModalResultados = 5;
    console.log('idPuntoSeleccionado:', this.puntoSeleccionado.id_punto);
    console.log('Votos híbridos inicializados:', this.votosHibridos);
    console.log('puntoUsuarios:', this.puntoUsuarios);
  }

  goBack() {
    this.location.back();
  }
}
