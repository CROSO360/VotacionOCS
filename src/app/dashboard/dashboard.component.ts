import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SesionService } from '../services/sesion.service';
import { ISesion } from '../interfaces/ISesion';
import { Router, RouterOutlet } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from 'jwt-decode';
import { BarraSuperiorComponent } from "../barra-superior/barra-superior.component";

@Component({
    selector: 'app-dashboard',
    standalone: true,
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, BarraSuperiorComponent]
})
export class DashboardComponent implements OnInit {
  constructor(
    private sesionService: SesionService, 
    private router: Router,
    private cookieService: CookieService
    ) {}

  sesiones: ISesion[] = [];

  payload: any = jwtDecode(this.cookieService.get('token'))

  ngOnInit() {
    this.getSesiones();
  }

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

  irADetalleSesion(id: number){
    if (id) {
      const idString = id.toString();
      this.router.navigate(['/sesion', idString]);
    } else {
      console.error(`ID de sesión no definido: ${id} lol`);
    }
  }

  irAUsuarios(){
    this.router.navigate(['/usuarios'])
  }

  irASesiones(){
    this.router.navigate(['/sesiones'])
  }

  irAMiembros(){
    this.router.navigate(['/miembros'])
  }

}
