import { Component, OnInit } from '@angular/core';
import { Restobar } from '../../interfaces/Restobar';
import { RestobarService } from '../../services/restobar.service';
import { RestobarMenuComplementoService } from '../../services/restobarMenuComplemento.service';
import { RestobarMenuComplemento } from '../../interfaces/RestobarMenuComplemento';
import html2canvas from 'html2canvas';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, NgIf } from '@angular/common';
import { UploadMenuDialogComponent } from '../upload-menu-dialog/upload-menu-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { SafeUrlPipe } from '../../utils/safe-url.pipe';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-compartir-cartamenu',
  standalone: true,
  imports: [
    MatButtonModule,
    NgIf,
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    SafeUrlPipe,
    //UploadMenuDialogComponent,
  ],
  templateUrl: './compartir-cartamenu.component.html',
  styleUrl: './compartir-cartamenu.component.css'
})
export class CompartirCartamenuComponent implements OnInit{
  restobares: Restobar[] = [];
  selectedRestobarId: number | null = null;
  urlMenu: string = '';
  loading = false;

  constructor(
    private restobarService: RestobarService,
    private menuService: RestobarMenuComplementoService
  ) {}

  ngOnInit(): void {
    this.restobarService.lista().subscribe({
      next: (data) => this.restobares = data,
      error: (err) => console.error('Error cargando restaurantes del usuario', err)
    });
  }

  onRestobarSelected(): void {
    if (!this.selectedRestobarId) return;
    this.loading = true;
    this.urlMenu = '';

    this.menuService.getByRestobarId(this.selectedRestobarId).subscribe({
      next: (res: RestobarMenuComplemento | null) => {
        this.urlMenu = res?.urlMenu || '';
        this.loading = false;
      },
      error: (err) => {
        console.error('Error obteniendo menú', err);
        this.loading = false;
      }
    });
  }

  copyLink(): void {
    navigator.clipboard.writeText(this.urlMenu).then(() => {
      alert('Link copiado al portapapeles');
    });
  }

  downloadQR(): void {
    const qrElement = document.getElementById('qr-code');
    if (!qrElement) return;

    html2canvas(qrElement).then((canvas) => {
      const link = document.createElement('a');
      link.download = 'menu-qr.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  }
}
