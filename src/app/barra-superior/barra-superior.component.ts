// =======================
// BarraSuperiorComponent
// Componente responsable de mostrar la barra superior con opciones de navegación y cierre de sesión.
// =======================

// Importaciones base
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-barra-superior',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './barra-superior.component.html',
  styleUrl: './barra-superior.component.css'
})
export class BarraSuperiorComponent {

  // =======================
  // Constructor
  // =======================
  constructor(
    private cookieService: CookieService,
    private router: Router,
  ) {}

  // =======================
  // Cerrar sesión del usuario
  // Elimina las cookies y redirige a la pantalla de login
  // =======================
  async logout() {
    await this.cookieService.deleteAll('token');
    await this.router.navigate(['/', 'login']);
  }

  // =======================
  // Redirigir al inicio
  // Navega a la ruta principal del sistema
  // =======================
  inicio() {
    this.router.navigate(['/', 'home']);
  }
}
