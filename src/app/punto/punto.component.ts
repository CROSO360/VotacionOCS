import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { jwtDecode } from 'jwt-decode';

// Servicios
import { PuntoService } from '../services/punto.service';
import { SesionService } from '../services/sesion.service';
import { ResolucionService } from '../services/resolucion.service';
import { DocumentoService } from '../services/documento.service';
import { PuntoDocumentoService } from '../services/puntoDocumento.service';
import { UsuarioService } from '../services/usuario.service';

// Interfaces
import { IPuntoDocumento } from '../interfaces/IPuntoDocumento';
import { IDocumento } from '../interfaces/IDocumento';
import { IResolucion } from '../interfaces/IResolucion';
import { IUsuario } from '../interfaces/IUsuario';

// Componentes
import { BarraSuperiorComponent } from '../components/barra-superior/barra-superior.component';

// Librerías externas
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { BotonAtrasComponent } from '../components/boton-atras/boton-atras.component';
import { FooterComponent } from '../components/footer/footer.component';
import { distinctUntilChanged, finalize, map, switchMap } from 'rxjs';


@Component({
  selector: 'app-punto',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BarraSuperiorComponent,
    BotonAtrasComponent,
    FooterComponent,
  ],
  templateUrl: './punto.component.html',
  styleUrl: './punto.component.css',
})
export class PuntoComponent {
  // =====================
  // Propiedades principales
  // =====================
  punto: any | undefined;
  puntoId: number | undefined;
  sesionId: number | undefined;
  sesion: any | undefined;
  resolucion: IResolucion | undefined;
  puntoDocumentos: IPuntoDocumento[] = [];
  usuario: IUsuario | undefined;

  payload: any = jwtDecode(this.cookieService.get('token'));

  //flags
  guardandoPunto = false;
  guardandoResolucion = false;
  eliminandoDocumento: Map<number, boolean> = new Map();
  subiendoDocumento = false;
  eliminandoPunto = false;


  @ViewChild('archivoInput') archivoInput!: ElementRef<HTMLInputElement>;

