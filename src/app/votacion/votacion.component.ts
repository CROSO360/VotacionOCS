import { CommonModule } from '@angular/common';
import { Component, OnInit, Renderer2 } from '@angular/core';
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
      this.actualizarPuntoUsuario(sape.puntoUsuarioId);
    });
  }

  getPuntos() {
    const query = `sesion.id_sesion=${this.idSesion}`;
    const relations = [`sesion`];
    this.puntoService.getAllDataBy(query, relations).subscribe((data) => {
      this.puntos = data;
      if (this.puntos.length > 0) {
        this.puntoSeleccionado = this.puntos[0].id_punto;
        this.getPuntoUsuarios(this.puntoSeleccionado!);
      }
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
    const nuevoEstado = !punto.estado;
    const puntoData = {
      id_punto: punto.id_punto,
      estado: nuevoEstado,
    };

    this.puntoService.saveData(puntoData).subscribe((r) => {
      const puntoIndex = this.puntos.findIndex(
        (p) => p.id_punto === punto.id_punto
      );
      if (puntoIndex !== -1) {
        this.puntos[puntoIndex].estado = nuevoEstado;
      }
    });
  }

  finalizarSesion(sesion: ISesion) {
    const observables = this.puntos.map((punto: IPunto) => {
      return this.puntoService.registerResultados({ idPunto: punto.id_punto });
    });

    forkJoin(observables).subscribe(
      () => {
        const sesionData = {
          id_sesion: sesion.id_sesion,
          estado: false,
        };

        this.sesionService.saveData(sesionData).subscribe(
          () => {
            console.log('Sesión finalizada correctamente');
            const idString = sesion.id_sesion!.toString();
            this.router.navigate(['/resultados', idString]);
          },
          (error) => {
            console.error('Error al finalizar la sesión:', error);
          }
        );
      },
      (error) => {
        console.error('Error al registrar resultados de puntos:', error);
      }
    );
  }

  actualizarPuntoUsuario(puntoUsuarioId: number) {
    const query = `id_punto_usuario=${puntoUsuarioId}`;
    const timestamp = new Date().getTime();
    this.puntoUsuarioService
      .getDataBy(`${query}?timestamp=${timestamp}`)
      .subscribe((puntoUsuarioActual) => {
        this.puntoUsuarioActual = puntoUsuarioActual;
        this.actualizarVisualizacionPuntoUsuario(puntoUsuarioActual);
        this.getPuntoUsuarios(this.puntoSeleccionado!);
      });
  }

  actualizarVisualizacionPuntoUsuario(puntoUsuario: IPuntoUsuario) {
    const squareElement = document.querySelector(
      `.square[id="${puntoUsuario.id_punto_usuario}"]`
    );

    if (squareElement) {
      squareElement.classList.remove(
        'sin-votar',
        'afavor',
        'encontra',
        'abstinencia'
      );

      if (puntoUsuario.opcion === null) {
        squareElement.classList.add('sin-votar');
      } else if (puntoUsuario.opcion === 'afavor') {
        squareElement.classList.add('afavor');
      } else if (puntoUsuario.opcion === 'encontra') {
        squareElement.classList.add('encontra');
      } else if (puntoUsuario.opcion === 'abstinencia') {
        squareElement.classList.add('abstinencia');
      }

      const buttonElement = squareElement.querySelector('.btn');
      if (buttonElement) {
        buttonElement.classList.remove('noRazonado', 'razonado');
        if (puntoUsuario.es_razonado) {
          buttonElement.classList.add('razonado');
        } else {
          buttonElement.classList.add('noRazonado');
        }
      }
    }
  }

  goBack() {
    this.location.back();
  }
}
