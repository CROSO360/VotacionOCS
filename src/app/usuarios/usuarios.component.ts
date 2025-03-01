import { CommonModule, Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BarraSuperiorComponent } from '../barra-superior/barra-superior.component';
import { UsuarioService } from '../services/usuario.service';
import { GrupoUsuarioService } from '../services/grupoUsuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IUsuario } from '../interfaces/IUsuario';
import { ToastrService } from 'ngx-toastr';
import { log } from 'console';
import { data } from 'jquery';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BarraSuperiorComponent,
  ],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
})
export class UsuariosComponent implements OnInit {
  busqueda: string = '';

  usuarios: any[] = []; // Reemplaza con tu tipo de dato
  usuariosFiltrados: any[] = [];

  grupoActual: any = null;
  gruposUsuarios: any[] = []; // Reemplaza con tu tipo de dato

  reemplazosDisponibles: any = [];
  mensajeReemplazo: string = '';
  ultimoUsuarioEditadoId: number | null = null;

  constructor(
    private usuarioService: UsuarioService,
    private grupoUsuarioService: GrupoUsuarioService,
    private location: Location,
    private toastrService: ToastrService
  ) {}

  modificarUsuarioForm = new FormGroup({
    idUsuario: new FormControl('', Validators.required),
    nombre: new FormControl('', Validators.required),
    codigo: new FormControl('', Validators.required),
    cedula: new FormControl('', Validators.required),
    grupoUsuario: new FormControl('', Validators.required),
    usuarioReemplazo: new FormControl(''), // No obligatorio
    estado: new FormControl(''), // No obligatorio
  });
  

  crearUsuarioForm = new FormGroup({
    nombrex: new FormControl('',Validators.required),
    codigox: new FormControl('',Validators.required),
    cedulax: new FormControl('',Validators.required),
    grupoUsuariox: new FormControl('',Validators.required),
    usuarioReemplazox: new FormControl(null),
  });

  ngOnInit(): void {
    this.cargarGruposUsuarios();

    // Establecer la pestaña "Todos" por defecto
    this.cambiarGrupo(null);

    // Cargar usuarios y luego filtrar al inicio
    this.cargarUsuarios();
  }

  cargarGruposUsuarios() {
    this.grupoUsuarioService.getAllData().subscribe((data: any) => {
      this.gruposUsuarios = data;
    });
  }

  cargarUsuarios() {
    const query = `tipo=votante`;
    const relations = [`grupoUsuario`, `usuarioReemplazo`];

    this.usuarioService
      .getAllDataBy(query, relations)
      .subscribe((data: any) => {
        this.usuarios = data;
        this.usuariosFiltrados = [...this.usuarios];
        //this.filtrarUsuarios();
        console.log(this.usuarios);
      });
  }

  cambiarGrupo(grupo: any) {
    this.grupoActual = grupo;
    this.filtrarUsuarios();
  }

  filtrarUsuarios() {
    // Lógica para filtrar y ordenar los usuarios según el grupo y la búsqueda
    this.usuariosFiltrados = this.usuarios
      .filter(
        (usuario) =>
          (!this.grupoActual ||
            usuario.grupoUsuario.id_grupo_usuario ===
              this.grupoActual.id_grupo_usuario) &&
          (usuario.nombre!.toLowerCase().includes(this.busqueda.toLowerCase()) ||
            usuario.cedula!.includes(this.busqueda))
      )
      .sort((a, b) => {
        if (a.estado === b.estado) {
          // Si ambos estados son iguales, ordena por nombre
          return a.nombre.localeCompare(b.nombre);
        }
        // Ordena de manera que los usuarios con estado false aparezcan al final
        return a.estado ? -1 : 1;
      });
  }
  
  abrirEditar(usuario: any) { 

    console.log(usuario.nombre);

    // Si el usuario es el mismo que el último editado, no recargamos la lista
    if (this.ultimoUsuarioEditadoId === usuario.id_usuario) {
      return;  // Se omite la actualización manual con detectChanges()
    }

    // Guardamos el nuevo usuario editado
    this.ultimoUsuarioEditadoId = usuario.id_usuario;

    this.usuarioService.reemplazosDispobibles(usuario.id_usuario).subscribe((data: any) => {
      this.reemplazosDisponibles = data.disponibles || [];
      this.mensajeReemplazo = ''; // Resetear mensaje

      // Caso 1: El usuario no tiene reemplazo ni es reemplazo de alguien más
      if (!data.reemplazo && !data.esReemplazoDe) {
        //console.log(usuario.usuarioReemplazo.id_usuario);
        this.modificarUsuarioForm.setValue({
          idUsuario: usuario.id_usuario,
          nombre: usuario.nombre,
          codigo: usuario.codigo,
          cedula: usuario.cedula,
          grupoUsuario: usuario.grupoUsuario.id_grupo_usuario,
          usuarioReemplazo: null,
          estado: usuario.estado,
        });

      // Caso 2: El usuario tiene un reemplazo asignado
      }else if (data.reemplazo){
        
        this.modificarUsuarioForm.setValue({
          idUsuario: usuario.id_usuario,
          nombre: usuario.nombre,
          codigo: usuario.codigo,
          cedula: usuario.cedula,
          grupoUsuario: usuario.grupoUsuario.id_grupo_usuario,
          usuarioReemplazo: usuario.usuarioReemplazo.id_usuario,
          estado: usuario.estado,
        });
      }

      // Caso 3: El usuario es reemplazo de alguien más
      else if (data.esReemplazoDe) {
        this.mensajeReemplazo = `Reemplazo de ${data.esReemplazoDe.cedula} - ${data.esReemplazoDe.nombre}`;
        this.modificarUsuarioForm.setValue({
          idUsuario: usuario.id_usuario,
          nombre: usuario.nombre,
          codigo: usuario.codigo,
          cedula: usuario.cedula,
          grupoUsuario: usuario.grupoUsuario.id_grupo_usuario,
          usuarioReemplazo: null, // Se muestra el usuario al que reemplaza
          estado: usuario.estado,
        });

      }

    });
    
  }

  

