import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { RestobarService } from '../../services/restobar.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';


@Component({
  selector: 'app-dialog-registrar-restaurante',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogActions
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

  constructor(
    private alert: AlertService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  public form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
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


  registrar() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const mensaje = '¿Deseas registrar el restaurante?';

    const confirmacion = 'Registrando restaurante...';

    const datosRestobar = {
      userId: this.userId,
      ...this.form.value
    };

    this.alert.confirm(mensaje, 'Verifica que todos los datos sean correctos')
      .then(result => {
        if (!result.isConfirmed) return;

        this.alert.loading(confirmacion);

        const observable = this.restobarService.registrar(datosRestobar); // Este debe retornar el ID creado

        observable.subscribe({
          next: async (response: any) => {
            this.alert.close();

            const mensajeExito = 'Registro exitoso';
            const detalleExito = 'El restaurante fue registrado correctamente';

            this.alert.success(mensajeExito, detalleExito);
            this.dialogRef.close(true);
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

  cancelar() {
    this.dialogRef.close();
  }
}
