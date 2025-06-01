import { Component, inject } from '@angular/core';
import { AccesoService } from '../../services/acceso.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Login } from '../../interfaces/Login';

import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatCardModule,MatFormFieldModule,MatInputModule,MatButtonModule,ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

     private accesoService = inject(AccesoService);
     private authService = inject(AuthService);
     private router = inject(Router);
     public formBuild = inject(FormBuilder);
     public isLoading: boolean = false;
     constructor(
          private notificationService: NotificationService,
          private alert: AlertService
     ) {}
     
     public formLogin: FormGroup = this.formBuild.group({
          email: ['',Validators.required],
          password: ['',Validators.required],
     })

     iniciarSesion() {
          if (this.formLogin.invalid) return;

          const login: Login = {
               email: this.formLogin.value.email,
               password: this.formLogin.value.password,
          };

          this.isLoading = true;
          this.alert.loading('Verificando credenciales...');

          this.accesoService.login(login).subscribe({
               next: (data) => {
                    this.alert.close(); // Cierra la alerta de carga

                    if (data?.accessToken && data.accessToken.split('.').length === 3) {
                         this.authService.saveSession(data.accessToken, data.refreshToken);
                         this.router.navigate(['inicio']);
                    } else {
                         this.alert.error('Credenciales incorrectas', 'Verifica tu correo y contraseña');
                    }
               },
               error: (error) => {
                    this.alert.close(); // Cierra la alerta de carga

                    if (error.status === 401) {
                         this.alert.error('Credenciales incorrectas', 'Correo o contraseña inválidos');
                    } else {
                         this.alert.error('Error al iniciar sesión', 'Intenta nuevamente más tarde');
                    }
               },
               complete: () => this.isLoading = false
          });
     }

     /*loginWithGoogle() {
          const provider = new GoogleAuthProvider();
          return signInWithPopup(this.auth, provider)
               .then(result => {
               const token = result.user.uid;
               localStorage.setItem('token', token);
               this.router.navigate(['/inicio']);
               });
     }

     loginWithFacebook() {
          const provider = new FacebookAuthProvider();
          return signInWithPopup(this.auth, provider)
               .then(result => {
               const token = result.user.uid;
               localStorage.setItem('token', token);
               this.router.navigate(['/inicio']);
               });
     }*/

     registrarse(){
          this.router.navigate(['registro'])
     }
}