  cerrarModal(modalId: string, form: FormGroup) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
      modalElement.setAttribute('aria-hidden', 'true');
      modalElement.removeAttribute('aria-modal');
      modalElement.removeAttribute('role');
    }

    // Limpieza de estilos y clases
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';

    // Elimina cualquier backdrop sobrante
    const backdrops = document.getElementsByClassName('modal-backdrop');
    while (backdrops[0]) {
      backdrops[0].parentNode?.removeChild(backdrops[0]);
    }

    // Restablecer el formulario
    form.reset();

    this.reemplazosDisponibles = [];
    this.mensajeReemplazo = '';
  }

  editarUsuario() {
    const idUsuario = parseInt(this.modificarUsuarioForm.value.idUsuario!);
    const usuarioReemplazoId = this.modificarUsuarioForm.value.usuarioReemplazo == '0' || this.modificarUsuarioForm.value.usuarioReemplazo == null
      ? null
      : { id_usuario: parseInt(this.modificarUsuarioForm.value.usuarioReemplazo!) };
  
    const usuarioData: any = {
      id_usuario: idUsuario,
      nombre: this.modificarUsuarioForm.value.nombre,
      codigo: this.modificarUsuarioForm.value.codigo,
      cedula: this.modificarUsuarioForm.value.cedula,
      grupoUsuario: {
        id_grupo_usuario: parseInt(this.modificarUsuarioForm.value.grupoUsuario!)
      },
      usuarioReemplazo: usuarioReemplazoId,
      estado: this.modificarUsuarioForm.value.estado ?? true
    };
  
    this.usuarioService.updateData(usuarioData).subscribe((response) => {
      console.log(response);
      this.toastrService.success('Usuario actualizado con éxito.');
      this.cargarUsuarios();
  
      if (this.ultimoUsuarioEditadoId === idUsuario) {
        const query = `id_usuario=${idUsuario}`;
        const relations = ['grupoUsuario', 'usuarioReemplazo'];
  
        this.usuarioService.getDataBy(query, relations).subscribe((usuarioActualizado: any) => {
          if (!usuarioActualizado || !usuarioActualizado.id_usuario) {
            console.error('Error: usuarioActualizado es inválido.');
            return;
          }
  
          this.reemplazosDisponibles = [];
  
          // **Solo hacer la petición si id_usuario es válido**
          if (!isNaN(usuarioActualizado.id_usuario)) {
            this.usuarioService.reemplazosDispobibles(usuarioActualizado.id_usuario).subscribe((data: any) => {
              this.reemplazosDisponibles = data.disponibles || [];
  
              // **Actualizar el mensaje de reemplazo si el usuario es reemplazo de alguien más**
              this.mensajeReemplazo = data.esReemplazoDe
                ? `Reemplazo de ${data.esReemplazoDe.cedula} - ${data.esReemplazoDe.nombre}`
                : '';
            });
          }
  
          // **Actualizar el formulario**
          this.modificarUsuarioForm.patchValue({
            idUsuario: usuarioActualizado.id_usuario,
            nombre: usuarioActualizado.nombre,
            codigo: usuarioActualizado.codigo,
            cedula: usuarioActualizado.cedula,
            grupoUsuario: usuarioActualizado.grupoUsuario.id_grupo_usuario,
            usuarioReemplazo: usuarioActualizado.usuarioReemplazo ? usuarioActualizado.usuarioReemplazo.id_usuario : null,
            estado: usuarioActualizado.estado ?? true
          });
        });
      }
  
      this.cerrarModal('exampleModal', this.modificarUsuarioForm);
    }, (error) => {
      console.error(error);
      this.toastrService.error('Error al actualizar el usuario.', error);
    });
  }
  
  
  

  crearUsuario() {

    
      const usuarioData: any = {
        nombre: this.crearUsuarioForm.value.nombrex,
        codigo: this.crearUsuarioForm.value.codigox,
        cedula: this.crearUsuarioForm.value.cedulax,
        grupoUsuario: {
          id_grupo_usuario: parseInt(this.crearUsuarioForm.value.grupoUsuariox!),
        },
        usuarioReemplazo: null,
        tipo: 'votante'
      }

      this.usuarioService.saveData(usuarioData).subscribe((response)=>{
        console.log(response);
        this.toastrService.success('Usuario creado con éxito.');
        this.cargarUsuarios();
        this.cerrarModal('crearUsuarioModal', this.crearUsuarioForm);
      },
      (error) => {
        console.error(error);
        this.toastrService.error('Error al crear el usuario.', error);
      })
    

  }

  goBack() {
    this.location.back();
  }
}
