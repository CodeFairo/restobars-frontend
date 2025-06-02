import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { Restobar } from '../../interfaces/Restobar';
import { RestobarService } from '../../services/restobar.service';

@Component({
  selector: 'app-visualizar-menu',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    MatSelectModule,
    // QrCodeComponent
  ],
  templateUrl: './visualizar-menu.component.html',
  styleUrl: './visualizar-menu.component.css'
})
export class VisualizarMenuComponent {
  restobares: Restobar[] = [];
  selectedRestobarId: number | null = null;
  urlMenu: string = '';
  loading = false;

  constructor(
    private restobarService: RestobarService,
    private menuService: RestobarMenuComplementoService
  ) {}

  ngOnInit(): void {
    this.restobarService.getAll().subscribe({
      next: (data) => this.restobares = data,
      error: (err) => console.error('Error cargando restaurantes', err)
    });
  }

  onRestobarSelected(): void {
    if (!this.selectedRestobarId) return;
    this.loading = true;
    this.urlMenu = '';

    this.menuService.getByRestobarId(this.selectedRestobarId).subscribe({
      next: (res) => {
        this.urlMenu = res?.urlMenu || '';
        this.loading = false;
      },
      error: (err) => {
        console.error('Error obteniendo menú', err);
        this.loading = false;
      }
    });
  }
}
