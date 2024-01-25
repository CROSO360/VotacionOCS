import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  Renderer2,
} from '@angular/core';
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
import { WebSocketService } from '../services/websocket.service';

@Component({
  selector: 'app-votacion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BarraSuperiorComponent,
  ],
  templateUrl: './votacion.component.html',
  styleUrl: './votacion.component.css',
})
export class VotacionComponent implements OnInit {
  constructor(
    private puntoService: PuntoService,
    private sesionService: SesionService,
    private puntoUsuarioService: PuntoUsuarioService,
    private route: ActivatedRoute,
    private location: Location,
    private webSocketService: WebSocketService,
    private render2: Renderer2
  ) {}

  squareElement!: HTMLElement;

  puntos: IPunto[] = [];

  idSesion: number | null = 0;

  sesion: ISesion | undefined;

  puntoUsuarios: any[] = [];

  puntoSeleccionado: number | undefined;

  puntoUsuarioActual: IPuntoUsuario | undefined;

  ngOnInit(): void {
    this.idSesion = parseInt(this.route.snapshot.paramMap.get('id')!);
    this.getPuntos();
    this.getSesion();
    this.webSocketService.onChange().subscribe(async (sape: any) => {
    
      // Obtener el elemento DOM con la clase 'square' que tiene la id que coincida con el valor del parámetro 'puntoUsuarioId'
      this.squareElement = document.querySelector(`.square[id="${sape.puntoUsuarioId}"]`)!;
    
      // Obtener el objeto puntoUsuario del evento
      const query = `id_punto_usuario=${sape.puntoUsuarioId}`;
      const timestamp = new Date().getTime(); // Obtener un tiempo único
      try {
        this.puntoUsuarioActual = await this.puntoUsuarioService
          .getDataBy(`${query}?timestamp=${timestamp}`)
          .toPromise();
    
        // Limpiar las clases actuales
        this.squareElement.classList.remove('sin-votar', 'votado');
    
        // Agregar las clases según la situación actual
        if (this.puntoUsuarioActual!.opcion === null) {
          // Establecer la clase 'sin-votar' en el elemento DOM
          this.squareElement.classList.add('sin-votar');
        } else {
          // Establecer la clase 'votado' en el elemento DOM
          this.squareElement.classList.add('votado');
        }
      } catch (error) {
        console.error('Error al obtener los datos del puntoUsuario:', error);
      }
    });
    
    
  }

  getPuntos() {
    const query = `sesion.id_sesion=${this.idSesion}`;
    const relations = [`sesion`];
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

  getPuntoUsuarios(puntoId: number) {
    const query = `punto.id_punto=${puntoId}`;
    const relations = [
      `usuario`,
      `usuario.usuarioReemplazo`,
      `usuario.grupoUsuario`,
    ];
    this.puntoUsuarioService
      .getAllDataBy(query, relations)
      .subscribe((data) => {
        this.puntoUsuarios = data;
      });
  }

  onPuntoChange() {
    this.getPuntoUsuarios(this.puntoSeleccionado!);
  }

  goBack() {
    this.location.back();
  }
}
