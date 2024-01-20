import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PuntoService } from '../services/punto.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SesionService } from '../services/sesion.service';
import { Location } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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

  goBack(){
    this.location.back();
  }

}
