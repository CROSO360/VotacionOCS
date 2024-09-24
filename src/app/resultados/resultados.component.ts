import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BarraSuperiorComponent } from '../barra-superior/barra-superior.component';
import { IPunto } from '../interfaces/IPunto';
import { ISesion } from '../interfaces/ISesion';
import { PuntoService } from '../services/punto.service';
import { SesionService } from '../services/sesion.service';
import { ActivatedRoute, Router } from '@angular/router';
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

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

  puntos: IPunto[] = [];

  idSesion: number | null = 0;

  sesion: ISesion | undefined;

  puntoSeleccionado: number | undefined;

  resultados: any[] = [];

  ngOnInit(): void {
    this.idSesion = parseInt(this.route.snapshot.paramMap.get('id')!);
    this.getPuntos();
    this.getSesion();
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

  async generarReporte() {
    //console.log(this.resultados);

    const content: any[] = [
      {
        text: `Resultados de la sesión ${this.sesion.nombre}`,
        style: 'header',
      },
    ];

    // Aquí iteramos sobre los puntos para agregar tablas dinámicamente
    this.puntos.forEach((punto) => {
      content.push(
        {
          text: `Punto ${punto.nombre}`,
          style: 'subheader',
        }, // Cambia 'nombrePunto' según tu estructura
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', '*', '*', '*'],
            body: [
              [
                { text: 'Grupo Usuario', bold: true, alignment: 'center', style: 'tableHeader', fillColor: '#CCCCCC' },
                { text: 'A Favor', alignment: 'center', style: 'tableHeader', fillColor: '#CCCCCC' },
                { text: 'A Favor Peso', alignment: 'center', style: 'tableHeader', fillColor: '#CCCCCC' },
                { text: 'En Contra', alignment: 'center', style: 'tableHeader', fillColor: '#CCCCCC' },
                { text: 'En Contra Peso', alignment: 'center', style: 'tableHeader', fillColor: '#CCCCCC' },
                { text: 'Abstención', alignment: 'center', style: 'tableHeader', fillColor: '#CCCCCC' },
                { text: 'Abstención Peso', alignment: 'center', style: 'tableHeader', fillColor: '#CCCCCC' },
              ],
              // Generamos las filas de cada tabla para el punto
              ...this.resultados.map((resultado) => [
                { text: resultado.grupo_usuario },
                { text: resultado.afavor, alignment: 'right' },
                { text: resultado.afavor_peso, alignment: 'right' },
                { text: resultado.encontra, alignment: 'right' },
                { text: resultado.encontra_peso, alignment: 'right' },
                { text: resultado.abstinencia, alignment: 'right' },
                { text: resultado.abstinencia_peso, alignment: 'right' },
              ]),
              // Fila de totales para cada tabla de punto
              [
                { text: 'Total', bold: true, alignment: 'center', fillColor: '#CCCCCC' },
                { text: punto.n_afavor, alignment: 'right', fillColor: '#CCCCCC' },
                { text: punto.afavor, alignment: 'right', fillColor: '#CCCCCC' }, 
                { text: punto.n_encontra, alignment: 'right', fillColor: '#CCCCCC' }, 
                { text: punto.encontra, alignment: 'right', fillColor: '#CCCCCC' }, 
                { text: punto.n_abstinencia, alignment: 'right', fillColor: '#CCCCCC' }, 
                { text: punto.abstinencia, alignment: 'right', fillColor: '#CCCCCC' }, 
              ],
            ],
          },
        }
      );
    });

    // Definición del documento PDF
    const documentDefinition = {
      content: content,
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5],
        },
      },
    };

    // Generar y descargar el PDF con el nombre basado en la sesión
    const nombreArchivo = `reporte_sesion_${
      this.sesion?.nombre || 'sin_nombre'
    }.pdf`;
    pdfMake.createPdf(documentDefinition).download(nombreArchivo);
  }

  goBack() {
    this.location.back();
  }
}
