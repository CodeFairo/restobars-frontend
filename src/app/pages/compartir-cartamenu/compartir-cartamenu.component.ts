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
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { QrCodeComponent  } from 'ng-qrcode';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AlertService } from '../../services/alert.service';

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
    QrCodeComponent,
    MatInputModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    ReactiveFormsModule,          
    FormsModule,
  ],
  templateUrl: './compartir-cartamenu.component.html',
  styleUrl: './compartir-cartamenu.component.css'
})
export class CompartirCartamenuComponent implements OnInit{
  restobares: Restobar[] = [];
  selectedRestobarId: number | null = null;
  urlMenu: string = '';
  loading = false;
  menuDiaItem: string = '';
  menuDia: string[] = [];

  constructor(
    private restobarService: RestobarService,
    private complementoService: RestobarMenuComplementoService,
    private dialog: MatDialog,
    private alert: AlertService,
  ) {}

  ngOnInit(): void {
    this.restobarService.listaRestobarsPorUsuario().subscribe({
      next: (data) => this.restobares = data,
      error: (err) => console.error('Error cargando restaurantes del usuario', err)
    });
  }

  onRestobarSelected(): void {
    if (!this.selectedRestobarId) return;
    this.loading = true;
    this.urlMenu = '';
    this.menuDia = []; // Limpia la lista anterior

    this.complementoService.getByRestobarId(this.selectedRestobarId).subscribe({
      next: (res: RestobarMenuComplemento | null) => {
        this.urlMenu = res?.urlMenu || '';

        if (res?.menuDiario) {
          try {
            this.menuDia = JSON.parse(res.menuDiario);
          } catch (e) {
            console.error('Error al parsear menú del día', e);
            this.menuDia = [];
          }
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Error obteniendo menú', err);
        this.loading = false;
      }
    });
  }
 
  abrirDialogoCargarMenu() {
    const jsonMenu = JSON.stringify(this.menuDia);
    const dialogRef = this.dialog.open(UploadMenuDialogComponent, {
      data: { 
        restobarId: this.selectedRestobarId, 
        menuDiario: jsonMenu
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      // Vuelve a cargar el menú después de cerrar el diálogo
      this.onRestobarSelected();
    });
  }    

  copyLink(): void {
    navigator.clipboard.writeText(this.urlMenu).then(() => {
      alert('Link copiado al portapapeles');
    });
  }

  verCartaMenu(): void {
    window.open(this.urlMenu, '_blank');
  }

  downloadQR(): void {
    const qrElement = document.getElementById('qr-code');
    if (!qrElement) return;

    html2canvas(qrElement, { backgroundColor: null }).then((canvas) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { data, width, height } = imgData;

      let top = height, left = width, right = 0, bottom = 0;

      // Detect non-transparent pixel bounds
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const alpha = data[idx + 3];
          if (alpha > 0) {
            if (x < left) left = x;
            if (x > right) right = x;
            if (y < top) top = y;
            if (y > bottom) bottom = y;
          }
        }
      }

      const croppedWidth = right - left + 1;
      const croppedHeight = bottom - top + 1;

      // Create cropped canvas
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = croppedWidth;
      croppedCanvas.height = croppedHeight;
      const croppedCtx = croppedCanvas.getContext('2d');
      if (!croppedCtx) return;

      croppedCtx.putImageData(ctx.getImageData(left, top, croppedWidth, croppedHeight), 0, 0);

      // Trigger download
      const link = document.createElement('a');
      link.download = 'menu-qr.png';
      link.href = croppedCanvas.toDataURL();
      link.click();
    });
  }


  agregarItemMenuDia(): void {
    const item = this.menuDiaItem.trim();
    if (item) {
      this.menuDia.push(item);
      this.menuDiaItem = '';
    }
    this.actualizarMenuDia();
  }

  eliminarItemMenuDia(index: number): void {
    this.menuDia.splice(index, 1);
    this.actualizarMenuDia();
  }

  actualizarMenuDia(): void {
    if (!this.selectedRestobarId) {
      return;
    }

    const jsonMenu = JSON.stringify(this.menuDia);

    const dto: RestobarMenuComplemento = {
      restobarId: this.selectedRestobarId,
      menuDiario: jsonMenu,
    };

    try {
      // Aquí reemplaza por tu llamada real al backend
      this.complementoService.create(dto).subscribe({
        next: () => {
          //this.alert.close();
          //this.alert.success('Menu del día cargado correctamente.');
        },
        error: (err) => {
          //this.alert.close();
          this.alert.error('Error', 'Ocurrió un error al grabar el menu');
        }
      });
    } catch (err) {
      this.alert.error('Error', 'Ocurrió un error al grabar el menu');
    } finally {
      this.alert.close();
    }
  }
  
}
