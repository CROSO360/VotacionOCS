// =======================
// InicioSesionComponent
// Componente para inicio de sesión de usuarios administradores
// =======================

//  Importaciones Angular
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

//  Servicios
import { AuthService } from '../services/auth.service';
import { CookieService } from 'ngx-cookie-service';

// =======================
// Decorador del componente
// =======================
@Component({
  selector: 'app-inicio-sesion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './inicio-sesion.component.html',
  styleUrl: './inicio-sesion.component.css',
})
export class InicioSesionComponent implements OnInit {

  // =======================
  // Constructor e inyección de dependencias
  // =======================
  constructor(
    private fb: FormBuilder,
    private cookieService: CookieService,
    private authService: AuthService,
    private router: Router,
  ) {}

  // =======================
  // Formulario reactivo
  // =======================
  adminLoginForm = this.fb.group({
    codigo: ['', [Validators.required]],
    contrasena: ['', [Validators.required]],
  });

  // =======================
  // Mensaje de error al iniciar sesión
  // =======================
  errorMessage: string = ''; 

  // =======================
  // Verifica si hay cookies activas al iniciar el componente
  // =======================
  async ngOnInit() {
    const cookie = await this.cookieService.check('token');
    if (cookie) {
      await this.cookieService.deleteAll('cookie'); // ❗ Posible corrección: debería ser 'token' si el objetivo es borrar la sesión actual
    }
  }

  // =======================
  // Procesar envío del formulario de login
  // =======================
  onSubmit(): void {
    const formData = this.adminLoginForm.value;

    const loginData = {
      codigo: formData.codigo,
      contrasena: formData.contrasena,
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.cookieService.set('token', response.token);
        this.router.navigate(['/', 'home']);
      },
      error: (e) => {
        console.log('error: ', e);
        if (e.status === 401) {
          this.errorMessage = 'Credenciales incorrectas';
        } else {
          this.errorMessage =
            'Se produjo un error. Por favor, inténtalo de nuevo.';
        }
      },
    });
  }
}
