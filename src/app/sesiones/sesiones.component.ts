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

import { Modal } from 'bootstrap'; // asegúrate que bootstrap está instalado

// Componentes
import { BarraSuperiorComponent } from '../components/barra-superior/barra-superior.component';

// Servicios
import { SesionService } from '../services/sesion.service';
import { ToastrService } from 'ngx-toastr';
import { BotonAtrasComponent } from '../components/boton-atras/boton-atras.component';
import { FooterComponent } from "../components/footer/footer.component";

@Component({
  selector: 'app-sesiones',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BarraSuperiorComponent,
    BotonAtrasComponent,
    FooterComponent
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

  tipoSesionActual: string | null = null;

  codigoOriginalSesion: string | null = null;

  // =======================
  // Flags
  // =======================

  editandoSesion = false;

  guardandoSesion = false;

  crearModalRef: any;
  editarModalRef: any;

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
    //console.log(`estado actual al iniciar: ${this.estadoActual}`);

    const crearModalEl = document.getElementById('crearSesionModal');
    const editarModalEl = document.getElementById('modalEditarSesion');

    if (crearModalEl) this.crearModalRef = new Modal(crearModalEl);
    if (editarModalEl) this.editarModalRef = new Modal(editarModalEl);
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

  cambiarTipoSesion(tipo: string | null): void {
    this.tipoSesionActual = tipo;
    this.filtrarSesiones(); // Vuelve a aplicar filtros combinados
  }

  filtrarSesiones() {
    this.sesionesFiltradas = this.sesiones.filter(
      (sesion) =>
        (this.estadoActual === null || sesion.estado === this.estadoActual) &&
        (this.tipoSesionActual === null ||
          sesion.tipo === this.tipoSesionActual) &&
        (sesion.nombre!.toLowerCase().includes(this.busqueda.toLowerCase()) ||
          sesion.codigo!.includes(this.busqueda))
    );
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

  revertirCodigoSesion(formulario: FormGroup): void {
    if (this.codigoOriginalSesion) {
      formulario.get('codigo')?.setValue(this.codigoOriginalSesion);
      formulario.get('codigo')?.markAsDirty();
      this.toastrService.info('Código revertido al valor original.');
    }
  }

  abrirEditar(sesion: any) {
    this.modificarSesionForm.reset();

    const fechaBD = sesion.fecha_inicio; // "2025-05-26 06:50:19"
    const fechaLocal = fechaBD.replace(' ', 'T').slice(0, 16);

    this.modificarSesionForm.setValue({
      idSesion: sesion.id_sesion,
      nombre: sesion.nombre,
      codigo: sesion.codigo,
      fecha_inicio: fechaLocal,
      tipo: sesion.tipo,
      estado: sesion.estado,
    });

    if (this.editarModalRef) {
      this.editarModalRef.show();
    }
  }

  editarSesion() {
    if (this.modificarSesionForm.invalid) return;

    const sesionData: any = {
      id_sesion: parseInt(this.modificarSesionForm.value.idSesion!),
      nombre: this.modificarSesionForm.value.nombre,
      codigo: this.modificarSesionForm.value.codigo,
      fecha_inicio: this.modificarSesionForm.value.fecha_inicio,
      tipo: this.modificarSesionForm.value.tipo,
    };

    this.editandoSesion = true;

    this.sesionService.saveData(sesionData).subscribe({
      next: () => {
        this.toastrService.success('Sesión actualizada con éxito.');
        this.getSesiones();
        this.cerrarModal('modalEditarSesion', this.modificarSesionForm);
      },
      error: (err) => {
        console.error(err);
        this.toastrService.error(
          'Error al actualizar la sesión.',
          err.error.message
        );
        this.editandoSesion = false;
      },
      complete: () => {
        this.editandoSesion = false;
      },
    });
  }

  abrirCrearSesion() {
    if (this.crearModalRef) this.crearModalRef.show();
  }

  crearSesion() {
    if (this.crearSesionForm.invalid) return;

    const sesionData: any = {
      nombre: this.crearSesionForm.value.nombre,
      codigo: this.crearSesionForm.value.codigo,
      fecha_inicio: this.crearSesionForm.value.fecha_inicio,
      tipo: this.crearSesionForm.value.tipo,
    };

    this.guardandoSesion = true;

    this.sesionService.saveData(sesionData).subscribe({
      next: () => {
        this.toastrService.success('Sesión creada con éxito.');
        this.getSesiones();
        this.cerrarModal('crearSesionModal', this.crearSesionForm);
      },
      error: (err) => {
        console.error(err);
        this.toastrService.error(
          'Error al crear la sesión.',
          err.error.message
        );
        this.guardandoSesion = false;
      },
      complete: () => {
        this.guardandoSesion = false;
      },
    });
  }

  generarCodigoSesion(formulario: FormGroup): void {
    this.sesionService.generarCodigo().subscribe({
      next: (res) => {
        const campo = formulario.get('codigo');
        if (campo) {
          campo.setValue(res.codigo);
          campo.markAsDirty();
        } else {
          this.toastrService.warning(
            'No se encontró el campo de código en el formulario.'
          );
        }
      },
      error: () => {
        this.toastrService.error('Error al generar código de sesión.');
      },
    });
  }

  // =======================
  // Utilidades
  // =======================

  cerrarModal(modalId: string, form: FormGroup) {
    if (modalId === 'crearSesionModal' && this.crearModalRef) {
      this.crearModalRef.hide();
    } else if (modalId === 'modalEditarSesion' && this.editarModalRef) {
      this.editarModalRef.hide();
    }

    form.reset();
  }

  goBack() {
    this.location.back();
  }
}
