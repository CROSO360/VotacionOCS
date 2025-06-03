import { Component } from '@angular/core';
import { PuntoService } from '../services/punto.service';
//import { Router } from 'express';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule, Location } from '@angular/common';
import { SesionService } from '../services/sesion.service';
import { ResolucionService } from '../services/resolucion.service';
import { DocumentoService } from '../services/documento.service';
import { PuntoDocumentoService } from '../services/puntoDocumento.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IPuntoDocumento } from '../interfaces/IPuntoDocumento';
import { IDocumento } from '../interfaces/IDocumento';
import { IResolucion } from '../interfaces/IResolucion';
import { jwtDecode } from 'jwt-decode';
import { CookieService } from 'ngx-cookie-service';
import { UsuarioService } from '../services/usuario.service';
import { IUsuario } from '../interfaces/IUsuario';
import { BarraSuperiorComponent } from '../barra-superior/barra-superior.component';

@Component({
  selector: 'app-punto',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BarraSuperiorComponent,
    FormsModule,
  ],
  templateUrl: './punto.component.html',
  styleUrl: './punto.component.css',
})
export class PuntoComponent {
  punto: any | undefined;
  puntoId: number | undefined;
  sesionId: number | undefined;

  sesion: any | undefined;

  puntoDocumentos: IPuntoDocumento[] = [];

  resolucion: IResolucion | undefined;

  payload: any = jwtDecode(this.cookieService.get('token'))
  usuario: IUsuario | undefined;

  constructor(
    private puntoService: PuntoService,
    private sesionService: SesionService,
    private route: ActivatedRoute,
    private location: Location,
    private toastrService: ToastrService,
    private resolucionService: ResolucionService,
    private documentoService: DocumentoService,
    private puntoDocumentoService: PuntoDocumentoService,
    private cookieService: CookieService,
    private usuarioService: UsuarioService
  ) {}

  modificarPuntoForm = new FormGroup({
    //idPunto: new FormControl('', Validators.required),
    nombre: new FormControl('', Validators.required),
    detalle: new FormControl('', Validators.required),
    es_administrativa: new FormControl(''),
  });

  //formulario para crear y editar resoluciones
  resolucionForm = new FormGroup({
    //idPunto: new FormControl('', Validators.required),
    nombre: new FormControl('', Validators.required),
    descripcion: new FormControl('', Validators.required),
  });

  ngOnInit(): void {
    this.puntoId = parseInt(this.route.snapshot.paramMap.get('idPunto')!, 10);
    this.sesionId = parseInt(this.route.snapshot.paramMap.get('idSesion')!, 10);

    this.getUsuario();

    this.getPunto();

    this.getPuntoDocumentos();

    this.getResolucion();

    this.getSesion();

  }

  getUsuario(){
    const query = `codigo=${this.payload.codigo}`;
    this.usuarioService.getDataBy(query).subscribe((data) => {
      this.usuario = data;
      console.log(this.usuario);
    });
  }

  getSesion() {
    const query = `id_sesion=${this.sesionId}`;
    this.sesionService.getDataBy(query).subscribe((data) => {
      this.sesion = data;
      if (data.estado === false) {
        this.modificarPuntoForm.disable();
        this.resolucionForm.disable();
      }
    });
  }

  //PUNTOS

  getPunto() {
    const query = `id_punto=${this.puntoId}`;
    this.puntoService.getDataBy(query).subscribe((data) => {
      this.punto = data;
      this.modificarPuntoForm.patchValue({
        nombre: this.punto.nombre,
        detalle: this.punto.detalle,
        es_administrativa: this.punto.es_administrativa
      });
    });
  }

