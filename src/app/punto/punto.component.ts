import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { BarraSuperiorComponent } from '../barra-superior/barra-superior.component';

// Librerías externas
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-punto',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BarraSuperiorComponent,
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

  // =====================
  // Formularios reactivos
  // =====================
  modificarPuntoForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
    detalle: new FormControl('', Validators.required),
    es_administrativa: new FormControl('')
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
  ) {}

  // =====================
  // Inicialización
  // =====================
  ngOnInit(): void {
    this.puntoId = parseInt(this.route.snapshot.paramMap.get('idPunto')!, 10);
    this.sesionId = parseInt(this.route.snapshot.paramMap.get('idSesion')!, 10);

    this.getUsuario();
    this.getSesion();
    this.getPunto();
    this.getPuntoDocumentos();
    this.getResolucion();
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
        es_administrativa: this.punto.es_administrativa
      });
    });
  }

  editarPunto() {
    const puntoData: any = {
      id_punto: this.puntoId,
      nombre: this.modificarPuntoForm.value.nombre,
      detalle: this.modificarPuntoForm.value.detalle,
      es_administrativa: this.modificarPuntoForm.value.es_administrativa,
    };

    this.puntoService.saveData(puntoData).subscribe(
      (response) => {
        console.log(response);
        this.toastrService.success('Punto actualizado con éxito.');
        this.getPunto(); // Actualizar el punto
      },
      (error) => {
        console.error(error);
        this.toastrService.error('Error al actualizar el punto.', error);
      }
    );
  }

  formularioPuntoModificado(): boolean {
    return this.modificarPuntoForm.value.nombre !== this.punto?.nombre ||
           this.modificarPuntoForm.value.detalle !== this.punto?.detalle ||
           this.modificarPuntoForm.value.es_administrativa !== this.punto?.es_administrativa;
  }

  // =====================
  // Gestión de documentos del punto
  // =====================
  getPuntoDocumentos() {
    const query = `punto.id_punto=${this.puntoId}`;
    const relations = ['documento'];
    this.puntoDocumentoService.getAllDataBy(query, relations).subscribe((data) => {
      this.puntoDocumentos = data;
    });
  }

  abrirDocumento(documento: IDocumento) {
    window.open(documento.url, '_blank');
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.subirDocumento(input.files[0]);
    }
  }

  subirDocumento(documento: File) {
    this.documentoService.subirDocumento(documento).subscribe((data) => {
      const puntoDocumentoData: IPuntoDocumento = {
        punto: { id_punto: this.puntoId },
        documento: { id_documento: data.id_documento },
      };
      this.puntoDocumentoService.saveData(puntoDocumentoData).subscribe(() => {
        this.toastrService.success('Documento subido correctamente');
        this.getPuntoDocumentos();
      });
    });
  }

  eliminarDocumento(id: number) {
    this.documentoService.eliminarDocumento(id).subscribe(() => {
      this.toastrService.success('Documento eliminado correctamente');
      this.getPuntoDocumentos();
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
      error: () => {
        this.toastrService.error('Error al crear la resolución.');
      }
    });
  }

  editarResolucion() {
    if (!this.usuario?.id_usuario) return;

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
      error: () => {
        this.toastrService.error('Error al actualizar la resolución.');
      }
    });
  }

  formularioResolucionModificado(): boolean {
    return this.resolucionForm.value.nombre !== this.resolucion?.nombre ||
           this.resolucionForm.value.descripcion !== this.resolucion?.descripcion;
  }

  // =====================
  // Navegación
  // =====================
  goBack() {
    this.location.back();
  }
}
