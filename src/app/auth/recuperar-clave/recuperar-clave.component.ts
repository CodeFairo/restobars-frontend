import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Auth } from '@angular/fire/auth';
import { AlertService } from '../../services/alert.service';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-recuperar-clave',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './recuperar-clave.component.html',
  styleUrl: './recuperar-clave.component.css'
})
export class RecuperarClaveComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private alert = inject(AlertService);
  private auth = inject(Auth);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  recuperarClave() {
    if (this.form.invalid) {
      this.alert.error('Error', 'Ingresa un correo válido.');
      return;
    }

    const email = this.form.value.email;

    this.alert.loading('Enviando correo...');

    sendPasswordResetEmail(this.auth, email)
      .then(() => {
        this.alert.success('Correo enviado', 'Revisa tu bandeja de entrada para restablecer tu contraseña.');
        this.router.navigate(['/login']);
      })
      .catch(error => {
        let mensaje = 'Ocurrió un error';
        if (error.code === 'auth/user-not-found') {
          mensaje = 'No se encontró una cuenta con ese correo.';
        } else if (error.code === 'auth/invalid-email') {
          mensaje = 'Correo inválido.';
        }
        this.alert.error('Error', mensaje);
      });
  }

  volver() {
    this.router.navigate(['/login']);
  }
}
