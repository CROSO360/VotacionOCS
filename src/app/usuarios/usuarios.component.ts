// =====================
// IMPORTACIONES
// =====================
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
import { BarraSuperiorComponent } from '../components/barra-superior/barra-superior.component';
import { UsuarioService } from '../services/usuario.service';
import { GrupoUsuarioService } from '../services/grupoUsuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IUsuario } from '../interfaces/IUsuario';
import { ToastrService } from 'ngx-toastr';
import { BotonAtrasComponent } from '../components/boton-atras/boton-atras.component';
import { Modal } from 'bootstrap';
import { FooterComponent } from '../components/footer/footer.component';

// =====================
// DECORADOR DE COMPONENTE
// =====================
@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BarraSuperiorComponent,
    BotonAtrasComponent,
    FooterComponent,
  ],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
})

// =====================
// CLASE DEL COMPONENTE
// =====================
export class UsuariosComponent implements OnInit {
  // =====================
  // VARIABLES DE ESTADO
  // =====================
  busqueda: string = '';
  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];

  grupoActual: any = null;
  gruposUsuarios: any[] = [];

  reemplazosDisponibles: any = [];
  mensajeReemplazo: string = '';
  ultimoUsuarioEditadoId: number | null = null;

  codigoOriginal: string | null = null;

  crearModalRef: any;
  editarModalRef: any;

  //flags
  guardandoUsuario: boolean = false;
  editandoUsuario = false;

  // =====================
  // CONSTRUCTOR
  // =====================
  constructor(
    private usuarioService: UsuarioService,
    private grupoUsuarioService: GrupoUsuarioService,
    private location: Location,
    private toastrService: ToastrService
  ) {}

  // =====================
  // FORMULARIOS
  // =====================

  modificarUsuarioForm = new FormGroup({
    idUsuario: new FormControl('', Validators.required),
    nombre: new FormControl('', Validators.required),
    codigo: new FormControl('', Validators.required),
    cedula: new FormControl('', Validators.required),
    grupoUsuario: new FormControl('', Validators.required),
    usuarioReemplazo: new FormControl(''),
    estado: new FormControl(''),
  });

  crearUsuarioForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
    codigo: new FormControl('', Validators.required),
    cedula: new FormControl('', Validators.required),
    grupoUsuario: new FormControl('', Validators.required),
    usuarioReemplazo: new FormControl(null),
  });

  // =====================
  // CICLO DE VIDA
  // =====================
  ngOnInit(): void {
    this.cargarGruposUsuarios();
    this.cambiarGrupo(null);
    this.cargarUsuarios();

    const crearModalEl = document.getElementById('crearUsuarioModal');
    if (crearModalEl) this.crearModalRef = new Modal(crearModalEl);

    const editarModalEl = document.getElementById('modalEditarUsuario');
    if (editarModalEl) this.editarModalRef = new Modal(editarModalEl);
  }

  // =====================
  // MÉTODOS DE DATOS
  // =====================

  cargarGruposUsuarios() {
    this.grupoUsuarioService.getAllData().subscribe((data: any) => {
      this.gruposUsuarios = data;
    });
  }

  cargarUsuarios() {
    const query = `tipo=votante`;
    const relations = [`grupoUsuario`, `usuarioReemplazo`];

    this.usuarioService
      this.usuarioService
    .getAllDataBy(query, relations)
    .subscribe((data: any) => {
      this.usuarios = data;
      this.filtrarUsuarios(); // Aplica orden y filtros de inmediato
    });
  }

  // =====================
  // FILTRADO Y ORGANIZACIÓN
  // =====================

  cambiarGrupo(grupo: any) {
    this.grupoActual = grupo;
    this.filtrarUsuarios();
  }

  filtrarUsuarios() {
    this.usuariosFiltrados = this.usuarios
      .filter((usuario) => {
        const coincideGrupo =
          !this.grupoActual ||
          usuario.grupoUsuario.id_grupo_usuario ===
            this.grupoActual.id_grupo_usuario;

        const termino = this.busqueda.toLowerCase();
        const coincideBusqueda =
          usuario.nombre?.toLowerCase().includes(termino) ||
          usuario.cedula?.includes(this.busqueda);

        return coincideGrupo && coincideBusqueda;
      })
      .sort((a, b) => {
        // Ordenar primero por estado (true antes que false), luego por nombre alfabéticamente
        if (a.estado === b.estado) {
          return a.nombre.localeCompare(b.nombre);
        }
        return a.estado ? -1 : 1;
      });
  }

  // =====================
  // GESTIÓN DE FORMULARIO EDITAR
  // =====================

  revertirCodigo(formulario: FormGroup): void {
    if (this.codigoOriginal) {
      formulario.get('codigo')?.setValue(this.codigoOriginal);
      formulario.get('codigo')?.markAsDirty();
      this.toastrService.info('Código revertido al valor original.');
    }
  }

  abrirEditar(usuario: any): void {
    const modalEstaVisible = document
      .getElementById('modalEditarUsuario')
      ?.classList.contains('show');

    if (this.ultimoUsuarioEditadoId === usuario.id_usuario && modalEstaVisible)
      return;
    this.ultimoUsuarioEditadoId = usuario.id_usuario;

    this.modificarUsuarioForm.reset();

    this.usuarioService.reemplazosDispobibles(usuario.id_usuario).subscribe({
      next: (data: any) => {
        this.reemplazosDisponibles = data.disponibles || [];
        this.mensajeReemplazo = '';
        this.codigoOriginal = usuario.codigo;

        const usuarioBase = {
          idUsuario: usuario.id_usuario,
          nombre: usuario.nombre,
          codigo: usuario.codigo,
          cedula: usuario.cedula,
          grupoUsuario: usuario.grupoUsuario.id_grupo_usuario,
          estado: usuario.estado,
        };

        if (data.reemplazo) {
          this.modificarUsuarioForm.setValue({
            ...usuarioBase,
            usuarioReemplazo: usuario.usuarioReemplazo?.id_usuario ?? null,
          });
        } else if (data.esReemplazoDe) {
          this.mensajeReemplazo = `Reemplazo de ${data.esReemplazoDe.cedula} - ${data.esReemplazoDe.nombre}`;
          this.modificarUsuarioForm.setValue({
            ...usuarioBase,
            usuarioReemplazo: null,
          });
        } else {
          this.modificarUsuarioForm.setValue({
            ...usuarioBase,
            usuarioReemplazo: null,
          });
        }

        if (this.editarModalRef) {
          this.editarModalRef.show();
        }
      },
      error: (err) => {
        console.error('Error al cargar reemplazos:', err);
        this.toastrService.error(
          'No se pudo cargar la información del usuario.'
        );
      },
    });
  }

  editarUsuario() {
    const idUsuario = parseInt(this.modificarUsuarioForm.value.idUsuario!);
    const usuarioReemplazoId =
      this.modificarUsuarioForm.value.usuarioReemplazo == '0' ||
      this.modificarUsuarioForm.value.usuarioReemplazo == null
        ? null
        : {
            id_usuario: parseInt(
              this.modificarUsuarioForm.value.usuarioReemplazo!
            ),
          };

    const usuarioData: any = {
      id_usuario: idUsuario,
      nombre: this.modificarUsuarioForm.value.nombre,
      codigo: this.modificarUsuarioForm.value.codigo,
      cedula: this.modificarUsuarioForm.value.cedula,
      grupoUsuario: {
        id_grupo_usuario: parseInt(
          this.modificarUsuarioForm.value.grupoUsuario!
        ),
      },
      usuarioReemplazo: usuarioReemplazoId,
      estado: this.modificarUsuarioForm.value.estado ?? true,
    };

    this.usuarioService.updateData(usuarioData).subscribe(
      () => {
        this.toastrService.success('Usuario actualizado con éxito.');
        this.cargarUsuarios();

        if (this.ultimoUsuarioEditadoId === idUsuario) {
          const query = `id_usuario=${idUsuario}`;
          const relations = ['grupoUsuario', 'usuarioReemplazo'];

          this.usuarioService
            .getDataBy(query, relations)
            .subscribe((usuarioActualizado: any) => {
              if (!usuarioActualizado?.id_usuario) return;

              this.usuarioService
                .reemplazosDispobibles(usuarioActualizado.id_usuario)
                .subscribe((data: any) => {
                  this.reemplazosDisponibles = data.disponibles || [];
                  this.mensajeReemplazo = data.esReemplazoDe
                    ? `Reemplazo de ${data.esReemplazoDe.cedula} - ${data.esReemplazoDe.nombre}`
                    : '';
                });

              this.modificarUsuarioForm.patchValue({
                idUsuario: usuarioActualizado.id_usuario,
                nombre: usuarioActualizado.nombre,
                codigo: usuarioActualizado.codigo,
                cedula: usuarioActualizado.cedula,
                grupoUsuario: usuarioActualizado.grupoUsuario.id_grupo_usuario,
                usuarioReemplazo: usuarioActualizado.usuarioReemplazo
                  ? usuarioActualizado.usuarioReemplazo.id_usuario
                  : null,
                estado: usuarioActualizado.estado ?? true,
              });
            });
        }

        if (this.editarModalRef) this.editarModalRef.hide();
        this.modificarUsuarioForm.reset();
        this.reemplazosDisponibles = [];
        this.mensajeReemplazo = '';
        this.codigoOriginal = null;
        this.ultimoUsuarioEditadoId = null;
      },
      (error) => {
        this.toastrService.error(
          error.error.message,
          'Error al actualizar el usuario.'
        );
      }
    );
  }

  // =====================
  // CREACIÓN DE USUARIO
  // =====================

  crearUsuario() {
    const usuarioData: any = {
      nombre: this.crearUsuarioForm.value.nombre,
      codigo: this.crearUsuarioForm.value.codigo,
      cedula: this.crearUsuarioForm.value.cedula,
      grupoUsuario: {
        id_grupo_usuario: parseInt(this.crearUsuarioForm.value.grupoUsuario!),
      },
      usuarioReemplazo: null,
      tipo: 'votante',
    };

    this.usuarioService.saveData(usuarioData).subscribe(
      () => {
        this.toastrService.success('Usuario creado con éxito.');
        this.cargarUsuarios();
        this.cerrarModal('crearUsuarioModal', this.crearUsuarioForm);
      },
      (error) => {
        this.toastrService.error(
          error.error.message,
          'Error al crear el usuario.'
        );
      }
    );
  }

  generarCodigoUsuario(formulario: FormGroup): void {
    this.usuarioService.generarCodigo().subscribe({
      next: (res) => {
        const campoCodigo =
          formulario.get('codigox') || formulario.get('codigo');

        if (campoCodigo) {
          campoCodigo.setValue(res.codigo);
          campoCodigo.markAsDirty();
        } else {
          this.toastrService.warning(
            'No se encontró el campo de código en el formulario.'
          );
        }
      },
      error: () => {
        this.toastrService.error('Error al generar el código del usuario.');
      },
    });
  }

  // =====================
  // UTILIDADES
  // =====================

  cerrarModal(modalId: string, form: FormGroup) {
    if (modalId === 'crearUsuarioModal' && this.crearModalRef) {
      this.crearModalRef.hide();
    }

    if (modalId === 'modalEditarUsuario' && this.editarModalRef) {
      this.editarModalRef.hide();
    }

    form.reset();
    this.reemplazosDisponibles = [];
    this.mensajeReemplazo = '';
    this.codigoOriginal = null;
    this.ultimoUsuarioEditadoId = null;
  }

  goBack() {
    this.location.back();
  }
}
