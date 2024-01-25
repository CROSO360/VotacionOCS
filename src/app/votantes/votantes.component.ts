import { CommonModule, Location } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { BarraSuperiorComponent } from '../barra-superior/barra-superior.component';
import { UsuarioService } from '../services/usuario.service';
import { IGrupoUsuario } from '../interfaces/IGrupoUsuario';
import { IUsuario } from '../interfaces/IUsuario';
import { GrupoUsuarioService } from '../services/grupoUsuario.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-votantes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BarraSuperiorComponent,
  ],
  templateUrl: './votantes.component.html',
  styleUrl: './votantes.component.css',
})
export class VotantesComponent implements OnInit {
  puntoId: number | undefined;
  busqueda: string = '';
  gruposUsuarios: any[] = []; // Reemplaza con tu tipo de dato
  usuarios: any[] = []; // Reemplaza con tu tipo de dato
  usuariosFiltrados: any[] = [];
  usuariosSeleccionados: any[] = [];
  grupoActual: any = null;

  /*busqueda: string = '';
  gruposUsuarios: IGrupoUsuario[] = []; // Reemplaza con tu tipo de dato
  usuarios: IUsuario[] = []; // Reemplaza con tu tipo de dato
  usuariosFiltrados: IUsuario[] = [];
  usuariosSeleccionados: IUsuario[] = [];
  grupoActual: IGrupoUsuario | undefined;*/

  constructor(
    private usuarioService: UsuarioService,
    private grupoUsuarioService: GrupoUsuarioService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.puntoId = parseInt(this.route.snapshot.paramMap.get('id')!);
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
        this.filtrarUsuarios();
      });
  }

  cambiarGrupo(grupo: any) {
    this.grupoActual = grupo;
    this.filtrarUsuarios();
  }

  filtrarUsuarios() {
    // Lógica para filtrar los usuarios según el grupo y la búsqueda
    this.usuariosFiltrados = this.usuarios.filter(
      (usuario) =>
        (!this.grupoActual ||
          usuario.grupoUsuario.id_grupo_usuario ===
            this.grupoActual.id_grupo_usuario) &&
        (usuario.nombre!.toLowerCase().includes(this.busqueda.toLowerCase()) ||
          usuario.cedula!.includes(this.busqueda))
    );
  }

  actualizarSeleccion(usuario: any) {
    if (usuario.seleccionado) {
      // Si se selecciona un usuario, agrégalo a la lista de usuarios seleccionados
      this.usuariosSeleccionados.push(usuario);
    } else {
      // Si se deselecciona un usuario, remuévelo de la lista de usuarios seleccionados
      const index = this.usuariosSeleccionados.findIndex(
        (u) => u.id_usuario === usuario.id_usuario
      );
      if (index !== -1) {
        this.usuariosSeleccionados.splice(index, 1);
      }
    }
  }

  confirmarSeleccion() {
    // Lógica para confirmar la selección de usuarios
    this.usuariosSeleccionados = this.usuarios.filter(
      (usuario) => usuario.seleccionado
    );
    console.log(this.usuariosSeleccionados);

    // Puedes realizar otras acciones aquí, como enviar la lista de usuarios seleccionados al servidor
  }

  goBack(){
    this.location.back();
  }

}
