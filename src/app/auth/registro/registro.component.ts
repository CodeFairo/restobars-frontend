import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccesoService } from '../../services/acceso.service';
import { Router } from '@angular/router';
import { UsuarioRegistro } from '../../interfaces/Usuario';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select'
import { AlertService } from '../../services/alert.service';


@Component({
     selector: 'app-registro',
     standalone: true,
     imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, ReactiveFormsModule],
     templateUrl: './registro.component.html',
     styleUrl: './registro.component.css'
})
export class RegistroComponent {

     private accesoService = inject(AccesoService);
     private router = inject(Router);
     public formBuild = inject(FormBuilder);

     constructor(
          //private notificationService: NotificationService,
          private alert: AlertService
     ) { }

     public formRegistro: FormGroup = this.formBuild.group({
          nombre: ['', Validators.required],
          email: ['', [Validators.required, Validators.email]],
          password: ['', [Validators.required, Validators.minLength(6)]],
          rol: ['', Validators.required],
     })


     registrarse() {
          // Verifica si el formulario es válido antes de continuar
          if (!this.validarCampos(this.formRegistro)) return;

          const objeto: UsuarioRegistro = {
               fullName: this.formRegistro.value.nombre,
               email: this.formRegistro.value.email,
               password: this.formRegistro.value.password,
               rol: this.formRegistro.value.rol
          }
          this.alert.loading('Creando cuenta...');
          this.accesoService.registrarse(objeto).subscribe({
               next: () => {
                    this.alert.success('Cuenta creada con éxito', 'Tu cuenta ha sido creada exitosamente. Ahora puedes iniciar sesión.');
                    this.router.navigate(['login'])
               }, error: (error) => {
                    this.alert.error('Error al crear cuenta', 'Ocurrió un error al crear la cuenta.');
               }
          })

     }


     volver() {
          this.router.navigate(['login'])
     }

     validarCampos(datosForm: FormGroup) {
          if (datosForm.invalid) {
               const errores: string[] = [];

               for (const campo in datosForm.controls) {
                    const control = datosForm.get(campo);
                    if (control && control.invalid) {
                         errores.push((campo as any)[campo] || campo);
                    }
               }

               this.alert.error(
                    'Campos incompletos',
                    `Completa o corrige los siguientes campos:\n- ${errores.join('\n- ')}`
               );

               return;
          }
          return true;
     }

}
