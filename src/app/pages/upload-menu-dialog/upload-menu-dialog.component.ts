import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FirebaseStorageService } from '../../services/firebaseStorage.service';
import { RestobarMenuComplementoService } from '../../services/restobarMenuComplemento.service';
import { RestobarMenuComplemento } from '../../interfaces/RestobarMenuComplemento';
import { MatButtonModule } from '@angular/material/button';
//import { QrCodeComponent } from 'ng-qrcode';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-upload-menu-dialog',
  standalone: true, 
  imports: [
    //QrCodeComponent,
    MatButtonModule,
    NgIf
    // importa aquí cualquier otro módulo necesario, como MatDialogModule, etc.
  ],
  templateUrl: './upload-menu-dialog.component.html',
})
export class UploadMenuDialogComponent {
  file: File | null = null;
  uploadInProgress = false;
  uploadedUrl = '';
  qrReady = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { restobarId: number },
    private dialogRef: MatDialogRef<UploadMenuDialogComponent>,
    private storageService: FirebaseStorageService,
    private complementoService: RestobarMenuComplementoService
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.file = input.files[0];
    }
  }

  async upload(): Promise<void> {
    if (!this.file) return;

    this.uploadInProgress = true;
    const filePath = `menus/restobar-${this.data.restobarId}-${Date.now()}.png`;
    console.log(filePath);
    try {
      const url = await this.storageService.uploadFile(this.file, filePath);
      this.uploadedUrl = url;
      this.qrReady = true;

      const dto: RestobarMenuComplemento = {
        restobarId: this.data.restobarId,
        urlMenu: url
      };

      this.complementoService.create(dto).subscribe({
        next: () => console.log('Menú guardado correctamente.'),
        error: (error) => console.error('Error al guardar el menú:', error)
      });
    } catch (err) {
      console.error('Error al subir el archivo:', err);
    } finally {
      this.uploadInProgress = false;
    }
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
