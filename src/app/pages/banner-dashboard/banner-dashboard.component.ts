import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { BannerService } from '../../services/banner.service';
import { DashBoardBanner, DashBoardBannerResponse } from '../../interfaces/DashBoardBanner';
import { MatTableModule } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgClass } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogActions } from '@angular/material/dialog';
import { FirebaseStorageService } from '../../services/firebaseStorage.service';
import { AlertService } from '../../services/alert.service';
import { environment } from '../../../environments/environment';
import { NgIf } from '@angular/common';
import { DialogGestionarBannerComponent } from '../administrador/dialog-gestionar-banner/dialog-gestionar-banner.component';
@Component({
  selector: 'app-banner-dashboard',
  standalone: true,
  imports: [MatCardModule, MatTableModule, MatIconModule, MatTooltipModule, NgClass, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDialogActions, NgIf],
  templateUrl: './banner-dashboard.component.html',
  styleUrl: './banner-dashboard.component.css'
})
export class BannerDashboardComponent implements OnInit {
  public banners: DashBoardBanner[] = [];
  loading = false;
  public displayedColumns: string[] = ['fraseBanner', 'urlBanner', 'actions'];
  private breakpointSub!: Subscription;
  private breakpointObserver = inject(BreakpointObserver);
  private storageService = inject(FirebaseStorageService);
  private dialog = inject(MatDialog);

  selectedFile: File | null = null;
  fileName: string = '';
  mostrar = false;
  urlFirebase: string = '';

  readonly maxFileSizeMB = environment.uploadConfig.maxFileSizeMB;
  readonly maxFileSizeBytes = this.maxFileSizeMB * 1024 * 1024;

  constructor(private bannerService: BannerService, private fb: FormBuilder, private alert: AlertService,) {

  }

  public form: FormGroup = this.fb.group({
    fraseBanner: ['', Validators.required],
    urlBanner: ['', Validators.required]
  });


  ngOnInit(): void {
    this.loadBanners();

    this.breakpointSub = this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).subscribe(result => {
      if (result.matches) {
        this.displayedColumns = ['fraseBanner', 'actions']; // Oculta fraseBanner en pantallas pequeñas
      } else {
        this.displayedColumns = ['fraseBanner', 'urlBanner', 'actions']; // Muestra todas en pantallas más grandes
      }
    });
  }

  loadBanners() {
    this.loading = true;
    this.bannerService.listaBannersAll().subscribe({
      next: (data) => {
        this.banners = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading banners:', error);
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.breakpointSub) {
      this.breakpointSub.unsubscribe();
    }
  }

  mostrarFormulario() {
    this.mostrar = true;
  }

  cerrarFormulario() {
    this.mostrar = false;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const selectedFile = input.files[0];
      const isImageOrPdf = selectedFile.type.startsWith('image/');
      console.log('Archivo seleccionado:', selectedFile.name);

      if (!isImageOrPdf) {
        this.alert.error('Formato no válido', 'Solo se permiten archivos PDF o imágenes.');
        return;
      }

      if (selectedFile.size > this.maxFileSizeBytes) {
        this.alert.error(
          'Archivo demasiado grande',
          `El archivo debe pesar menos de ${this.maxFileSizeMB} MB.`
        );
        return;
      }
      this.selectedFile = selectedFile;
      this.fileName = selectedFile.name;
      this.form.patchValue({ urlBanner: this.fileName });
    } else {
      this.selectedFile = null;
      this.fileName = '';
    }
  }

  async uploadFile(): Promise<string> {
    if (!this.selectedFile) {
      throw new Error('No file selected');
    }
    const extension = this.selectedFile.name.split('.').pop()?.toLowerCase() ?? 'pdf';

    const filePath = `banners/restobar-${this.selectedFile.name}/bannerLogo.${extension}`;
    const url = this.storageService.uploadFile(this.selectedFile, filePath);
    return url;
  }

  async registrarBanner() {

    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }
    const mensaje = '¿Deseas registrar el banner?';

    const confirmacion = 'Registrando banner...';

    const url = await this.uploadFile();

    const datosBanner = {
      fraseBanner: this.form.value.fraseBanner,
      urlBanner: url,
      estadoBanner: true
    };

    console.log("datosBanner: ", datosBanner);

    this.alert.confirm(mensaje, 'Verifica que todos los datos sean correctos')
      .then(result => {
        if (!result.isConfirmed) return;

        this.alert.loading(confirmacion);

        const observable = this.bannerService.registrarBanner(datosBanner);

        observable.subscribe({
          next: async (response: any) => {
            this.alert.close();

            const mensajeExito = 'Registro exitoso';
            const detalleExito = 'El banner fue registrado correctamente';

            this.alert.success(mensajeExito, detalleExito);
            this.loadBanners();
            this.form.reset();
            this.cerrarFormulario();
          },
          error: (err) => {
            this.alert.close();
            console.error('Error:', err);
            const mensajeError = 'Error al registrar';
            this.alert.error(mensajeError, 'Ocurrió un error en el proceso');
          }
        });
      });
  }

  actualizarBanner(banner: DashBoardBanner) {
    const isSmallScreen = this.breakpointObserver.isMatched([Breakpoints.XSmall, Breakpoints.Small]);
    const dialogRef = this.dialog.open(DialogGestionarBannerComponent, {
      width: isSmallScreen ? '90%' : '50%',
      panelClass: 'custom-dialog',
      data: banner
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadBanners();
      }
    });
  }

  inactivarBanner(banner: DashBoardBanner) {    
    const nuevoEstado=!banner.estadoBanner;    
    const accion = nuevoEstado ? 'Activar' : 'Inactivar';
    this.alert.confirm(`¿Deseas ${accion} este banner?`, `El banner será ${nuevoEstado ? 'activado' : 'inactivado'}`)
      .then(result => {
        if (!result.isConfirmed) return;
        banner.estadoBanner=nuevoEstado;
        const observable = this.bannerService.cambiarEstadoBanner(banner)

        observable.subscribe({
          next: () => {
            this.alert.success(
                              `Banner ${nuevoEstado ? 'activado' : 'inactivado'} correctamente`
                         );
            this.loadBanners();
          },
          error: (err) => {
            this.alert.close();
            console.error('Error al cambiar estado del banner:', err);
            this.alert.error('Error', 'No se pudo cambiar el estado del banner');
          }
        });
      })
  }

  eliminarBanner(id: string){

    this.alert.confirm('¿Deseas eliminar este banner?','El banner será eliminado permanentemente. ')
      .then(result => {
        if (!result.isConfirmed) return;        

        const observable = this.bannerService.eliminarBanner(id);

        observable.subscribe({
          next: () => {
            this.alert.success(
                              'Banner eliminado correctamente.'
                         );
            this.loadBanners();
          },
          error: (err) => {
            this.alert.close();
            console.error('Error al eliminar el banner:', err);
            this.alert.error('Error', 'No se pudo eliminar el banner');
          }
        });
      })
  }
}


