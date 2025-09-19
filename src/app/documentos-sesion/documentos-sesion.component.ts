// =======================
// DocumentosSesionComponent
// Componente encargado de visualizar, subir y eliminar documentos asociados a una sesión.
// =======================

// Importaciones Angular y comunes
import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

// Servicios
import { SesionService } from '../services/sesion.service';
import { SesionDocumentoService } from '../services/sesionDocumento.service';
import { DocumentoService } from '../services/documento.service';
import { ToastrService } from 'ngx-toastr';

// Componentes
import { BarraSuperiorComponent } from '../components/barra-superior/barra-superior.component';

// Interfaces
import { ISesion } from '../interfaces/ISesion';
import { ISesionDocumento } from '../interfaces/ISesionDocumento';
import { IDocumento } from '../interfaces/IDocumento';
import { BotonAtrasComponent } from '../components/boton-atras/boton-atras.component';
import { FooterComponent } from '../components/footer/footer.component';
import { finalize, switchMap } from 'rxjs';

@Component({
  selector: 'app-documentos-sesion',
  standalone: true,
  imports: [
    CommonModule,
    BarraSuperiorComponent,
    BotonAtrasComponent,
    FooterComponent,
  ],
  templateUrl: './documentos-sesion.component.html',
  styleUrl: './documentos-sesion.component.css',
})
export class DocumentosSesionComponent {
  // =======================
  // Propiedades
  // =======================
  idSesion: number | null = 0;
  sesion: ISesion | undefined;
  sesionDocumentos: ISesionDocumento[] = [];

  //flags
  eliminandoDocumento: Map<number, boolean> = new Map();
  // Flag de carga
  subiendoDocumento = false;

  // Referencia al <input type="file">
  @ViewChild('archivoInput') archivoInput!: ElementRef<HTMLInputElement>;

  // =======================
  // Constructor
  // =======================
  constructor(
    private sesionDocumentoService: SesionDocumentoService,
    private documentoService: DocumentoService,
    private router: Router,
    private sesionService: SesionService,
    private route: ActivatedRoute,
    private location: Location,
    private toastrService: ToastrService
  ) {}

  // =======================
  // Inicialización del componente
  // =======================
  ngOnInit(): void {
    this.idSesion = parseInt(this.route.snapshot.paramMap.get('id')!);
    this.getSesionDocumentos();
    this.getSesion();
  }

  // =======================
  // Obtener datos de la sesión actual
  // =======================
  getSesion() {
    const query = `id_sesion=${this.idSesion}`;
    this.sesionService.getDataBy(query).subscribe((data) => {
      this.sesion = data;
    });
  }

  // =======================
  // Obtener documentos asociados a la sesión
  // =======================
  getSesionDocumentos() {
    const query = `sesion.id_sesion=${this.idSesion}`;
    const relations = ['documento'];
    this.sesionDocumentoService
      .getAllDataBy(query, relations)
      .subscribe((data) => {
        this.sesionDocumentos = data;
      });
  }

  // =======================
  // Abrir documento en una nueva pestaña
  // =======================
  abrirDocumento(documento: IDocumento) {
    window.open(documento.url, '_blank');
  }

  // =======================
  // Evento al seleccionar un archivo desde el input
  // =======================
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const selectedFile = input.files[0];
      this.subiendoDocumento = true;
      this.subirDocumento(selectedFile);
    }
  }

  // =======================
  //  Subir documento y asociarlo a la sesión
  // =======================
  subirDocumento(documento: File) {
    this.documentoService
      .subirDocumento(documento)
      .pipe(
        switchMap((data) => {
          const sesionDocumentoData: ISesionDocumento = {
            sesion: { id_sesion: this.idSesion },
            documento: { id_documento: data.id_documento },
          };
          return this.sesionDocumentoService.saveData(sesionDocumentoData);
        }),
        finalize(() => {
          // ⬅️ siempre vuelve a la normalidad (éxito o error)
          this.subiendoDocumento = false;
          this.resetInputArchivo();
        })
      )
      .subscribe({
        next: () => {
          this.toastrService.success('Documento subido correctamente');
          this.getSesionDocumentos();
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

  // Limpia el input para permitir volver a elegir el mismo archivo si se desea
  private resetInputArchivo(): void {
    if (this.archivoInput) this.archivoInput.nativeElement.value = '';
  }

  // =======================
  // Eliminar documento por ID
  // =======================
  eliminarDocumento(id: number): void {
    this.eliminandoDocumento.set(id, true);

    this.documentoService.eliminarDocumento(id).subscribe({
      next: () => {
        this.toastrService.success('Documento eliminado correctamente');
        this.getSesionDocumentos();
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

  // =======================
  // Volver a la vista anterior
  // =======================
  goBack() {
    this.location.back();
  }
}
