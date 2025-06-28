import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogActions } from '@angular/material/dialog';
import { AlertService } from '../../../services/alert.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { environment } from '../../../../environments/environment';
import { FirebaseStorageService } from '../../../services/firebaseStorage.service';
import { BannerService } from '../../../services/banner.service';


@Component({
  selector: 'app-dialog-gestionar-banner',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIcon, MatDialogActions],
  templateUrl: './dialog-gestionar-banner.component.html',
  styleUrl: './dialog-gestionar-banner.component.css'
})
export class DialogGestionarBannerComponent {
  private dialogRef = inject(MatDialogRef<DialogGestionarBannerComponent>);
  private storageService = inject(FirebaseStorageService);

  readonly maxFileSizeMB = environment.uploadConfig.maxFileSizeMB;
  readonly maxFileSizeBytes = this.maxFileSizeMB * 1024 * 1024;
  selectedFile: File | null = null;
  fileName: string = '';
  modeImage: boolean = false;

  constructor(
    private alert: AlertService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private bannerService: BannerService
  ) { }

  public form: FormGroup = this.fb.group({
    fraseBanner: ['', Validators.required],
    urlBanner: ['', Validators.required]
  });

  ngOnInit() {
    console.log('Datos recibidos en el diálogo:', this.data);
    this.form.patchValue({
      fraseBanner: this.data.fraseBanner,
      urlBanner: this.data.urlBanner
    });
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
      this.modeImage = true;
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
    const mensaje = '¿Deseas actualizar el banner?';

    const confirmacion = 'Actualizando banner...';

    let url = this.form.value.urlBanner;
    if (this.modeImage) {
      url = await this.uploadFile();
    }

    const datosBanner = {
      id: this.data.id,
      fraseBanner: this.form.value.fraseBanner,
      urlBanner: url,
      estadoBanner: true
    };

    this.alert.confirm(mensaje, 'Verifica que todos los datos sean correctos')
      .then(result => {
        if (!result.isConfirmed) return;

        this.alert.loading(confirmacion);

        const observable = this.bannerService.actualizarBanner(datosBanner);

        observable.subscribe({
          next: async (response: any) => {
            this.alert.close();

            const mensajeExito = 'Actualización exitosa.';
            const detalleExito = 'El banner fue actualizado correctamente';

            this.alert.success(mensajeExito, detalleExito);

            this.cerrarFormulario(true);
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
  cerrarFormulario(r: boolean) {
    this.dialogRef.close(r);
  }
}
