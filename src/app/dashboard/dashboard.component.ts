// =======================
// DashboardComponent
// Componente principal que muestra las sesiones activas al usuario autenticado.
// También sirve como punto de acceso a los módulos de usuarios, sesiones y miembros.
// =======================

// Importaciones Angular y Comunes
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Componentes
import { BarraSuperiorComponent } from '../components/barra-superior/barra-superior.component';

// Servicios
import { SesionService } from '../services/sesion.service';
import { CookieService } from 'ngx-cookie-service';

// Interfaces
import { ISesion } from '../interfaces/ISesion';

// Utilidades
import { jwtDecode } from 'jwt-decode';
import { FooterComponent } from "../components/footer/footer.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BarraSuperiorComponent,
    FooterComponent
]
})
export class DashboardComponent implements OnInit {

  // =======================
  // Propiedades
  // =======================

  sesiones: ISesion[] = [];

  /** Información decodificada del token JWT */
  payload: any = jwtDecode(this.cookieService.get('token'));

  // =======================
  // Constructor
  // =======================
  constructor(
    private sesionService: SesionService,
    private router: Router,
    private cookieService: CookieService
  ) {}

  // =======================
  // Ciclo de vida
  // =======================
  ngOnInit() {
    this.getSesiones();
  }

  // =======================
  // Obtener sesiones activas del sistema
  // =======================
  getSesiones() {
    const query = `estado=1&status=1`;
    this.sesionService.getAllDataBy(query).subscribe(
      (data: any) => {
        this.sesiones = data;
      },
      (error) => {
        if (error.status === 401) {
          this.router.navigate(['/', 'login']);
        }
      }
    );
  }

  // =======================
  // Navegar al detalle de una sesión
  // =======================
  irADetalleSesion(id: number) {
    if (id) {
      this.router.navigate(['/sesion', id.toString()]);
    } else {
      console.error(`ID de sesión no definido: ${id}`);
    }
  }

  // =======================
  // Navegaciones a módulos del sistema
  // =======================
  irAUsuarios() {
    this.router.navigate(['/usuarios']);
  }

  irASesiones() {
    this.router.navigate(['/sesiones']);
  }

  irAMiembros() {
    this.router.navigate(['/miembros']);
  }
}
