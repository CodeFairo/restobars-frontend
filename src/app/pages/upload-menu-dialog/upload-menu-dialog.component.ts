import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FirebaseStorageService } from '../../services/firebaseStorage.service';
import { RestobarMenuComplementoService } from '../../services/restobarMenuComplemento.service';
import { RestobarMenuComplemento } from '../../interfaces/RestobarMenuComplemento';
import { MatButtonModule } from '@angular/material/button';
import { AlertService } from '../../services/alert.service';
import { environment } from '../../../environments/environment';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-upload-menu-dialog',
  standalone: true, 
  imports: [
    MatButtonModule,
    MatDividerModule,
  ],
  templateUrl: './upload-menu-dialog.component.html',
  styleUrl: './upload-menu-dialog.component.css'
})
export class UploadMenuDialogComponent {
  file: File | null = null;
  uploadInProgress = false;
  uploadedUrl = '';
  qrReady = false;

  readonly maxFileSizeMB = environment.uploadConfig.maxFileSizeMB;
  readonly maxFileSizeBytes = this.maxFileSizeMB * 1024 * 1024;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { restobarId: number,menuDiario:string },
    private dialogRef: MatDialogRef<UploadMenuDialogComponent>,
    private storageService: FirebaseStorageService,
    private complementoService: RestobarMenuComplementoService,
    private alert: AlertService,
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const selectedFile = input.files[0];

      const isImageOrPdf = selectedFile.type.startsWith('image/') || selectedFile.type === 'application/pdf';

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

      this.file = selectedFile;
    }
  }

  async upload(): Promise<void> {
    if (!this.file) return;

    const extension = this.file.name.split('.').pop()?.toLowerCase() ?? 'pdf';
    const filePath = `restobars/restobar-${this.data.restobarId}/menu.${extension}`;

    this.alert.loading('Cargando la carta...');
    try {
      const url = await this.storageService.uploadFile(this.file, filePath);
      this.uploadedUrl = url;
      this.qrReady = true;

      const dto: RestobarMenuComplemento = {
        restobarId: this.data.restobarId,
        urlMenu: url,
        menuDiario: this.data.menuDiario
      };

      this.complementoService.create(dto).subscribe({
        next: () => {
          this.alert.close();
          this.alert.success('Carta cargada correctamente.');
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.alert.close();
          console.error('Error al registrar restaurante:', err);
          this.alert.error('Error', 'Ocurrió un error al grabar la carta');
        }
      });
    } catch (err) {
      this.alert.error('Error', 'Ocurrió un error al cargar la carta');
    } finally {
      this.alert.close();
    }
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
