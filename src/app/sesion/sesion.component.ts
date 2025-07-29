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

  @ViewChild(CdkDropList) dropListRef!: CdkDropList<any>;
  @ViewChild(CdkDrag) dragRef!: CdkDrag<any>;

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
  }

  // =======================
  // Carga de datos
  // =======================
  getPuntos() {
    const query = `sesion.id_sesion=${this.idSesion}`;
    const relations = ['sesion'];
    this.puntoService.getAllDataBy(query, relations).subscribe((data) => {
      this.puntos = data;
    });
  }

  getSesion() {
    const query = `id_sesion=${this.idSesion}`;
    this.sesionService.getDataBy(query).subscribe((data) => {
      this.sesion = data;
    });
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
}