  editarPunto() {
    const puntoData: any = {
      id_punto: this.puntoId, //parseInt(this.modificarPuntoForm.value.idPunto!),
      nombre: this.modificarPuntoForm.value.nombre,
      detalle: this.modificarPuntoForm.value.detalle,
      es_administrativa: this.modificarPuntoForm.value.es_administrativa,
    };

    this.puntoService.saveData(puntoData).subscribe(
      (response) => {
        console.log(response);
        this.toastrService.success('Punto actualizado con éxito.');
        this.getPunto(); // Actualizar el punto
      },
      (error) => {
        console.error(error);
        this.toastrService.error('Error al actualizar el punto.', error);
      }
    );
  }

  formularioPuntoModificado(): boolean {
    return this.modificarPuntoForm.value.nombre !== this.punto?.nombre ||
           this.modificarPuntoForm.value.detalle !== this.punto?.detalle ||
           this.modificarPuntoForm.value.es_administrativa !== this.punto?.es_administrativa;
  }
  


  //DOCUMENTOS

  getPuntoDocumentos() {
    const query = `punto.id_punto=${this.puntoId}`;
    const relations = ['documento'];
    this.puntoDocumentoService
      .getAllDataBy(query, relations)
      .subscribe((data) => {
        this.puntoDocumentos = data;
      });
  }

  abrirDocumento(documento: IDocumento) {
    window.open(documento.url, '_blank');
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const selectedFile = input.files[0];
      this.subirDocumento(selectedFile);
    }
  }

  subirDocumento(documento: File) {
    this.documentoService.subirDocumento(documento).subscribe((data) => {
      const puntoDocumentoData: IPuntoDocumento = {
        punto: { id_punto: this.puntoId },
        documento: { id_documento: data.id_documento },
      };
      this.puntoDocumentoService.saveData(puntoDocumentoData).subscribe(() => {
        this.toastrService.success('Documento subido correctamente');
        this.getPuntoDocumentos();
      });
    });
  }

  eliminarDocumento(id: number) {
    this.documentoService.eliminarDocumento(id).subscribe(() => {
      this.toastrService.success('Documento eliminado correctamente');
      this.getPuntoDocumentos();
    });
  }


  //RESOLUCIONES

  getResolucion(){
    const query = `id_punto=${this.puntoId}`;
    this.resolucionService.getDataBy(query).subscribe((data) => {
      this.resolucion = data;
      this.resolucionForm.patchValue({
        nombre: this.resolucion.nombre,
        descripcion: this.resolucion.descripcion
      });
    });
  }

  crearResolucion(){
    const resolucionData: IResolucion = {
      punto: {id_punto: this.puntoId},
      nombre: this.resolucionForm.value.nombre,
      descripcion: this.resolucionForm.value.descripcion,
      fecha: new Date(),
    };

    this.resolucionService.saveData(resolucionData).subscribe(
      (response) => {
        console.log(response);
        this.toastrService.success('Resolución creada con éxito.');
        this.getResolucion(); // Actualizar la resolución
      },
      (error) => {
        console.error(error);
        this.toastrService.error('Error al crear la resolución.', error);
      }
    );
  }

  editarResolucion(){
    if (!this.usuario?.id_usuario) {
      console.error('Usuario no cargado todavía');
      return;
    }
    
    const updateResolucionData: any = {
      id_punto: this.puntoId,
      id_usuario: this.usuario.id_usuario,
      nombre: this.resolucionForm.value.nombre,
      descripcion: this.resolucionForm.value.descripcion,
    };

    this.resolucionService.updateData(updateResolucionData).subscribe(
      (response) => {
        console.log(response);
        this.toastrService.success('Resolución actualizada con éxito.');
        this.getResolucion(); // Actualizar la resolución
      },
      (error) => {
        console.error(error);
        this.toastrService.error('Error al actualizar la resolución.', error);
      }
    );
  }

  formularioResolucionModificado(): boolean {
    return this.resolucionForm.value.nombre !== this.resolucion?.nombre ||
           this.resolucionForm.value.descripcion !== this.resolucion?.descripcion;
  }
  


  goBack() {
    this.location.back();
  }


}
