import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { GestionRestobarComponent } from './pages/administrador/gestion-restobars/gestion-restobars.component';
import { authGuard } from './custom/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { RegistroComponent } from './auth/registro/registro.component';
import { LandingComponent } from './landing/landing/landing.component';
import { RestobarDashboardComponent } from './pages/administrador/restobar-dashboard/restobar-dashboard.component';
import { CompartirCartamenuComponent } from './pages/administrador/compartir-cartamenu/compartir-cartamenu.component';
import { RecuperarClaveComponent } from './auth/recuperar-clave/recuperar-clave.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { QuienesSomosComponent } from './landing/quienes-somos/quienes-somos.component';
import { ContactoComponent } from './landing/contacto/contacto.component';
import { TerminosComponent } from './landing/terminos/terminos.component';
import { BannerDashboardComponent } from './pages/banner-dashboard/banner-dashboard.component';
import { GestionMenuComponent } from './pages/administrador/gestion-menu/gestion-menu.component';
import { GestionMeserosComponent } from './pages/administrador/gestion-meseros/gestion-meseros.component';
import { MisRestobarsComponent } from './pages/mesero/mis-restobars/mis-restobars.component';
import { DialogRestobarDetalleComponent } from './landing/dialog-restobar-detalle/dialog-restobar-detalle.component';
import { GestionMesasComponent } from './pages/administrador/gestion-nesas/gestion-mesas.component';

export const routes: Routes = [
  { path: '', component: LandingComponent, pathMatch: 'full'},
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'recuperarclave', component: RecuperarClaveComponent },
  { path: 'quienes-somos', component: QuienesSomosComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: 'terminos-condiciones', component: TerminosComponent },
  { path: 'detalle-restobar/:id', component: DialogRestobarDetalleComponent },
  

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'restobarDashboard', component: RestobarDashboardComponent },
      { path: 'misRestobar', component: GestionRestobarComponent },
      { path: 'compartirCarta', component: CompartirCartamenuComponent },
      { path: 'miperfil', component: PerfilComponent },
      { path: 'bannerDashboard', component: BannerDashboardComponent },
      { path: 'gestionmenu', component: GestionMenuComponent },
      { path: 'gestionmesero', component: GestionMeserosComponent },
      { path: 'misrestobars', component: MisRestobarsComponent },
      { path: 'gestionmesas', component: GestionMesasComponent }

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
