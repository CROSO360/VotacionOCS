import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PuntoService } from '../services/punto.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SesionService } from '../services/sesion.service';
import { Location } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BarraSuperiorComponent } from '../barra-superior/barra-superior.component';
import { IPunto } from '../interfaces/IPunto';
import { ISesion } from '../interfaces/ISesion';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sesion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, BarraSuperiorComponent],
  templateUrl: './sesion.component.html',
  styleUrl: './sesion.component.css'
})
export class SesionComponent implements OnInit {

  puntos: IPunto[] = [];
  idSesion: number | null = 0;
  sesion: ISesion | undefined;

  constructor(
    private puntoService: PuntoService,
    private router: Router,
    private sesionService: SesionService,
    private route: ActivatedRoute,
    private location: Location,
    private toastrService: ToastrService // Se añade ToastrService
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
  });
  

  ngOnInit(): void {
    this.idSesion = parseInt(this.route.snapshot.paramMap.get('id')!);
    this.getPuntos();
    this.getSesion();

    // Verificar el estado del formulario
  console.log('Estado inicial del formulario de creación:', this.crearPuntoForm.value);
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

  irAResultados(id: number) {
    this.navegarA('resultados', id);
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
      estado: this.modificarPuntoForm.value.estado
    };

    this.puntoService.saveData(puntoData).subscribe(
      (response) => {
        console.log(response);
        this.toastrService.success('Punto actualizado con éxito.');
        this.getPuntos(); // Actualizar la lista de puntos
        //this.resetForm(this.modificarPuntoForm); // Resetear el formulario después de la edición
        this.cerrarModal('exampleModal',this.modificarPuntoForm)
      },
      (error) => {
        console.error(error);
        this.toastrService.error('Error al actualizar el punto.', error);
      }
    );
  }

  crearPunto() {
    console.log('Datos del formulario de creación:', this.crearPuntoForm.value);
    const puntoData: any = {
      sesion: {
        id_sesion: this.idSesion
      },
      nombre: this.crearPuntoForm.value.nombre,
      detalle: this.crearPuntoForm.value.detalle,
    };

    this.puntoService.saveData(puntoData).subscribe(
      (response) => {
        console.log(response);
        this.toastrService.success('Punto creado con éxito.');
        this.getPuntos(); // Actualizar la lista de puntos
        //this.resetForm(this.crearPuntoForm); // Resetear el formulario después de la creación
        this.cerrarModal('crearPuntoModal',this.crearPuntoForm);
      },
      (error) => {
        console.error(error);
        this.toastrService.error('Error al crear el punto.', error);
      }
    );
  }

  resetForm(form: FormGroup) {
    form.reset();
  }
//dayana balcazar y hector lino sistema de votacion con biometrico 
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
    form.reset();
  }

  goBack() {
    this.location.back();
  }
}
