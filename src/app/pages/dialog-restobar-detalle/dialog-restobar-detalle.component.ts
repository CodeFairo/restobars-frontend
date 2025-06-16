import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import html2canvas from 'html2canvas';
import { QrCodeComponent } from 'ng-qrcode';
import { FormBuilder} from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-dialog-restobar-detalle',
  standalone: true,
  imports: [QrCodeComponent, NgIf, NgFor],
  templateUrl: './dialog-restobar-detalle.component.html',
  styleUrl: './dialog-restobar-detalle.component.css'
})
export class DialogRestobarDetalleComponent {
  private fb = inject(FormBuilder);
  map!: google.maps.Map;
  marker!: google.maps.Marker;
  geocoder = new google.maps.Geocoder();
  mostrarTodosLosItems: boolean = false;


  constructor(public dialogRef: MatDialogRef<any>, @Inject(MAT_DIALOG_DATA) public data: any) {
    console.log('Datos del diálogo:', data);
  }

  ngAfterViewInit() {
    this.mostrarMapa();
  }

  copyLink(): void {
    navigator.clipboard.writeText(this.data.urlMenu).then(() => {
      alert('Link copiado al portapapeles');
    });
  }

  verCartaMenu(): void {
    window.open(this.data.urlMenu, '_blank');
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

  mostrarMapa(): void {
    const mapaElemento = document.getElementById('map');

    if (!mapaElemento) return;

    const ubicacion = new google.maps.LatLng(this.data.restobar.latitud, this.data.restobar.longitud);

    const opcionesMapa = {
      center: ubicacion,
      zoom: 15
    };

    const mapa = new google.maps.Map(mapaElemento, opcionesMapa);

    new google.maps.Marker({
      position: ubicacion,
      map: mapa,
      title: 'Ubicación seleccionada'
    });
  }

  cerrarDialog(): void {
    this.dialogRef.close();
  }
}
