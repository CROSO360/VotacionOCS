// =======================
// ResultadosComponent
// Componente encargado de visualizar los resultados de votación de los puntos
// pertenecientes a una sesión del OCS, así como generar el reporte PDF.
// =======================

// Importaciones Angular y Comunes
import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Componentes
import { BarraSuperiorComponent } from '../components/barra-superior/barra-superior.component';

// Interfaces
import { IPunto } from '../interfaces/IPunto';
import { ISesion } from '../interfaces/ISesion';

// Servicios
import { PuntoService } from '../services/punto.service';
import { SesionService } from '../services/sesion.service';
import { BotonAtrasComponent } from "../components/boton-atras/boton-atras.component";
import { ToastrService } from 'ngx-toastr';
import { FooterComponent } from "../components/footer/footer.component";

@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BarraSuperiorComponent,
    BotonAtrasComponent,
    FooterComponent
],
  templateUrl: './resultados.component.html',
  styleUrl: './resultados.component.css',
})
export class ResultadosComponent implements OnInit {

  // =======================
  // Propiedades públicas
  // =======================
  puntos: any[] = [];
  idSesion: number | null = 0;
  sesion: ISesion | undefined;
  puntoSeleccionado: number | undefined;
  resultados: any[] = [];
  generandoReporte = false;

  // =======================
  // Constructor
  // =======================
  constructor(
    private puntoService: PuntoService,
    private sesionService: SesionService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private toastrService: ToastrService
  ) {}

  // =======================
  // Ciclo de vida
  // =======================
  ngOnInit(): void {
    this.idSesion = parseInt(this.route.snapshot.paramMap.get('id')!, 10);
    this.getPuntos();
    this.getSesion();
  }

  // =======================
  // Carga de datos
  // =======================
  getPuntos() {
    const query = `sesion.id_sesion=${this.idSesion}`;
    const relations = ['sesion', 'resolucion'];
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

  // =======================
  // Lógica de negocio
  // =======================
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
        console.error('Error al generar el reporte:', err.error.message);
        this.toastrService.error('No se pudo generar el reporte. Intente nuevamente.', err.error.message);
        this.generandoReporte = false;
      },
      complete: () => {
        this.generandoReporte = false;
      }
    });
  }

  // =======================
  // Utilidades
  // =======================
  goBack() {
    this.location.back();
  }
}
