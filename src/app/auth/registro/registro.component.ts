import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccesoService } from '../../services/acceso.service';
import { Router } from '@angular/router';
import { UsuarioRegistro } from '../../interfaces/Usuario';

import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select'


@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [MatCardModule,MatFormFieldModule,MatInputModule,MatButtonModule,MatSelectModule,ReactiveFormsModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {

     private accesoService = inject(AccesoService);
     private router = inject(Router);
     public formBuild = inject(FormBuilder);

     public formRegistro: FormGroup = this.formBuild.group({
          nombre: ['',Validators.required],
          email: ['',Validators.required],
          password: ['',Validators.required],
          rol: ['',Validators.required],
     })

     registrarse(){
          debugger
          if(this.formRegistro.invalid) return;

          const objeto:UsuarioRegistro = {
               nombre: this.formRegistro.value.nombre,
               email: this.formRegistro.value.email,
               password: this.formRegistro.value.password,
               rol: this.formRegistro.value.rol
          }

          this.accesoService.registrarse(objeto).subscribe({
               next: () =>{
                         this.router.navigate([''])
               }, error:(error) =>{
                    alert(error);
               }
          })

     }

     volver(){
          this.router.navigate([''])
     }

}
