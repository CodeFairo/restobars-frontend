import { Component, inject, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { FooterComponent } from "../../layout/footer/footer.component";
import { Restobar } from '../../interfaces/Restobar';
import { RestobarService } from '../../services/restobar.service';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    FooterComponent,
    MatCardModule,
    CommonModule
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit {
  private router = inject(Router);
  private restobarService = inject(RestobarService);
  constructor(private http: HttpClient) { }

  restobares: Restobar[] = [];


  ingresar() {
    this.router.navigate(['login']);
  }

  registrarse() {
    this.router.navigate(['registro'])
  }

  verDetalle(restobar: Restobar) {
    // Aquí podrías abrir un modal o navegar a otra ruta
    console.log('Detalle de:', restobar);
  }
  ngOnInit(): void {
    this.restobarService.listaAll().subscribe({
      next: (data) => {
        this.restobares = data;
      },
      error: (error) => {
        console.error('Error al cargar los restobares:', error);
      }
    });
  }

}
