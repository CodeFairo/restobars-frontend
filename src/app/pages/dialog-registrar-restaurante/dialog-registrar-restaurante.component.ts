import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { RestobarService } from '../../services/restobar.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { UploadMenuDialogComponent } from '../upload-menu-dialog/upload-menu-dialog.component';
import { GoogleMapsModule } from '@angular/google-maps';
import html2canvas from 'html2canvas';
import { FirebaseStorageService } from '../../services/firebaseStorage.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dialog-registrar-restaurante',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    GoogleMapsModule,
  ],
  templateUrl: './dialog-registrar-restaurante.component.html',
  styleUrl: './dialog-registrar-restaurante.component.css'
})
export class DialogRegistrarRestauranteComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<DialogRegistrarRestauranteComponent>);
  private restobarService = inject(RestobarService);
  private authService = inject(AuthService);
  private userId = this.authService.getUserId() ?? '';
  public isEditMode = false;
  private uploadedUrl = "";
  private qrReady = false;
  map!: google.maps.Map;
  marker!: google.maps.Marker;
  geocoder = new google.maps.Geocoder();

  constructor(
    private alert: AlertService,
    private dialog: MatDialog,
    private storageService: FirebaseStorageService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  public form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    logoUrl: [''],
    direccion: ['', Validators.required],
    latitud: ['', Validators.required],
    longitud: ['', Validators.required]
  });

  ngOnInit(): void {
    if (this.data) {
      this.isEditMode = true;
      this.form.patchValue({
        name: this.data.name,
        description: this.data.description,
        logoUrl: this.data.logoUrl,
        direccion: this.data.direccion,
        latitud: this.data.latitud,
        longitud: this.data.longitud
      });
    }
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  initMap(): void {
    const mapElement = document.getElementById('map') as HTMLElement;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          this.map = new google.maps.Map(mapElement, {
            center: userLocation,
            zoom: 15
          });

          this.placeMarker(userLocation);

          // Guardar datos iniciales
          this.updateLocation(userLocation.lat, userLocation.lng);

          // Escuchar clicks para mover marcador
          this.map.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              const lat = e.latLng.lat();
              const lng = e.latLng.lng();
              this.marker.setPosition(e.latLng);
              this.updateLocation(lat, lng);
            }
          });

          // Hacer el marcador draggable y actualizar datos cuando se termine de arrastrar
          this.marker.setDraggable(true);
          this.marker.addListener('dragend', () => {
            const pos = this.marker.getPosition();
            if (pos) {
              this.updateLocation(pos.lat(), pos.lng());
            }
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

  registrar() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const mensaje = this.isEditMode
      ? '¿Deseas actualizar el restaurante?'
      : '¿Deseas registrar el restaurante?';

    const confirmacion = this.isEditMode
      ? 'Actualizando restaurante...'
      : 'Registrando restaurante...';

    const datosRestobar = {
      userId: this.userId,
      ...this.form.value
    };

    this.alert.confirm(mensaje, 'Verifica que todos los datos sean correctos')
      .then(result => {
        if (!result.isConfirmed) return;

        this.alert.loading(confirmacion);

        const observable = this.isEditMode
          ? this.restobarService.actualizar(this.data.id, datosRestobar)
          : this.restobarService.registrar(datosRestobar); // Este debe retornar el ID creado

        observable.subscribe({
          next: async (response: any) => {
            this.alert.close();

            const mensajeExito = this.isEditMode ? 'Actualización exitosa' : 'Registro exitoso';
            const detalleExito = this.isEditMode
              ? 'El restaurante fue actualizado correctamente'
              : 'El restaurante fue registrado correctamente';

            this.alert.success(mensajeExito, detalleExito);

            if (response?.id) {
              const datosRestobar = {
                logoUrl: this.uploadedUrl,
              };
              await this.capturarUbicacionYSubir(response.id);
              this.restobarService.actualizar(this.data.id, datosRestobar)
            }

            this.dialogRef.close(true);
          },
          error: (err) => {
            this.alert.close();
            console.error('Error:', err);
            const mensajeError = this.isEditMode ? 'Error al actualizar' : 'Error al registrar';
            this.alert.error(mensajeError, 'Ocurrió un error en el proceso');
          }
        });
      });
  }

  async capturarUbicacionYSubir(restobarId: number): Promise<void> {
    const lat = this.form.get('latitud')?.value;
    const lng = this.form.get('longitud')?.value;

    if (!lat || !lng) {
      console.warn('No hay latitud o longitud para capturar el mapa');
      return;
    }

    const apiKey = environment.googleMapsApiKey.googleMapsApiKey;
    const zoom = 17;
    const size = '600x400';
    const marker = `color:red|label:R|${lat},${lng}`;
    const url = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${size}&markers=${marker}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const blob = await response.blob();

      const file = new File([blob], `ubicacion.png`, { type: 'image/png' });
      const filePath = `restobars/restobar-${restobarId}/ubicacion.png`;

      const uploadedUrl = await this.storageService.uploadFile(file, filePath);
      this.uploadedUrl = uploadedUrl;
      this.qrReady = true;

    } catch (err) {
      console.error('Error al capturar mapa de ubicación', err);
    }
  }
  /*async capturarUbicacionYSubir(restobarId: number): Promise<void> {
    const mapElement = document.getElementById('map');

    if (!mapElement) return;

    const canvas = await html2canvas(mapElement);
    const blob: Blob = await new Promise(resolve => canvas.toBlob(blob => resolve(blob!), 'image/png'));

    const file = new File([blob], 'ubicacion.png', { type: 'image/png' });

    const filePath = `restobars/restobar-${restobarId}/ubicacion.png`;

    try {
      const url = await this.storageService.uploadFile(file, filePath);
      console.log('Ubicación cargada a storage:', url);
    } catch (err) {
      console.error('Error al subir la imagen de ubicación:', err);
    }
  }*/

  cancelar() {
    this.dialogRef.close();
  }
}
