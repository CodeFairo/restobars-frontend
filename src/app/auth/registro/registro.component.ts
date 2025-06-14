import { Component, inject } from '@angular/core';
import {
     FormBuilder,
     FormGroup,
     ReactiveFormsModule,
     Validators,
     AbstractControl,
     ValidatorFn,
     ValidationErrors
} from '@angular/forms';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { AlertService } from '../../services/alert.service';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';

import { Login } from '../../interfaces/Login';
import { ResponseVerificaEmail } from '../../interfaces/ResponseAcceso';
import { firstValueFrom } from 'rxjs';
import { AccesoService } from '../../services/acceso.service';
import { SeleccionRolDialogComponent } from '../seleccion-rol-dialog/seleccion-rol-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UsuarioRegistro } from '../../interfaces/Usuario';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
     selector: 'app-registro',
     standalone: true,
     imports: [
          MatCardModule,
          MatFormFieldModule,
          MatInputModule,
          MatButtonModule,
          MatSelectModule,
          ReactiveFormsModule,
          MatIconModule,
     ],
     templateUrl: './registro.component.html',
     styleUrl: './registro.component.css'
})
export class RegistroComponent {
     private router = inject(Router);
     public formBuild = inject(FormBuilder);
     private accesoService = inject(AccesoService);
     private dialog = inject(MatDialog);
     private authService = inject(AuthService);
     auth: Auth = inject(Auth);
     public isLoading: boolean = false;

     constructor(private alert: AlertService) { }

     public formRegistro: FormGroup = this.formBuild.group(
          {
               email: ['', [Validators.required, Validators.email]],
               password: [
                    '',
                    [
                         Validators.required,
                         Validators.minLength(8),
                         Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
                    ]
               ],
               passwordConfirm: ['', Validators.required],
          },
          { validators: this.passwordsIgualesValidator() }
     );

     passwordsIgualesValidator(): ValidatorFn {
          return (group: AbstractControl): ValidationErrors | null => {
               const password = group.get('password')?.value;
               const passwordConfirm = group.get('passwordConfirm')?.value;
               return password === passwordConfirm ? null : { passwordsDiferentes: true };
          };
     }

     validarCampos(datosForm: FormGroup): boolean {
          if (datosForm.invalid) {
               const errores: string[] = [];

               const controles = datosForm.controls;

               if (controles['email']?.invalid) {
                    errores.push('Email inválido');
               }
               if (controles['password']?.invalid) {
                    errores.push(
                         'Contraseña inválida (mínimo 8 caracteres, con mayúscula, minúscula y número)'
                    );
               }
               if (controles['passwordConfirm']?.invalid) {
                    errores.push('Debe confirmar la contraseña');
               }
               if (datosForm.errors?.['passwordsDiferentes']) {
                    errores.push('Las contraseñas no coinciden');
               }
              

               this.alert.error('Campos inválidos', `Corrige los siguientes errores:\n- ${errores.join('\n- ')}`);
               return false;
          }

          return true;
     }

     registrarseConEmailFirebase() {
          if (!this.validarCampos(this.formRegistro)) return;

          const email = this.formRegistro.value.email;
          const password = this.formRegistro.value.password;

          createUserWithEmailAndPassword(this.auth, email, password)
               .then((userCredential) => sendEmailVerification(userCredential.user))
               .then(() => {
                    this.alert.success('Revisa tu correo', 'Se envió un correo de verificación.');
                    this.router.navigate(['login']);
               })
               .catch((error) => {
                    this.alert.error('Error', error.message);
               });
     }

     async registrarseConGoogle() {
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

               // Si no tiene rol, pedirle que elija uno
               if (!usuarioExistente) {
                    const dialogRef = this.dialog.open(SeleccionRolDialogComponent, {
                         disableClose: true,
                         data: { displayName: user?.displayName }
                    });

                    const resultado = await firstValueFrom(dialogRef.afterClosed());

                    if (!resultado) {
                         this.alert.info('Proceso cancelado', 'No se seleccionó un rol');
                         return;
                    }

                    const { rol, nombreCompleto } = resultado;

                    const nuevoUsuario: UsuarioRegistro = {
                         fullName: nombreCompleto,
                         email: email,
                         password: passwordGenerada,
                         rol: rol
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

     volver() {
          this.router.navigate(['']);
     }
}
