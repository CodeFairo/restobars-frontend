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
import { SeleccionRolDialogComponent } from '../complemento/seleccion-rol-dialog/seleccion-rol-dialog.component';
import { MatDialog, MatDialogRef} from '@angular/material/dialog';
import { ResponseVerificaEmail } from '../../interfaces/ResponseAcceso';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
     MatCardModule,
     MatFormFieldModule,
     MatInputModule,
     MatButtonModule,
     ReactiveFormsModule,

],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
     private accesoService = inject(AccesoService);
     private authService = inject(AuthService);
     private router = inject(Router);
     public formBuild = inject(FormBuilder);
     private auth: Auth = inject(Auth);
     private dialog = inject(MatDialog);
     public isLoading: boolean = false;

     constructor(
          private notificationService: NotificationService,
          private alert: AlertService,
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
                         this.router.navigate(['restobarDashboard']);
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

               const email = user.email;
               const passwordGenerada = user.uid;
               const verificaEmail: Login = { email, password: passwordGenerada };

               // Verificar si ya existe el usuario en tu sistema
               let usuarioExistente: ResponseVerificaEmail | null = null;
               try {
                    usuarioExistente = await firstValueFrom(this.accesoService.obtenerPorCorreo(verificaEmail));
               } catch (error: any) {
                    if (error.status !== 404) {
                         throw error;
                    }
               }

               let rolElegido = usuarioExistente?.rol;

               // Si no tiene rol, pedirle que elija uno
               if (!rolElegido) {
                    const dialogRef = this.dialog.open(SeleccionRolDialogComponent, {
                         disableClose: true,
                    });

                    rolElegido = await firstValueFrom(dialogRef.afterClosed());

                    if (!rolElegido) {
                         this.alert.info('Proceso cancelado', 'No se seleccionó un rol');
                         return;
                    }

                    // Si es nuevo usuario, registrarlo
                    const nuevoUsuario: UsuarioRegistro = {
                         fullName: user.displayName,
                         email: email,
                         password: passwordGenerada,
                         rol: rolElegido
                    };

                    try {
                         await firstValueFrom(this.accesoService.registrarse(nuevoUsuario));
                    } catch (error: any) {
                         if (error.status !== 409) throw error;
                         // Usuario ya existe, pero pudo haberse registrado sin rol
                         //await firstValueFrom(this.accesoService.actualizarRol(email, rolElegido));
                    }
               }

               // Login normal
               const login: Login = { email, password: passwordGenerada };

               this.alert.loading('Verificando credenciales...');

               this.accesoService.login(login).subscribe({
                    next: (data) => {
                         this.alert.close();
                         if (data?.accessToken && data.accessToken.split('.').length === 3) {
                              this.authService.saveSession(data.accessToken, data.refreshToken);
                              this.router.navigate(['restobarDashboard']);
                         } else {
                              this.alert.error('Credenciales incorrectas', 'Verifica tu correo y contraseña');
                         }
                    },
                    error: (error) => {
                         this.alert.close();
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
