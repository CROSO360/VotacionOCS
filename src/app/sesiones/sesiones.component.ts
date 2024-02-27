import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BarraSuperiorComponent } from '../barra-superior/barra-superior.component';
import { SesionService } from '../services/sesion.service';
import { Router } from '@angular/router';

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
  styleUrl: './sesiones.component.css',
})
export class SesionesComponent implements OnInit {
  busqueda: string = '';
  sesiones: any[] = [];
  sesionesFiltradas: any[] = [];
  estadoActual: boolean | null = null;

  sesionesCargadas: boolean = false;

  constructor(
    private sesionService: SesionService,
    private location: Location,
    private router: Router,
  ) {}

  modificarSesionForm = new FormGroup({
    idSesion: new FormControl('',Validators.required),
    nombre: new FormControl('',Validators.required),
    codigo: new FormControl('',Validators.required),
    fecha: new FormControl('',Validators.required),
    tipo: new FormControl('',Validators.required),
    oficio: new FormControl('',Validators.required),
    estado: new FormControl(''),
  });

  crearSesionForm = new FormGroup({
    nombre: new FormControl('',Validators.required),
    codigo: new FormControl('',Validators.required),
    fecha: new FormControl('',Validators.required),
    tipo: new FormControl('',Validators.required),
    oficio: new FormControl(''),
  });

  ngOnInit(): void {
    this.getSesiones();
    this.cambiarGrupo(null);
    console.log(`estado actual al iniciar: ${this.estadoActual}`);
    
  }

  getSesiones() {
    const query = '';
    const relations = [''];
    this.sesionService.getAllDataBy(query, relations).subscribe((data: any) => {
      this.sesiones = data;
      this.sesionesCargadas = true; // Marcar que las sesiones se han cargado
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

  irADetalleSesion(id: number){
    if (id) {
      const idString = id.toString();
      this.router.navigate(['/sesion', idString]);
    } else {
      console.error(`ID de sesión no definido: ${id} lol`);
    }
  }

  abrirEditar(sesion: any) {
    
      this.modificarSesionForm.setValue({
        idSesion: sesion.id_sesion,
        nombre: sesion.nombre,
        codigo: sesion.codigo,
        fecha: sesion.fecha.substring(0,10),
        tipo: sesion.tipo,
        oficio: sesion.oficio,
        estado: sesion.estado,
      });
  }  
  
  editarSesion(){

    const sesionData: any ={
      id_sesion: parseInt(this.modificarSesionForm.value.idSesion!),
      nombre: this.modificarSesionForm.value.nombre,
      codigo: this.modificarSesionForm.value.codigo,
      fecha: this.modificarSesionForm.value.fecha,
      tipo: this.modificarSesionForm.value.tipo,
      oficio: this.modificarSesionForm.value.oficio,
      estado: this.modificarSesionForm.value.estado
    }

    this.sesionService.saveData(sesionData).subscribe((response)=>{
      console.log(response);
    });

    window.location.reload(); 
    
  }

  crearSesion() {

    const sesionData: any ={
      nombre: this.crearSesionForm.value.nombre,
      codigo: this.crearSesionForm.value.codigo,
      fecha: this.crearSesionForm.value.fecha,
      tipo: this.crearSesionForm.value.tipo,
      oficio: this.crearSesionForm.value.oficio,
    }

    this.sesionService.saveData(sesionData).subscribe((response)=>{
      console.log(response);
    })

    window.location.reload(); 

  }

  goBack() {
    this.location.back();
  }
}
