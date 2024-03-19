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
import { ActivatedRoute, Router } from '@angular/router';
import { IPunto } from '../interfaces/IPunto';
import { ISesion } from '../interfaces/ISesion';
import { PuntoUsuarioService } from '../services/puntoUsuario.service';
import { IPuntoUsuario } from '../interfaces/IPuntoUsuario';
import { WebSocketService } from '../services/websocket.service';
import { forkJoin } from 'rxjs';

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
    private router: Router,
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
        this.squareElement.classList.remove('sin-votar', 'afavor', 'encontra', 'abstinencia');
    
        // Agregar las clases según la situación actual
        if (this.puntoUsuarioActual!.opcion === null) {
          // Establecer la clase 'sin-votar' en el elemento DOM
          this.squareElement.classList.add('sin-votar');
        } else if (this.puntoUsuarioActual!.opcion === 'afavor') {
          // Establecer la clase 'afavor' en el elemento DOM
          this.squareElement.classList.add('afavor');
        } else if (this.puntoUsuarioActual!.opcion === 'encontra') {
          // Establecer la clase 'encontra' en el elemento DOM
          this.squareElement.classList.add('encontra');
        } else if (this.puntoUsuarioActual!.opcion === 'abstinencia') {
          // Establecer la clase 'abstinencia' en el elemento DOM
          this.squareElement.classList.add('abstinencia');
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

  cambiarEstadoPunto(punto: IPunto) {
    const nuevoEstado = !punto.estado; // Cambiar el estado opuesto
  
    const puntoData = {
      id_punto: punto.id_punto,
      estado: nuevoEstado
    };
  
    this.puntoService.saveData(puntoData).subscribe((r) => {
      // Actualizar el estado del punto en la lista puntos
      const puntoIndex = this.puntos.findIndex(p => p.id_punto === punto.id_punto);
      if (puntoIndex !== -1) {
        this.puntos[puntoIndex].estado = nuevoEstado;
      }
    });
  }
  
  finalizarSesion(sesion: ISesion) {
    // Crear un array de observables para registrar los resultados de los puntos
    const observables = this.puntos.map((punto: IPunto) => {
      return this.puntoService.registerResultados({ idPunto: punto.id_punto });
    });

    // Utilizar forkJoin para esperar a que todos los registros se completen
    forkJoin(observables).subscribe(() => {
      console.log('Todos los resultados de los puntos han sido registrados');

      // Una vez que todos los resultados se hayan registrado, finalizar la sesión
      const sesionData = {
        id_sesion: sesion.id_sesion,
        estado: false,
      };

      this.sesionService.saveData(sesionData).subscribe(() => {
        console.log('Sesión finalizada correctamente');
        const idString = sesion.id_sesion!.toString();
        this.router.navigate(['/resultados', idString]);
      }, error => {
        console.error('Error al finalizar la sesión:', error);
      });
    }, error => {
      console.error('Error al registrar resultados de puntos:', error);
    });
  }

  goBack() {
    this.location.back();
  }
}
