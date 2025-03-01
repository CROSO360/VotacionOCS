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
import { forkJoin } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { UsuarioService } from '../services/usuario.service';
import { IUsuario } from '../interfaces/IUsuario';

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
    private eRef: ElementRef
  ) {}

  squareElement!: HTMLElement;

  puntos: IPunto[] = [];

  idSesion: number | null = 0;

  sesion: ISesion | undefined;

  puntoUsuarios: any[] = [];

  puntosSeleccionados: IPunto[] = [];

  allPuntosSelected = false;

  showOptions = false;

  puntoSeleccionado: number | undefined;

  puntoUsuarioActual: IPuntoUsuario | undefined;

  usuarioActual: IUsuario | undefined;

  activeDropdown: number | null = null;

  votoManualForm = new FormGroup({
    opcion: new FormControl('', Validators.required),
    razonado: new FormControl(''),
  });

  ngOnInit(): void {
    this.idSesion = parseInt(this.route.snapshot.paramMap.get('id')!);
    this.getPuntos();
    this.getSesion();
    this.webSocketService.onChange().subscribe(async (sape: any) => {
      this.actualizarPuntoUsuario(sape.puntoUsuarioId);
    });
  }

  getPuntos() {
    const query = `sesion.id_sesion=${this.idSesion}`;
    const relations = [`sesion`];
    this.puntoService.getAllDataBy(query, relations).subscribe((data) => {
      this.puntos = data;
      if (this.puntos.length > 0) {
        this.puntoSeleccionado = this.puntos[0].id_punto;
        this.getPuntoUsuarios(this.puntoSeleccionado!);
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
        this.puntoUsuarios = data;
      });
    console.log('puntosUsuarios cargados');
  }

  async onPuntoChange() {
    await this.getPuntoUsuarios(this.puntoSeleccionado!);
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

  finalizarSesion(sesion: ISesion) {
    const observables = this.puntos.map((punto: IPunto) => {
      return this.puntoService.registerResultados({ idPunto: punto.id_punto });
    });

    forkJoin(observables).subscribe(
      () => {
        const sesionData = {
          id_sesion: sesion.id_sesion,
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
      },
      (error) => {
        console.error('Error al registrar resultados de puntos:', error);
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
      squareElement.classList.remove(
        'sin-votar',
        'afavor',
        'encontra',
        'abstinencia'
      );

      if (puntoUsuario.opcion === null) {
        squareElement.classList.add('sin-votar');
      } else if (puntoUsuario.opcion === 'afavor') {
        squareElement.classList.add('afavor');
      } else if (puntoUsuario.opcion === 'encontra') {
        squareElement.classList.add('encontra');
      } else if (puntoUsuario.opcion === 'abstinencia') {
        squareElement.classList.add('abstinencia');
      }

      const buttonElement = squareElement.querySelector('.btn');
      if (buttonElement) {
        buttonElement.classList.remove('noRazonado', 'razonado');
        if (puntoUsuario.es_razonado) {
          buttonElement.classList.add('razonado');
        } else {
          buttonElement.classList.add('noRazonado');
        }
      }
    }
  }

  usuarioVotoManual(idUsuario: number) {
    const query = `id_usuario=${idUsuario}`;
    this.usuarioActual = undefined;
    this.usuarioService.getDataBy(query).subscribe((data) => {
      this.usuarioActual = data;
    });
  }

  votoManual() {
    if (this.puntosSeleccionados.length === 0) {
      console.log('No hay ningun punto seleccionado');
      return;
    } else {
      this.puntosSeleccionados.forEach((e) => {
        let votoData = {
          id_usuario: this.usuarioActual?.id_usuario,
          codigo: this.sesion?.codigo,
          punto: e.id_punto,
          opcion: this.votoManualForm.value.opcion,
          es_razonado: this.votoManualForm.value.razonado,
        };

        this.puntoUsuarioService.saveVote(votoData).subscribe(() => {
          console.log(`solicitud realizada`);
          this.resetForm();
          this.toastr.success('Voto manual registrado correctamente', 'Éxito');
          this.cerrarModal('votoManualModal', this.votoManualForm);
        });
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

  cerrarModal(modalId: string, form: FormGroup) {
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
    event.stopPropagation(); // Evita que el clic se propague al documento
    if (this.activeDropdown === id_punto_usuario) {
      this.activeDropdown = null; // Cierra el dropdown si ya está abierto
    } else {
      this.activeDropdown = id_punto_usuario; // Abre el dropdown específico
    }
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

  reemplazo(puntoUsuario: any) {
    console.log('reemplazo');

    if (puntoUsuario.usuario.usuarioReemplazo) {
      let puntoUsuarioData = {
        id_punto_usuario: puntoUsuario.id_punto_usuario,
        es_principal: !puntoUsuario.es_principal,
      };

      // Actualiza el objeto localmente
      //puntoUsuario.es_principal = !puntoUsuario.es_principal;

      this.puntoUsuarioService.saveData(puntoUsuarioData).subscribe(
        () => {
          console.log('solicitud realizada');
          if (puntoUsuario.es_principal) {
            // Actualiza el objeto localmente
            puntoUsuario.es_principal = !puntoUsuario.es_principal;
            this.toastr.success(
              `Cambio a principal\n${puntoUsuario.usuario.nombre}`,
              'Éxito'
            );
          } else {
            // Actualiza el objeto localmente
            puntoUsuario.es_principal = !puntoUsuario.es_principal;
            this.toastr.success(
              `Cambio a reemplazo\n${puntoUsuario.usuario.usuarioReemplazo.nombre}`,
              `Éxito`
            );
          }
          this.cdr.detectChanges(); // Fuerza la actualización del componente
        },
        (error) => {
          console.error('Error al realizar la solicitud', error);
          // Deshacer el cambio local en caso de error
          puntoUsuario.es_principal = !puntoUsuario.es_principal;
          this.toastr.error('No se pudo realizar el cambio', 'Error');
        }
      );
    } else {
      this.toastr.error(
        `${puntoUsuario.usuario.nombre} no tiene asignado un reemplazo`,
        `Error`
      );
    }
    this.activeDropdown = null;
  }

  goBack() {
    this.location.back();
  }
}
