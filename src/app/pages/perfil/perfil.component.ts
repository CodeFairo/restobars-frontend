import { Component, inject, OnInit } from '@angular/core';
import { PerfilService } from '../../services/perfil.service';
import { PerfilResponse } from '../../interfaces/Perfil';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-perfil',
    standalone: true,
    imports: [CommonModule, MatFormFieldModule,
        MatInputModule, MatSelectModule,
        MatCardModule, MatButtonModule,
        MatIconModule, MatDividerModule
    ],
    templateUrl: './perfil.component.html',
    styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  perfil?: PerfilResponse;
  cargando = true;
  error = false;


  perfilService = inject(PerfilService);

  ngOnInit(): void {

    this.perfilService.obtenerPerfil().subscribe({
      next: (data) => {
        this.perfil = data;
        this.cargando = false;
      },
      error: () => {
        this.error = true;
        this.cargando = false;
      }
    });
  }
}
