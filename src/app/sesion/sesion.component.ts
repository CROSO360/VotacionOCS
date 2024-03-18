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

@Component({
  selector: 'app-sesion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, BarraSuperiorComponent],
  templateUrl: './sesion.component.html',
  styleUrl: './sesion.component.css'
})
export class SesionComponent implements OnInit{

  constructor(
    private puntoService: PuntoService,
    private router: Router,
    private sesionService: SesionService,
    private route: ActivatedRoute,
    private location: Location
  ){}

  puntos: IPunto[] = [];

  idSesion: number | null = 0;

  sesion: ISesion | undefined;

  modificarPuntoForm = new FormGroup({
    idPunto: new FormControl('',Validators.required),
    nombre: new FormControl('',Validators.required),
    detalle: new FormControl('',Validators.required),
    estado: new FormControl(''),
  });

  crearPuntoForm = new FormGroup({
    sesion: new FormControl('',Validators.required),
    nombre: new FormControl('',Validators.required),
    detalle: new FormControl('',Validators.required),
  });

  ngOnInit(): void {
    this.idSesion = parseInt(this.route.snapshot.paramMap.get('id')!);
    this.getPuntos();
    this.getSesion();
  }

  getPuntos(){
    const query = `sesion.id_sesion=${this.idSesion}`;
    const relations = [`sesion`]
    this.puntoService.getAllDataBy(query, relations).subscribe((data) =>{
      this.puntos = data
    })
  }

  getSesion(){
    const query = `id_sesion=${this.idSesion}`;
    this.sesionService.getDataBy(query).subscribe((data) => {
      this.sesion = data
    })
  }

  irAVotacion(id: number){
    if (id) {
      const idString = id.toString();
      this.router.navigate(['/votacion', idString]);
    } else {
      console.error(`ID de sesión no definido: ${id} lol`);
    }
  }

  irAVotantes(id: number){
    if (id) {
      this.router.navigate(['votantes', id])
    }else{
      console.error(`ID de sesión no definido: ${id} lol`);
      // Manejar el error como consideres necesario
    }
  }

  irAResultados(id: number){
    if (id) {
      this.router.navigate(['resultados', id])
    }else{
      console.error(`ID de sesión no definido: ${id} lol`);
      // Manejar el error como consideres necesario
    }
  }

  abrirEditar(punto: any) {
      this.modificarPuntoForm.setValue({
        idPunto: punto.id_punto,
        nombre: punto.nombre,
        detalle: punto.detalle,
        estado: punto.estado,
      });
  }

  editarPunto(){
    
    const puntoData: any ={
      id_punto: parseInt(this.modificarPuntoForm.value.idPunto!),
      nombre: this.modificarPuntoForm.value.nombre,
      detalle: this.modificarPuntoForm.value.detalle,
      estado: this.modificarPuntoForm.value.estado
    }

    this.puntoService.saveData(puntoData).subscribe((response)=>{
      console.log(response);
    });

    window.location.reload(); 
    
  }

  crearPunto(){
    
    const puntoData: any ={
      sesion: {
        id_sesion: this.idSesion
      },
      nombre: this.crearPuntoForm.value.nombre,
      detalle: this.crearPuntoForm.value.detalle,
    }

    this.puntoService.saveData(puntoData).subscribe((response)=>{
      console.log(response);
    });

    window.location.reload(); 
    
  }

  goBack(){
    this.location.back();
  }

}
