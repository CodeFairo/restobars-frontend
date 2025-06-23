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
import { MatCheckboxModule } from '@angular/material/checkbox';

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
    MatSelectModule,
    MatCheckboxModule
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
  public mostrarMapa: boolean = true;
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
    actualizarUbicacion: [false]
  });

  ngOnInit(): void {
    if (this.data) {

      const tieneUbicacion = this.data.latitud && this.data.longitud;

      this.form.patchValue({
        name: this.data.name,
        description: this.data.description,
        logoUrl: this.data.logoUrl,
        direccion: this.data.direccion,
        latitud: this.data.latitud,
        longitud: this.data.longitud,
        horarioAtencion: this.data.horarioAtencion,
        actualizarUbicacion: !tieneUbicacion // true si no hay lat/lng
      });

      if (!tieneUbicacion) {
        this.form.get('actualizarUbicacion')?.disable(); // obligatorio actualizar ubicación
        this.mostrarMapa = true;
      } else {
        this.mostrarMapa = false;

        this.form.get('actualizarUbicacion')?.valueChanges.subscribe(value => {
          this.mostrarMapa = value;

          if (value) {
            setTimeout(() => this.initMap(), 0); // inicializa mapa cuando se marca el check
          }
        });
      }
    }
  }

  ngAfterViewInit(): void {
    // Solo carga el mapa si debe mostrarse desde el inicio
    if (this.mostrarMapa) {
      this.initMap();
    }
  }

  initMap(): void {
    const mapElement = document.getElementById('map') as HTMLElement;

    const tieneUbicacion = this.form.get('latitud')?.value && this.form.get('longitud')?.value;

    const posicionInicial = tieneUbicacion
      ? {
        lat: parseFloat(this.form.get('latitud')?.value),
        lng: parseFloat(this.form.get('longitud')?.value)
      }
      : null;

    const cargarMapa = (pos: google.maps.LatLngLiteral) => {
      this.map = new google.maps.Map(mapElement, {
        center: pos,
        zoom: 15
      });

      this.placeMarker(pos);
      this.updateLocation(pos.lat, pos.lng);

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
    };

    if (posicionInicial) {
      cargarMapa(posicionInicial);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          cargarMapa({
            lat: position.coords.latitude,
            lng: position.coords.longitude
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

    const mensaje = '¿Deseas actualizar el restaurante?'

    const confirmacion = 'Actualizando restaurante...'

    const datosRestobar = {
      userId: this.userId,
      actualizarUbicacion: this.mostrarMapa,
      ...this.form.value
    };

    this.alert.confirm(mensaje, 'Verifica que todos los datos sean correctos')
      .then(result => {
        if (!result.isConfirmed) return;

        this.alert.loading(confirmacion);

        const observable = this.restobarService.actualizar(this.data.id, datosRestobar); // Este debe retornar el ID creado

        observable.subscribe({
          next: async (response: any) => {
            this.alert.close();

            const mensajeExito = 'Actualización exitosa';
            const detalleExito = 'El restaurante fue actualizado correctamente';

            this.alert.success(mensajeExito, detalleExito);
            this.dialogRef.close(true);
          },
          error: (err) => {
            this.alert.close();
            console.error('Error:', err);
            const mensajeError = 'Error al actualizar';
            this.alert.error(mensajeError, 'Ocurrió un error en el proceso');
          }
        });
      });
  }
  
  onLogoSelected() {
    const dialogRef = this.dialog.open(UploadLogoDialogComponent, {
      data: { restobarId: this.data.id, urlMenu: this.data.urlMenu },
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
