import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import html2canvas from 'html2canvas';
import { QrCodeComponent } from 'ng-qrcode';
import { FormBuilder } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AlertService } from '../../services/alert.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LandingService } from '../../services/landing.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-dialog-restobar-detalle',
  standalone: true,
  imports: [
    QrCodeComponent,
    NgIf,
    NgFor,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule, NgClass
  ],
  templateUrl: './dialog-restobar-detalle.component.html',
  styleUrl: './dialog-restobar-detalle.component.css'
})
export class DialogRestobarDetalleComponent {
  map!: google.maps.Map;
  marker!: google.maps.Marker;
  geocoder = new google.maps.Geocoder();
  mostrarTodosLosItems: boolean = false;
  datosRestorbar: any;
  datosRestorbarComplemento: any;
  private alert = inject(AlertService);
  private router = inject(Router);

  menuDia: any[] = [];
  mostrarDetalles: boolean = false;
  mostrarMenu: boolean = false;

  constructor(private route: ActivatedRoute,
    private landingService: LandingService) {

  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const restobarStr = localStorage.getItem('data-restobar-detalle');

    if (restobarStr) {
      try {
        this.datosRestorbar = JSON.parse(restobarStr);
      } catch (e) {
        console.error('Error al parsear datosRestorbar', e);
        this.datosRestorbar = {};
      }

      this.landingService.getDetalleRestobar(id).subscribe({
        next: (res) => {

          if (res?.menuDiario) {
            try {
              this.menuDia = JSON.parse(res.menuDiario);
            } catch (e) {
              console.error('Error al parsear menú del día', e);
              this.menuDia = [];
            }
            console.log('Menú del día:', this.menuDia);
          }
        },
        error: (err) => {
          console.error('Error al cargar detalles del restobar', err);
        }
      });

    } else {
      console.warn('No se encontraron datos de restobar en localStorage');
    }
  }


  ngAfterViewInit() {
    this.mostrarMapa();
  }

  copyLink(): void {
    const url = this.datosRestorbar?.urlMenu;
    if (url) {
      navigator.clipboard.writeText(url).then(() => {
        this.alert.success('Enlace copiado al portapapeles');
      });
    }
  }

  verCartaMenu(): void {
    const url = this.datosRestorbar?.urlMenu;
    if (url) {
      window.open(url, '_blank');
    }
  }

  downloadQR(): void {
    const qrElement = document.getElementById('qr-code');
    console.log("qrElement", qrElement);
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

    const ubicacion = new google.maps.LatLng(this.datosRestorbar.latitud, this.datosRestorbar.longitud);

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

  toggleMenu(): void {
    if (window.innerWidth <= 493) {
      this.mostrarDetalles = !this.mostrarDetalles;
    } else {
      this.mostrarMenu = !this.mostrarMenu;
    }
  }

  get textoBotonMenu(): string {
    return (this.mostrarDetalles || this.mostrarMenu) ? 'Ocultar menú' : 'Ver menú del día';
  }

  volverLanding(): void {
    localStorage.removeItem('data-restobar-detalle');
    this.router.navigate(['']);
  }

}
