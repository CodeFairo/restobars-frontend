import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { GestionRestobarComponent } from './pages/gestion-restobars/gestion-restobars.component';
import { authGuard } from './custom/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { RegistroComponent } from './auth/registro/registro.component';
import { LandingComponent } from './landing/landing/landing.component';
import { RestobarDashboardComponent } from './pages/restobar-dashboard/restobar-dashboard.component';
import { CompartirCartamenuComponent } from './pages/compartir-cartamenu/compartir-cartamenu.component';
import { RecuperarClaveComponent } from './auth/recuperar-clave/recuperar-clave.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { QuienesSomosComponent } from './layout/quienes-somos/quienes-somos.component';
import { ContactoComponent } from './layout/contacto/contacto.component';
import { TerminosComponent } from './layout/terminos/terminos.component';

export const routes: Routes = [
  { path: '', component: LandingComponent, pathMatch: 'full'},
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'recuperarclave', component: RecuperarClaveComponent },
  { path: 'quienes-somos', component: QuienesSomosComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: 'terminos-condiciones', component: TerminosComponent },
  

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'restobarDashboard', component: RestobarDashboardComponent },
      { path: 'misRestobar', component: GestionRestobarComponent },
      { path: 'compartirCarta', component: CompartirCartamenuComponent },
      { path: 'miperfil', component: PerfilComponent }

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
