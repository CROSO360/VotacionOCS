// =======================
// SesionComponent
// Componente encargado de gestionar una sesión del OCS.
// Permite crear, editar y reordenar puntos, así como navegar hacia otros módulos relacionados (votación, resultados, documentos, etc.).
// Incluye funcionalidad drag-and-drop y autoscroll para reordenamiento.
// =======================

// =======================
// Importaciones Angular y Comunes
// =======================
import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

// =======================
// Importaciones de Componentes
// =======================
import { BarraSuperiorComponent } from '../components/barra-superior/barra-superior.component';

// =======================
// Importaciones de Interfaces
// =======================
import { IPunto } from '../interfaces/IPunto';
import { ISesion } from '../interfaces/ISesion';

// =======================
// Importaciones de Servicios
// =======================
import { PuntoService } from '../services/punto.service';
import { SesionService } from '../services/sesion.service';
import { ToastrService } from 'ngx-toastr';

import { Modal } from 'bootstrap'; // asegúrate que bootstrap está instalado

// =======================
// Importaciones Drag and Drop (CDK)
// =======================
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
  CdkDropList,
  CdkDrag,
} from '@angular/cdk/drag-drop';
import { BotonAtrasComponent } from '../components/boton-atras/boton-atras.component';
import { FooterComponent } from "../components/footer/footer.component";

@Component({
  selector: 'app-sesion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BarraSuperiorComponent,
    DragDropModule,
    BotonAtrasComponent,
    FooterComponent
],
  templateUrl: './sesion.component.html',
  styleUrl: './sesion.component.css',
})
export class SesionComponent implements OnInit {
  // =======================
  // Propiedades públicas
  // =======================
  puntos: IPunto[] = [];
  idSesion: number | null = 0;
  sesion: ISesion | undefined;

  scrollSpeed = 0;
  scrollInterval: any;
  dragActivo = false;

  crearModalRef: any;

  //flag

  guardandoPunto = false;
  bloqueandoReordenamiento = false;

  showCodigo = false;
  codigoCopiado = false;

  // =======================
  // Propiedades para edición de nombres
  // =======================
  puntoEditando: IPunto | null = null;
  nombreEditando: string = '';
  nombreOriginal: string = '';
  modalEdicionRef: any;
  
  // =======================
  // Confirmación eliminación
  // =======================
  puntoAEliminar: IPunto | null = null;
  eliminarModalRef: any;

  @ViewChild(CdkDropList) dropListRef!: CdkDropList<any>;
  @ViewChild(CdkDrag) dragRef!: CdkDrag<any>;
  @ViewChild('pantallaCompletaModal') pantallaCompletaModal!: any;

  // =======================
  // Formularios reactivos
  // =======================
  modificarPuntoForm = new FormGroup({
    idPunto: new FormControl('', Validators.required),
    nombre: new FormControl('', Validators.required),
    detalle: new FormControl('', Validators.required),
    estado: new FormControl(''),
  });

  crearPuntoForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
    detalle: new FormControl('', Validators.required),
    es_administrativa: new FormControl(''),
    calculo_resultado: new FormControl('', Validators.required),
  });

  // =======================
  // Constructor
  // =======================
  constructor(
    private puntoService: PuntoService,
    private router: Router,
    private sesionService: SesionService,
    private route: ActivatedRoute,
    private location: Location,
    private toastrService: ToastrService
  ) {}

  // =======================
  // Ciclo de vida
  // =======================
  ngOnInit(): void {
    this.idSesion = parseInt(this.route.snapshot.paramMap.get('id')!);
    this.getPuntos();
    this.getSesion();

    const crearModalEl = document.getElementById('crearPuntoModal');

    if (crearModalEl) this.crearModalRef = new Modal(crearModalEl);

    const eliminarModalEl = document.getElementById('confirmarEliminarModal');
    if (eliminarModalEl) this.eliminarModalRef = new Modal(eliminarModalEl);
  }

  // =======================
  // Carga de datos
  // =======================
  getPuntos() {
    const query = `sesion.id_sesion=${this.idSesion}`;
    const relations = ['sesion'];
    this.puntoService.getAllDataBy(query, relations).subscribe((data) => {
      this.puntos = data.sort((a: any, b: any) => a.orden - b.orden);
    });
  }

  getSesion() {
    const query = `id_sesion=${this.idSesion}`;
    this.sesionService.getDataBy(query).subscribe((data) => {
      this.sesion = data;
    });
  }

  toggleCodigo(): void {
  this.showCodigo = !this.showCodigo;
}

  // =======================
  // Navegación
  // =======================
  navegarA(ruta: string, id: number) {
    if (id) {
      this.router.navigate([`/${ruta}`, id]);
    } else {
      console.error(`ID no definido: ${id}`);
    }
  }

  irAVotacion(id: number) {
    this.navegarA('votacion', id);
  }

  irAVotantes(idSesion: number, idPunto: number) {
    if (idSesion && idPunto) {
      this.router.navigate([`/votantes`, idSesion, idPunto]);
    }
  }

  irAPunto(idSesion: number, idPunto: number) {
    if (idSesion && idPunto) {
      this.router.navigate([`/punto`, idSesion, idPunto]);
    }
  }

  irAResultados(id: number) {
    this.navegarA('resultados', id);
  }

  irADocumentosSesion(id: number) {
    this.navegarA('documentos-sesion', id);
  }

  irAAsistencia(id: number) {
    this.navegarA('asistencia', id);
  }

  // =======================
  // Creación y Edición de puntos
  // =======================
  abrirEditar(punto: any) {
    this.modificarPuntoForm.setValue({
      idPunto: punto.id_punto,
      nombre: punto.nombre,
      detalle: punto.detalle,
      estado: punto.estado,
    });
  }

  editarPunto() {
    const puntoData: any = {
      id_punto: parseInt(this.modificarPuntoForm.value.idPunto!),
      nombre: this.modificarPuntoForm.value.nombre,
      detalle: this.modificarPuntoForm.value.detalle,
      estado: this.modificarPuntoForm.value.estado,
    };

    this.puntoService.saveData(puntoData).subscribe({
      next: () => {
        this.toastrService.success('Punto actualizado con éxito.');
        this.getPuntos();
        this.cerrarModal('exampleModal', this.modificarPuntoForm);
      },
      error: (error) => {
        this.toastrService.error('Error al actualizar el punto.', error);
      },
    });
  }

  abrirCrearPunto() {
    if (this.crearModalRef) {
      this.crearModalRef.show();
    }
  }

  crearPunto() {
    if (this.crearPuntoForm.invalid) return;

    this.guardandoPunto = true;

    const puntoData: any = {
      idSesion: this.idSesion,
      nombre: this.crearPuntoForm.value.nombre,
      detalle: this.crearPuntoForm.value.detalle,
      es_administrativa: this.crearPuntoForm.value.es_administrativa,
      calculo_resultado: this.crearPuntoForm.value.calculo_resultado,
    };

    this.puntoService.crearPunto(puntoData).subscribe({
      next: () => {
        this.toastrService.success('Punto creado con éxito.');
        this.getPuntos();

        this.cerrarModal('crearPuntoModal', this.crearPuntoForm);

        this.guardandoPunto = false;
      },
      error: (error) => {
        this.toastrService.error('Error al crear el punto.', error);
        this.guardandoPunto = false;
      },
    });
  }

  // =======================
  // Edición de nombres de puntos con modal
  // =======================
  abrirModalEdicion(punto: IPunto) {
    if (!this.sesion?.estado) return;
    
    this.puntoEditando = punto;
    this.nombreEditando = punto.nombre;
    this.nombreOriginal = punto.nombre;
    
    // Abrir el modal
    this.modalEdicionRef = new Modal(document.getElementById('modalEdicionNombre')!);
    this.modalEdicionRef.show();
    
    // Enfocar el textarea después de que se abra el modal
    setTimeout(() => {
      const textarea = document.getElementById('nombrePuntoEdit') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
        this.ajustarAlturaModal({ target: textarea });
      }
    }, 300);
  }

  cerrarModalEdicion() {
    if (this.modalEdicionRef) {
      this.modalEdicionRef.hide();
    }
    this.puntoEditando = null;
    this.nombreEditando = '';
    this.nombreOriginal = '';
  }

  guardarNombreEditado() {
    if (!this.puntoEditando || this.nombreEditando.trim() === '') {
      this.cerrarModalEdicion();
      return;
    }

    if (this.nombreEditando.trim() === this.nombreOriginal) {
      this.cerrarModalEdicion();
      return;
    }

    // Actualizar el punto localmente
    this.puntoEditando.nombre = this.nombreEditando.trim();
    
    // Llamar al servicio para actualizar en el backend
    this.puntoService.saveData({
      ...this.puntoEditando,
      nombre: this.nombreEditando.trim()
    }).subscribe({
      next: () => {
        this.toastrService.success('Nombre del punto actualizado correctamente');
        this.cerrarModalEdicion();
      },
      error: (error) => {
        // Revertir el cambio local si falla
        this.puntoEditando!.nombre = this.nombreOriginal;
        this.toastrService.error('Error al actualizar el nombre del punto');
        this.cerrarModalEdicion();
      }
    });
  }

  ajustarAlturaModal(event: any) {
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  // =======================
  // Eliminación de puntos
  // =======================
  confirmarEliminarPunto(punto: IPunto) {
    if (!this.sesion?.estado) {
      this.toastrService.warning('No se puede eliminar puntos en una sesión inactiva');
      return;
    }

    this.puntoAEliminar = punto;
    if (this.eliminarModalRef) this.eliminarModalRef.show();
  }

  cancelarEliminarPunto() {
    this.puntoAEliminar = null;
    if (this.eliminarModalRef) this.eliminarModalRef.hide();
  }

  ejecutarEliminacionPunto() {
    if (!this.puntoAEliminar) return;

    this.puntoService.deleteData(this.puntoAEliminar.id_punto!).subscribe({
      next: () => {
        this.toastrService.success('Punto eliminado correctamente');
        this.getPuntos();
        this.cancelarEliminarPunto();
      },
      error: (error) => {
        const msg = error?.error?.message || 'Error al eliminar el punto';
        this.toastrService.error(msg, 'Error');
      }
    });
  }

  // =======================
  // Reordenamiento de puntos
  // =======================
  reordenar(event: CdkDragDrop<any[]>) {
    if (!event || event.previousIndex === event.currentIndex) return;

    const puntoMovido = this.puntos[event.previousIndex];
    const puntoDestino = this.puntos[event.currentIndex];

    const data = {
      idPunto: puntoMovido.id_punto,
      posicionInicial: puntoMovido.orden,
      posicionFinal: puntoDestino.orden,
    };

    moveItemInArray(this.puntos, event.previousIndex, event.currentIndex);
    this.bloqueandoReordenamiento = true;

    this.puntoService.reordenarPuntos(data).subscribe({
      next: () => {
        this.toastrService.success('Punto reordenado correctamente');
        this.puntos.forEach((punto, index) => (punto.orden = index + 1));
        this.bloqueandoReordenamiento = false;
      },
      error: (error) => {
        moveItemInArray(this.puntos, event.currentIndex, event.previousIndex);
        this.toastrService.error(
          error?.error?.message || 'Error al reordenar',
          'Error'
        );
        this.bloqueandoReordenamiento = false;
      },
    });
  }

  // =======================
  // Drag & Drop Scroll Automático
  // =======================
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const container = document.querySelector(
      '.points-container'
    ) as HTMLElement;
    if (!container || !this.dragActivo) return;

    const rect = container.getBoundingClientRect();
    const scrollZone = 100;

    if (event.clientY < rect.top + scrollZone) {
      this.startAutoScroll(
        container,
        -1,
        rect.top + scrollZone - event.clientY
      );
    } else if (event.clientY > rect.bottom - scrollZone) {
      this.startAutoScroll(
        container,
        1,
        event.clientY - (rect.bottom - scrollZone)
      );
    } else {
      this.stopAutoScroll();
    }

    this.actualizarPlaceholder();
  }

  startAutoScroll(
    container: HTMLElement,
    direction: number,
    distanceToEdge: number
  ) {
    const maxSpeed = 20;
    this.scrollSpeed = Math.min(maxSpeed, 2 + distanceToEdge / 10);

    if (this.scrollInterval) return;

    this.scrollInterval = setInterval(() => {
      container.scrollTop += this.scrollSpeed * direction;
    }, 20);
  }

  stopAutoScroll() {
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
      this.scrollInterval = null;
    }
  }

  onDragStarted() {
    this.dragActivo = true;
  }

  onDragEnded() {
    this.dragActivo = false;
    this.stopAutoScroll();
  }

  actualizarPlaceholder() {
    if (!this.dragActivo || !this.dropListRef || !this.dragRef) return;

    const dropListInternal = (this.dropListRef as any)._dropListRef;
    const dragInternal = (this.dragRef as any)._dragRef;

    if (dropListInternal && dragInternal) {
      dropListInternal.enter(dragInternal);
    }
  }

  // =======================
  // Utilidades
  // =======================
  resetForm(form: FormGroup) {
    form.reset();
  }

  cerrarModal(modalId: string, form: FormGroup) {
    if (modalId === 'crearPuntoModal' && this.crearModalRef) {
      this.crearModalRef.hide();
    }

    form.reset();
  }

  goBack() {
    this.location.back();
  }

  copiarCodigo(): void {
    if (this.sesion?.codigo) {
      navigator.clipboard.writeText(this.sesion.codigo).then(() => {
        this.codigoCopiado = true;
        this.toastrService.success('Código copiado al portapapeles');
        
        // Resetear el estado después de 2 segundos
        setTimeout(() => {
          this.codigoCopiado = false;
        }, 2000);
      }).catch(() => {
        this.toastrService.error('Error al copiar el código');
      });
    }
  }

  abrirPantallaCompleta(): void {
    if (this.pantallaCompletaModal) {
      const modal = new Modal(this.pantallaCompletaModal.nativeElement);
      modal.show();
      
      // Agregar listener para el botón atrás del navegador
      const handlePopState = () => {
        this.cerrarModalCompletamente();
        window.removeEventListener('popstate', handlePopState);
      };
      
      window.addEventListener('popstate', handlePopState);
      
      // También cerrar el modal cuando se cierre normalmente
      this.pantallaCompletaModal.nativeElement.addEventListener('hidden.bs.modal', () => {
        window.removeEventListener('popstate', handlePopState);
      });
    }
  }

  cerrarModalCompletamente(): void {
    if (this.pantallaCompletaModal) {
      const modal = new Modal(this.pantallaCompletaModal.nativeElement);
      modal.hide();
      
      // Eliminar manualmente el backdrop si existe
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
      
      // Eliminar la clase modal-open del body
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
  }

  verPuntoDesdePantallaCompleta(idSesion: number, idPunto: number): void {
    console.log('Navegando a punto:', idSesion, idPunto);
    
    // Cerrar completamente el modal de pantalla completa
    this.cerrarModalCompletamente();
    
    // Navegar inmediatamente después de cerrar el modal
    setTimeout(() => {
      console.log('Modal cerrado, navegando...');
      this.irAPunto(idSesion, idPunto);
    }, 50); // Tiempo mínimo para asegurar que el DOM se actualice
  }
}
