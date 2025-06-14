import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import html2canvas from 'html2canvas';
import { QrCodeComponent } from 'ng-qrcode';
import { GoogleMapsModule } from '@angular/google-maps';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-dialog-restobar-detalle',
  standalone: true,
  imports: [QrCodeComponent],
  templateUrl: './dialog-restobar-detalle.component.html',
  styleUrl: './dialog-restobar-detalle.component.css'
})
export class DialogRestobarDetalleComponent {
  private fb = inject(FormBuilder);
  map!: google.maps.Map;
  marker!: google.maps.Marker;
  geocoder = new google.maps.Geocoder();
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    console.log('Datos del diálogo:', data);
  }
  public form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    logoUrl: [''],
    direccion: ['', Validators.required],
    latitud: ['', Validators.required],
    longitud: ['', Validators.required],
    horarioAtencion: ['', Validators.required],
  });

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

  initMap(): void {
  const mapElement = document.getElementById('map') as HTMLElement;
  const defaultLocation = { lat: this.data.restobar.latitud, lng: this.data.restobar.longitud };

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        this.map = new google.maps.Map(mapElement, {
          center: defaultLocation,
          zoom: 15
        });

        this.placeMarker(userLocation);
        this.updateLocation(userLocation.lat, userLocation.lng);

        this.map.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            this.marker.setPosition(e.latLng);
            this.updateLocation(e.latLng.lat(), e.latLng.lng());
          }
        });

        this.marker.setDraggable(true);
        this.marker.addListener('dragend', () => {
          const pos = this.marker.getPosition();
          if (pos) this.updateLocation(pos.lat(), pos.lng());
        });
      },
      () => this.loadDefaultMap(mapElement)
    );
  } else {
    this.loadDefaultMap(mapElement);
  }
}


  loadDefaultMap(mapElement: HTMLElement) {
    const defaultLocation = { lat: -12.0464, lng: -77.0428 };

    this.map = new google.maps.Map(mapElement, {
      center: defaultLocation,
      zoom: 12
    });

    this.placeMarker(defaultLocation);
    this.updateLocation(defaultLocation.lat, defaultLocation.lng);

    this.map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        this.marker.setPosition(e.latLng);
        this.updateLocation(lat, lng);
      }
    });

    this.marker.setDraggable(true);
    this.marker.addListener('dragend', () => {
      const pos = this.marker.getPosition();
      if (pos) {
        this.updateLocation(pos.lat(), pos.lng());
      }
    });
  }

  placeMarker(position: { lat: number; lng: number }) {
    if (this.marker) {
      this.marker.setPosition(position);
    } else {
      this.marker = new google.maps.Marker({
        position,
        map: this.map,
        title: 'Ubicación seleccionada',
        draggable: true
      });

      // Se agrega aquí el listener por si se crea el marcador aquí
      this.marker.addListener('dragend', () => {
        const pos = this.marker.getPosition();
        if (pos) {
          this.updateLocation(pos.lat(), pos.lng());
        }
      });
    }
    this.map.panTo(position);
  }

  updateLocation(lat: number, lng: number) {
    this.form.patchValue({
      latitud: lat,
      longitud: lng
    });

    this.geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        this.form.patchValue({
          direccion: results[0].formatted_address
        });
      } else {
        console.warn('No se pudo obtener la dirección:', status);
      }
    });
  }
}
