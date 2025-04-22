import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { PuntoService } from '../services/punto.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SesionService } from '../services/sesion.service';
import { Location } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BarraSuperiorComponent } from '../barra-superior/barra-superior.component';
import { IPunto } from '../interfaces/IPunto';
import { ISesion } from '../interfaces/ISesion';
import { ToastrService } from 'ngx-toastr';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
  CdkDropList,
  CdkDrag,
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-sesion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BarraSuperiorComponent,
    DragDropModule,
  ],
  templateUrl: './sesion.component.html',
  styleUrl: './sesion.component.css',
})
export class SesionComponent implements OnInit {
  puntos: IPunto[] = [];
  idSesion: number | null = 0;
  sesion: ISesion | undefined;

  scrollSpeed = 0;
  scrollInterval: any;
  dragActivo = false;

  @ViewChild(CdkDropList) dropListRef!: CdkDropList<any>;
  @ViewChild(CdkDrag) dragRef!: CdkDrag<any>;

  constructor(
    private puntoService: PuntoService,
    private router: Router,
    private sesionService: SesionService,
    private route: ActivatedRoute,
    private location: Location,
    private toastrService: ToastrService
  ) {}

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

  ngOnInit(): void {
    this.idSesion = parseInt(this.route.snapshot.paramMap.get('id')!);
    this.getPuntos();
    this.getSesion();
  }

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

  irAVotacion(id: number) {
    this.navegarA('votacion', id);
  }

  irAVotantes(idSesion: number, idPunto: number) {
    if (idSesion && idPunto) {
      this.router.navigate([`/votantes`, idSesion, idPunto]);
    } else {
      console.error(`ID no definido: ${idSesion} y ${idPunto}`);
    }
  }

  irAPunto(idSesion: number, idPunto: number) {
    if (idSesion && idPunto) {
      this.router.navigate([`/punto`, idSesion, idPunto]);
    } else {
      console.error(`ID no definido: ${idSesion} y ${idPunto}`);
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

  navegarA(ruta: string, id: number) {
    if (id) {
      this.router.navigate([`/${ruta}`, id]);
    } else {
      console.error(`ID no definido: ${id}`);
    }
  }

  abrirEditar(punto: any) {
    this.modificarPuntoForm.setValue({
      idPunto: punto.id_punto,
      nombre: punto.nombre,
      detalle: punto.detalle,
      estado: punto.status,
    });
  }

  editarPunto() {
    const puntoData: any = {
      id_punto: parseInt(this.modificarPuntoForm.value.idPunto!),
      nombre: this.modificarPuntoForm.value.nombre,
      detalle: this.modificarPuntoForm.value.detalle,
      estado: this.modificarPuntoForm.value.estado,
    };

    this.puntoService.saveData(puntoData).subscribe(
      (response) => {
        this.toastrService.success('Punto actualizado con éxito.');
        this.getPuntos();
        this.cerrarModal('exampleModal', this.modificarPuntoForm);
      },
      (error) => {
        console.error(error);
        this.toastrService.error('Error al actualizar el punto.', error);
      }
    );
  }

  crearPunto() {
    const puntoData: any = {
      idSesion: this.idSesion,
      nombre: this.crearPuntoForm.value.nombre,
      detalle: this.crearPuntoForm.value.detalle,
      es_administrativa: this.crearPuntoForm.value.es_administrativa,
    };

    this.puntoService.crearPunto(puntoData).subscribe(
      (response) => {
        this.toastrService.success('Punto creado con éxito.');
        this.getPuntos();
        this.cerrarModal('crearPuntoModal', this.crearPuntoForm);
      },
      (error) => {
        console.error(error);
        this.toastrService.error('Error al crear el punto.', error);
      }
    );
  }

  reordenar(event: CdkDragDrop<any[]>) {
    if (!event || event.previousIndex === event.currentIndex) return;

    const puntoMovido = this.puntos[event.previousIndex];
    const puntoDestino = this.puntos[event.currentIndex];

    const posicionInicialOrden = puntoMovido.orden;
    const posicionFinalOrden = puntoDestino.orden;

    moveItemInArray(this.puntos, event.previousIndex, event.currentIndex);

    const data = {
      idPunto: puntoMovido.id_punto,
      posicionInicial: posicionInicialOrden,
      posicionFinal: posicionFinalOrden,
    };

    this.puntoService.reordenarPuntos(data).subscribe({
      next: () => {
        this.toastrService.success('Punto reordenado correctamente');
        this.puntos.forEach((punto, index) => {
          punto.orden = index + 1;
        });
      },
      error: (error) => {
        moveItemInArray(this.puntos, event.currentIndex, event.previousIndex);
        this.toastrService.error(
          error?.error?.message || 'Error al reordenar',
          'Error'
        );
      },
    });
  }

  actualizarPlaceholder() {
    if (!this.dragActivo || !this.dropListRef || !this.dragRef) return;

    const dropListInternal = (this.dropListRef as any)._dropListRef;
    const dragInternal = (this.dragRef as any)._dragRef;

    if (dropListInternal && dragInternal) {
      dropListInternal.enter(dragInternal);
    }
  }

  resetForm(form: FormGroup) {
    form.reset();
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

    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';

    const backdrops = document.getElementsByClassName('modal-backdrop');
    while (backdrops[0]) {
      backdrops[0].parentNode?.removeChild(backdrops[0]);
    }

    form.reset();
  }

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
    this.stopAutoScroll(); // 🛑 Detener cualquier scroll que haya quedado activo
  }
  

  goBack() {
    this.location.back();
  }
}
