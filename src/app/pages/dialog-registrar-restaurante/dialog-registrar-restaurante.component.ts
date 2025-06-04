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

@Component({
  selector: 'app-dialog-registrar-restaurante',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './dialog-registrar-restaurante.component.html',
})
export class DialogRegistrarRestauranteComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<DialogRegistrarRestauranteComponent>);
  private restobarService = inject(RestobarService);
  private authService = inject(AuthService); // Inyectamos AuthService
  private userId = this.authService.getUserId() ?? '';
  public isEditMode = false;

  ngOnInit(): void {
    if (this.data) {
      this.isEditMode = true;
      this.form.patchValue({
        name: this.data.name,
        description: this.data.description,
        logoUrl: this.data.logoUrl
      });
    }
  }

  constructor(
    private alert: AlertService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any // Recibe datos si vienen
  ) {}
  public form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    logoUrl: ['']
  });

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
        : this.restobarService.registrar(datosRestobar);

      observable.subscribe({
        next: () => {
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

  cancelar() {
    this.dialogRef.close();
  }
}