  // =====================
  // Formularios reactivos
  // =====================
  modificarPuntoForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
    detalle: new FormControl('', Validators.required),
    es_administrativa: new FormControl(''),
    calculo_resultado: new FormControl('', Validators.required),
  });

  resolucionForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
    descripcion: new FormControl('', Validators.required),
  });

  // =====================
  // Constructor e inyección de dependencias
  // =====================
  constructor(
    private puntoService: PuntoService,
    private sesionService: SesionService,
    private resolucionService: ResolucionService,
    private documentoService: DocumentoService,
    private puntoDocumentoService: PuntoDocumentoService,
    private usuarioService: UsuarioService,
    private route: ActivatedRoute,
    private location: Location,
    private toastrService: ToastrService,
    private cookieService: CookieService,
    private router: Router,
  ) {}

  // =====================
  // Inicialización
  // =====================
  ngOnInit(): void {
    // Cargar info del usuario 1 sola vez
    this.getUsuario();

    // Reaccionar a cambios de /punto/:idSesion/:idPunto
    this.route.paramMap
      .pipe(
        map(pm => ({
          idSesion: Number(pm.get('idSesion')),
          idPunto:  Number(pm.get('idPunto')),
        })),
        // Evita recargar si llegan params iguales
        distinctUntilChanged(
          (a, b) => a.idSesion === b.idSesion && a.idPunto === b.idPunto
        ),
      )
      .subscribe(({ idSesion, idPunto }) => {
        this.sesionId = idSesion;
        this.puntoId = idPunto;
        this.cargarTodoDelPunto();
      });
  }
  cargarTodoDelPunto() {
    if (!this.sesionId || !this.puntoId) return;

    this.getSesion();            // depende de this.sesionId
    this.getPunto();             // depende de this.puntoId
    this.getPuntoDocumentos();   // depende de this.puntoId
    this.getResolucion();        // depende de this.puntoId
  }

  // =====================
  // Usuario actual
  // =====================
  getUsuario() {
    const query = `codigo=${this.payload.codigo}`;
    this.usuarioService.getDataBy(query).subscribe((data) => {
      this.usuario = data;
    });
  }

  // =====================
  // Datos de sesión
  // =====================
  getSesion() {
    const query = `id_sesion=${this.sesionId}`;
    this.sesionService.getDataBy(query).subscribe((data) => {
      this.sesion = data;
      if (!data.estado) {
        this.modificarPuntoForm.disable();
        this.resolucionForm.disable();
      }
    });
  }

  // =====================
  // Gestión de punto
  // =====================
  getPunto() {
    const query = `id_punto=${this.puntoId}`;
    this.puntoService.getDataBy(query).subscribe((data) => {
      this.punto = data;
      this.modificarPuntoForm.patchValue({
        nombre: this.punto.nombre,
        detalle: this.punto.detalle,
        es_administrativa: this.punto.es_administrativa,
        calculo_resultado: this.punto.calculo_resultado,
      });
    });
  }

  editarPunto() {
    this.guardandoPunto = true;

    const puntoData: any = {
      id_punto: this.puntoId,
      nombre: this.modificarPuntoForm.value.nombre,
      detalle: this.modificarPuntoForm.value.detalle,
      es_administrativa: this.modificarPuntoForm.value.es_administrativa,
      calculo_resultado: this.modificarPuntoForm.value.calculo_resultado,
    };

    this.puntoService.saveData(puntoData).subscribe({
      next: (response) => {
        this.toastrService.success('Punto actualizado con éxito.');
        this.getPunto();
      },
      error: (error) => {
        this.toastrService.error(
          'Error al actualizar el punto.',
          error.error.message
        );
        this.guardandoPunto = false;
      },
      complete: () => {
        this.guardandoPunto = false;
      },
    });
  }

  formularioPuntoModificado(): boolean {
    return (
      this.modificarPuntoForm.value.nombre !== this.punto?.nombre ||
      this.modificarPuntoForm.value.detalle !== this.punto?.detalle ||
      this.modificarPuntoForm.value.es_administrativa !==
        this.punto?.es_administrativa
    );
  }
  
  eliminarPuntoConfirmado(): void {
    if (!this.puntoId) return;

    const ok = window.confirm(
      '¿Estás seguro de eliminar este punto? Esta acción no se puede deshacer.'
    );
    if (!ok) return;

    this.eliminarPunto();
  }

  private eliminarPunto(): void {
    this.eliminandoPunto = true;

    this.puntoService.deleteData(this.puntoId!).subscribe({
      next: () => {
        this.toastrService.success('Punto eliminado correctamente.');
        // regresar a la pantalla de sesión
        if (this.sesionId) {
          this.router.navigate(['/sesion', this.sesionId]).catch(() => this.location.back());
        } else {
          this.location.back();
        }
      },
      error: (err) => {
        // el backend puede responder 400 si: sesion no está pendiente,
        // hay resolución con auditorías, etc.
        const msg = err?.error?.message || 'No se pudo eliminar el punto.';
        this.toastrService.error(msg, 'Error');
        this.eliminandoPunto = false;
      },
      complete: () => {
        this.eliminandoPunto = false;
      },
    });
  }

  // =====================
  // Gestión de documentos del punto
  // =====================
  getPuntoDocumentos() {
    const query = `punto.id_punto=${this.puntoId}`;
    const relations = ['documento'];
    this.puntoDocumentoService
      .getAllDataBy(query, relations)
      .subscribe((data) => {
        this.puntoDocumentos = data;
      });
  }

  abrirDocumento(documento: IDocumento) {
    window.open(documento.url, '_blank');
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.subiendoDocumento = true;
      this.subirDocumento(input.files[0]);
    }
  }

  subirDocumento(documento: File) {
    this.documentoService
      .subirDocumento(documento)
      .pipe(
        switchMap((data) => {
          const puntoDocumentoData: IPuntoDocumento = {
            punto: { id_punto: this.puntoId },
            documento: { id_documento: data.id_documento },
          };
          return this.puntoDocumentoService.saveData(puntoDocumentoData);
        }),
        finalize(() => {
          // ⬅️ volver a la normalidad siempre (éxito o error)
          this.subiendoDocumento = false;
          this.resetInputArchivo();
        })
      )
      .subscribe({
        next: () => {
          this.toastrService.success('Documento subido correctamente');
          this.getPuntoDocumentos();
        },
        error: (err) => {
          this.toastrService.error(
            'No se pudo subir el documento',
            err?.error?.message || 'Error'
          );
          this.subiendoDocumento = false;
          this.resetInputArchivo();
        },
      });
  }

  private resetInputArchivo(): void {
    if (this.archivoInput) this.archivoInput.nativeElement.value = '';
  }

  eliminarDocumento(id: number): void {
    this.eliminandoDocumento.set(id, true);

    this.documentoService.eliminarDocumento(id).subscribe({
      next: () => {
        this.toastrService.success('Documento eliminado correctamente');
        this.getPuntoDocumentos();
      },
      error: (err) => {
        this.toastrService.error(
          'No se pudo eliminar el documento',
          err.error.message
        );
        this.eliminandoDocumento.set(id, false);
      },
      complete: () => {
        this.eliminandoDocumento.set(id, false);
      },
    });
  }

  // =====================
  // Gestión de resolución
  // =====================
  getResolucion() {
    const query = `id_punto=${this.puntoId}`;
    this.resolucionService.getDataBy(query).subscribe((data) => {
      this.resolucion = data;
      this.resolucionForm.patchValue({
        nombre: data.nombre,
        descripcion: data.descripcion,
      });
    });
  }

  crearResolucion() {
    this.guardandoResolucion = true;

    const resolucionData: IResolucion = {
      punto: { id_punto: this.puntoId },
      nombre: this.resolucionForm.value.nombre!,
      descripcion: this.resolucionForm.value.descripcion!,
      fecha: new Date(),
    };

    this.resolucionService.saveData(resolucionData).subscribe({
      next: () => {
        this.toastrService.success('Resolución creada con éxito.');
        this.getResolucion();
      },
      error: (err) => {
        this.toastrService.error(
          'Error al crear la resolución.',
          err.error.message
        );
        this.guardandoResolucion = false;
      },
      complete: () => {
        this.guardandoResolucion = false;
      },
    });
  }

  editarResolucion() {
    if (!this.usuario?.id_usuario) return;

    this.guardandoResolucion = true;

    const updateResolucionData = {
      id_punto: this.puntoId,
      id_usuario: this.usuario.id_usuario,
      nombre: this.resolucionForm.value.nombre,
      descripcion: this.resolucionForm.value.descripcion,
    };

    this.resolucionService.updateData(updateResolucionData).subscribe({
      next: () => {
        this.toastrService.success('Resolución actualizada con éxito.');
        this.getResolucion();
      },
      error: (err) => {
        this.toastrService.error(
          'Error al actualizar la resolución.',
          err.error.message
        );
        this.guardandoResolucion = false;
      },
      complete: () => {
        this.guardandoResolucion = false;
      },
    });
  }

  formularioResolucionModificado(): boolean {
    return (
      this.resolucionForm.value.nombre !== this.resolucion?.nombre ||
      this.resolucionForm.value.descripcion !== this.resolucion?.descripcion
    );
  }

  // =====================
  // Navegación
  // =====================
  goBack() {
    this.location.back();
  }
}
