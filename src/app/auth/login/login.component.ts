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
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { UsuarioRegistro } from '../../interfaces/Usuario';
import { firstValueFrom } from 'rxjs';


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
     private auth: Auth = inject(Auth);
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
                         this.router.navigate(['miDashboard']);
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

     async loginConGoogle() {
          try {
               const provider = new GoogleAuthProvider();
               const cred = await signInWithPopup(this.auth, provider);
               const user = cred.user;

               if (!user?.email || !user?.displayName || !user?.uid) {
                    throw new Error('Faltan datos del usuario de Google');
               }

               const passwordGenerada = user.uid;
               const nuevoUsuario: UsuarioRegistro = {
                    fullName: user.displayName,
                    email: user.email,
                    password: passwordGenerada,
                    rol: 'USER'
               };

               try {
                    await firstValueFrom(this.accesoService.registrarse(nuevoUsuario));
               } catch (error: any) {
                    if (error.status !== 409) throw error;
                    // Si es 409 (usuario ya existe), continúa
               }

               const login: Login = {
                    email: user.email,
                    password: passwordGenerada
               };

               this.alert.loading('Verificando credenciales...');

               this.accesoService.login(login).subscribe({
                    next: (data) => {
                         console.log(data);
                         this.alert.close(); // Cierra la alerta de carga

                         if (data?.accessToken && data.accessToken.split('.').length === 3) {
                              this.authService.saveSession(data.accessToken, data.refreshToken);
                              this.router.navigate(['miDashboard']);
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

          } catch (error) {
               console.error('Error al iniciar sesión con Google:', error);
               this.alert.error('Fallo con Google', 'No se pudo autenticar con Google');
          }
     }

     registrarse(){
          this.router.navigate(['registro'])
     }

     volver(){
          this.router.navigate([''])
     }
}
