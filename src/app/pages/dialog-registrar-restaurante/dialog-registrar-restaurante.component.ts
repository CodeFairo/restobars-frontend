import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
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

  constructor(
    private alert: AlertService,
    private dialog: MatDialog
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

    this.alert.confirm('¿Deseas registrar el restaurante?', 'Verifica que todos los datos sean correctos')
      .then(result => {
        if (!result.isConfirmed) {
          return;
        }

        const nuevoRestaurante = {
          userId: this.userId,
          ...this.form.value
        };

        this.alert.loading('Registrando restaurante...');

        this.restobarService.registrar(nuevoRestaurante).subscribe({
          next: () => {
            this.alert.close(); // Cierra la alerta de carga
            this.alert.success('Registro exitoso', 'El restaurante fue registrado correctamente');
            this.dialogRef.close(true);
          },
          error: (err) => {
            this.alert.close(); // Cierra la alerta de carga
            console.error('Error al registrar restaurante:', err);
            this.alert.error('Error al registrar', 'Ocurrió un error al registrar el restaurante');
          }
        });
      });
  }

  cancelar() {
    this.dialogRef.close();
  }
}
