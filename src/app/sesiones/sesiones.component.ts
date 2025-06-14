// =======================
// SesionesComponent
// Componente encargado de listar, crear y editar sesiones.
// Incluye filtrado por estado, navegación y formularios reactivos.
// =======================

// Importaciones Angular y Comunes
import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

// Componentes
import { BarraSuperiorComponent } from '../barra-superior/barra-superior.component';

// Servicios
import { SesionService } from '../services/sesion.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sesiones',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BarraSuperiorComponent,
  ],
  templateUrl: './sesiones.component.html',
  styleUrls: ['./sesiones.component.css'],
})
export class SesionesComponent implements OnInit {

  // =======================
  // Propiedades públicas
  // =======================

  busqueda: string = '';
  sesiones: any[] = [];
  sesionesFiltradas: any[] = [];
  estadoActual: boolean | null = null;
  sesionesCargadas: boolean = false;

  // =======================
  // Constructor
  // =======================
  constructor(
    private sesionService: SesionService,
    private location: Location,
    private router: Router,
    private toastrService: ToastrService
  ) {}

  // =======================
  // Formularios
  // =======================

  modificarSesionForm = new FormGroup({
    idSesion: new FormControl('', Validators.required),
    nombre: new FormControl('', Validators.required),
    codigo: new FormControl('', Validators.required),
    fecha_inicio: new FormControl('', Validators.required),
    tipo: new FormControl('', Validators.required),
    estado: new FormControl(''),
  });

  crearSesionForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
    codigo: new FormControl('', Validators.required),
    fecha_inicio: new FormControl('', Validators.required),
    tipo: new FormControl('', Validators.required),
  });

  // =======================
  // Ciclo de vida
  // =======================

  ngOnInit(): void {
    this.getSesiones();
    this.cambiarGrupo(null);
    console.log(`estado actual al iniciar: ${this.estadoActual}`);
  }

  // =======================
  // Carga y filtrado de datos
  // =======================

  getSesiones() {
    const query = 'status=1';
    const relations = [''];
    this.sesionService.getAllDataBy(query, relations).subscribe((data: any) => {
      this.sesiones = data;
      this.sesionesCargadas = true;
      this.cambiarGrupo(null);
    });
  }

  cambiarGrupo(estado: any) {
    this.estadoActual = estado;
    if (this.sesionesCargadas) {
      this.filtrarSesiones();
    }
  }

  filtrarSesiones() {
    console.log('Estado actual: ', this.estadoActual);

    this.sesionesFiltradas = this.sesiones.filter(
      (sesion) =>
        (this.estadoActual === null || sesion.estado === this.estadoActual) &&
        (sesion.nombre!.toLowerCase().includes(this.busqueda.toLowerCase()) ||
         sesion.codigo!.includes(this.busqueda))
    );

    console.log('Sesiones filtradas: ', this.sesionesFiltradas);
  }

  // =======================
  // Navegación
  // =======================

  irADetalleSesion(id: number) {
    if (id) {
      this.router.navigate(['/sesion', id.toString()]);
    } else {
      console.error(`ID de sesión no definido: ${id}`);
    }
  }

  // =======================
  // Operaciones CRUD
  // =======================

  abrirEditar(sesion: any) {
    this.modificarSesionForm.setValue({
      idSesion: sesion.id_sesion,
      nombre: sesion.nombre,
      codigo: sesion.codigo,
      fecha_inicio: sesion.fecha_inicio.substring(0, 10),
      tipo: sesion.tipo,
      estado: sesion.estado,
    });
  }

  editarSesion() {
    const sesionData: any = {
      id_sesion: parseInt(this.modificarSesionForm.value.idSesion!),
      nombre: this.modificarSesionForm.value.nombre,
      codigo: this.modificarSesionForm.value.codigo,
      fecha_inicio: this.modificarSesionForm.value.fecha_inicio,
      tipo: this.modificarSesionForm.value.tipo,
    };

    this.sesionService.saveData(sesionData).subscribe({
      next: () => {
        this.toastrService.success('Sesión actualizada con éxito.');
        this.getSesiones();
        this.cerrarModal('exampleModal', this.modificarSesionForm);
      },
      error: (err) => {
        console.error(err);
        this.toastrService.error('Error al actualizar la sesión.', err);
      },
    });
  }

  crearSesion() {
    const sesionData: any = {
      nombre: this.crearSesionForm.value.nombre,
      codigo: this.crearSesionForm.value.codigo,
      fecha_inicio: this.crearSesionForm.value.fecha_inicio,
      tipo: this.crearSesionForm.value.tipo,
    };

    this.sesionService.saveData(sesionData).subscribe({
      next: () => {
        this.toastrService.success('Sesión creada con éxito.');
        this.getSesiones();
        this.cerrarModal('crearSesionModal', this.crearSesionForm);
      },
      error: (err) => {
        console.error(err);
        this.toastrService.error('Error al crear la sesión.', err);
      },
    });
  }

  // =======================
  // Utilidades
  // =======================

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

  goBack() {
    this.location.back();
  }
}
