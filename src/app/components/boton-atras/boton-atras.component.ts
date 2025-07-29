import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-boton-atras',
  standalone: true,
  imports: [],
  templateUrl: './boton-atras.component.html',
  styleUrl: './boton-atras.component.css'
})
export class BotonAtrasComponent {

  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }

}
