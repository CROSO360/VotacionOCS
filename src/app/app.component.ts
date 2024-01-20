import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  //providers: [CookieService]
})
export class AppComponent {
  title = 'VotacionOCS';
}
