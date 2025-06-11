import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { RestobarService } from '../../services/restobar.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { GoogleMapsModule } from '@angular/google-maps';
import { FirebaseStorageService } from '../../services/firebaseStorage.service';
import { UploadLogoDialogComponent } from '../upload-logo-dialog/upload-logo-dialog.component';
import { MatIcon } from '@angular/material/icon';
import { RestobarEventService } from '../../services/RestobarEvent.service';
import { MatSelectModule } from '@angular/material/select';

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
    MatDialogActions,
    MatIcon,
    MatSelectModule
  ],
  templateUrl: './dialog-gestionar-restaurante.component.html',
  styleUrl: './dialog-gestionar-restaurante.component.css'
})
export class DialogGestionarRestauranteComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<DialogGestionarRestauranteComponent>);
  private restobarService = inject(RestobarService);
  private authService = inject(AuthService);
  private userId = this.authService.getUserId() ?? '';
  public isEditMode = false;
  map!: google.maps.Map;
  marker!: google.maps.Marker;
  geocoder = new google.maps.Geocoder();

  constructor(
    private alert: AlertService,
    private dialog: MatDialog,
    private storageService: FirebaseStorageService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private restobarEventService: RestobarEventService,
  ) {}

  public form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    logoUrl: [''],
    direccion: ['', Validators.required],
    latitud: ['', Validators.required],
    longitud: ['', Validators.required],
    horarioAtencion: ['', Validators.required],
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
        longitud: this.data.longitud,
        horarioAtencion : this.data.horarioAtencion
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

  actualizar() {
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
  
  onLogoSelected() {
    const dialogRef = this.dialog.open(UploadLogoDialogComponent, {
      data: { restobarId: this.data.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Vuelve a cargar el menú después de cerrar el diálogo
      this.restobarEventService.notifyRefresh();
    });
    
  } 

  cancelar() {
    this.dialogRef.close();
  }
}
