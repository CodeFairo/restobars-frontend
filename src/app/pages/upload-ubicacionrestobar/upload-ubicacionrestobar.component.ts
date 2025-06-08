import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FirebaseStorageService } from '../../services/firebaseStorage.service';
import { environment } from '../../../environments/environment';


export class UploadMenuDialogComponent {
  file: File | null = null;
  uploadInProgress = false;
  uploadedUrl = '';
  qrReady = false;

  readonly maxFileSizeMB = environment.uploadConfig.maxFileSizeMB;
  readonly maxFileSizeBytes = this.maxFileSizeMB * 1024 * 1024;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { restobarId: number },
    private storageService: FirebaseStorageService,
  ) {}

  async uploadUbicacionRestobar(): Promise<void> {
    if (!this.file) return;

    const extension = this.file.name.split('.').pop()?.toLowerCase() ?? 'pdf';
    const filePath = `restobars/restobar-${this.data.restobarId}/ubicacion.${extension}`;
    
    try {
      const url = await this.storageService.uploadFile(this.file, filePath);
      this.uploadedUrl = url;
      this.qrReady = true;
    } catch (err) {
      console.error('Error', 'Ocurrió un error al cargar la iamgen de la ubicacion');
    } 
  }

}
