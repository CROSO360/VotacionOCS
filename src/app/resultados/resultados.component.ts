import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BarraSuperiorComponent } from '../barra-superior/barra-superior.component';
import { IPunto } from '../interfaces/IPunto';
import { ISesion } from '../interfaces/ISesion';
import { PuntoService } from '../services/punto.service';
import { SesionService } from '../services/sesion.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BarraSuperiorComponent,
  ],
  templateUrl: './resultados.component.html',
  styleUrl: './resultados.component.css',
})
export class ResultadosComponent implements OnInit {
  constructor(
    private puntoService: PuntoService,
    private sesionService: SesionService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  puntos: any[] = [];
  idSesion: number | null = 0;
  sesion: ISesion | undefined;
  puntoSeleccionado: number | undefined;
  resultados: any[] = [];

  generandoReporte = false;


  ngOnInit(): void {
    this.idSesion = parseInt(this.route.snapshot.paramMap.get('id')!);
    this.getPuntos();
    this.getSesion();
  }

  getPuntos() {
    const query = `sesion.id_sesion=${this.idSesion}`;
    const relations = [`sesion`, `resolucion`];
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

  onChangePuntoSeleccionado() {
    if (this.puntoSeleccionado) {
      this.getResultados(this.puntoSeleccionado);
    }
  }

  getResultados(id: number) {
    this.puntoService.getResultados(id).subscribe((data) => {
      this.resultados = data;
    });
  }

  generarReporte() {
    if (!this.idSesion) return;

    this.generandoReporte = true;

    this.sesionService.getReporte(this.idSesion).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank'); // Abre el PDF en una nueva pestaña
      },
      error: (err) => {
        console.error('Error al generar el reporte:', err);
        alert('No se pudo generar el reporte. Intente nuevamente.');
      },
      complete: () => {
        this.generandoReporte = false;
      }
    });
  }

  goBack() {
    this.location.back();
  }
}
