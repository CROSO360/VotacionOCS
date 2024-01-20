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

  constructor(
    private cookieService: CookieService,
    private router: Router,
  ){}

  logout(){
    this.cookieService.deleteAll('token');
    this.router.navigate(['/', 'login']);
  }

}
