import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { InicioComponent } from './pages/inicio/inicio.component';
import { authGuard } from './custom/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { RegistroComponent } from './auth/registro/registro.component';
import { LandingComponent } from './landing/landing/landing.component';

export const routes: Routes = [
  { path: '', component: LandingComponent ,pathMatch: 'full'},
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'inicio', component: InicioComponent }
      // Puedes agregar más rutas privadas aquí
    ]
  },

  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
