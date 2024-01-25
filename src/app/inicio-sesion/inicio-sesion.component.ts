import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { GrupoUsuarioService } from '../services/grupoUsuario.service';

@Component({
  selector: 'app-inicio-sesion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './inicio-sesion.component.html',
  styleUrl: './inicio-sesion.component.css',
})
export class InicioSesionComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private cookieService: CookieService,
    private authService: AuthService,
    private router: Router,
  ) {}

  adminLoginForm = this.fb.group({
    codigo: ['', [Validators.required]],
    contrasena: ['', [Validators.required]],
  });

  errorMessage: string = ''; 

  async ngOnInit() {
     const cookie = await this.cookieService.check('token');
    if (cookie) {
      await this.cookieService.deleteAll('cookie');
    }
  }

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
