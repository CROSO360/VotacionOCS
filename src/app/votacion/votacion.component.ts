import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BarraSuperiorComponent } from '../barra-superior/barra-superior.component';
import { Location } from '@angular/common';
import { PuntoService } from '../services/punto.service';
import { SesionService } from '../services/sesion.service';
import { ActivatedRoute } from '@angular/router';
import { IPunto } from '../interfaces/IPunto';
import { ISesion } from '../interfaces/ISesion';
import { PuntoUsuarioService } from '../services/puntoUsuario.service';
import { IPuntoUsuario } from '../interfaces/IPuntoUsuario';

@Component({
  selector: 'app-votacion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, BarraSuperiorComponent],
  templateUrl: './votacion.component.html',
  styleUrl: './votacion.component.css'
})
export class VotacionComponent implements OnInit{

  constructor(
    private puntoService: PuntoService,
    private sesionService: SesionService,
    private puntoUsuarioService: PuntoUsuarioService,
    private route: ActivatedRoute,
    private location: Location
  ){}

  puntos: IPunto[] = [];

  idSesion: number | null = 0;

  sesion: ISesion | undefined;

  puntoUsuarios: any[] = [];

  puntoSeleccionado: number | undefined;

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

  getPuntoUsuarios(puntoId: number){
    const query = `punto.id_punto=${puntoId}`;
    const relations = [`usuario`,`usuario.usuarioReemplazo`,`usuario.grupoUsuario`];
    this.puntoUsuarioService.getAllDataBy(query,relations).subscribe((data) => {
      this.puntoUsuarios = data;
    })
  }

  onPuntoChange() {
    this.getPuntoUsuarios(this.puntoSeleccionado!)
  }

  goBack(){
    this.location.back();
  }

}
