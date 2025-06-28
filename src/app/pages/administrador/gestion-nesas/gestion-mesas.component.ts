import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { RestobarService } from '../../../services/restobar.service';
import { MesaService } from '../../../services/mesa.service';
import { Restobar } from '../../../interfaces/Restobar';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-gestion-mesas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatOptionModule
  ],
  templateUrl: './gestion-mesas.component.html',
  styleUrl: './gestion-mesas.component.css'
})
export class GestionMesasComponent implements OnInit {
  selectedRestobarId: number | null = null;
  misRestobars: Restobar[] = [];
  mesas: { numero: number, capacidad: number }[] = [];
  nuevaCapacidad: number = 1;
  loading = false;
  mesaColores: string[] = [];

  constructor(
    private restobarService: RestobarService,
    private mesaService: MesaService,
    private alert: AlertService,
  ) { }

  ngOnInit(): void {
    this.restobarService.listaRestobarsPorUsuario().subscribe({
      next: (res) => this.misRestobars = res,
      error: (err) => console.error('Error cargando restaurantes del usuario', err)
    });
  }

  onRestobarSelected(): void {
    if (!this.selectedRestobarId) return;
    this.loading = true;

    this.mesaService.listarPorRestobar(this.selectedRestobarId).subscribe({

      next: (resp) => {
        if (resp?.mesasJson) {
          try {
            this.mesas = JSON.parse(resp.mesasJson);
            this.mesaColores = this.mesas.map(() => this.generarColorAleatorio());
          } catch (err) {
            console.error('Error al parsear el menú JSON:', err);
            this.mesas = [];
          }
        } else {
          this.mesas = [];
        }

        this.loading = false;
      },
      error: (err) => {
        console.warn('No se encontró menú para este restaurante', err);
        this.mesas = [];
        this.loading = false;
      }
    });
  }

  agregarMesa(): void {
    const nuevoNumero = this.mesas.length ? Math.max(...this.mesas.map(m => m.numero)) + 1 : 1;
    this.mesas.push({ numero: nuevoNumero, capacidad: this.nuevaCapacidad });
    this.mesaColores.push(this.generarColorAleatorio()); // 👈 agregar color
    this.nuevaCapacidad = 1;
  }

  eliminarMesa(index: number): void {
    this.mesas.splice(index, 1);
    this.mesaColores.splice(index, 1); // 👈 eliminar color correspondiente
  }

  guardarCambios(): void {
    if (!this.selectedRestobarId) return;
    const json = JSON.stringify(this.mesas);
    this.mesaService.guardarMesas(this.selectedRestobarId, json).subscribe({
      next: () => this.alert.success('Mesas guardadas exitosamente')
    });
  }

  eliminarTodasMesas(): void {
    if (!this.selectedRestobarId) return;

    this.alert.confirm('¿Estás seguro de eliminar todas las mesas?').then((confirmado) => {
      if (!confirmado.isConfirmed) return;

      this.mesas = [];
      this.mesaColores = [];

      if (!this.selectedRestobarId) return;

      this.mesaService.guardarMesas(this.selectedRestobarId, JSON.stringify(this.mesas)).subscribe({
        next: () => this.alert.success('Todas las mesas fueron eliminadas exitosamente'),
        error: (err) => {
          console.error('Error al guardar la lista vacía', err);
          this.alert.error('Error al eliminar las mesas');
        }
      });
    });
  }


  private generarColorAleatorio(): string {
    const colores = ['#FFCDD2', '#F8BBD0', '#E1BEE7', '#D1C4E9', '#BBDEFB', '#B2EBF2', '#C8E6C9', '#DCEDC8', '#FFF9C4', '#FFE0B2'];
    return colores[Math.floor(Math.random() * colores.length)];
  }
}
