import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [ MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatMenuModule,
    RouterModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})

export class MainLayoutComponent {

  private authService = inject(AuthService);
  private router = inject(Router);
  isCollapsed = false;
  isMobile = false;

  ngOnInit(): void {
    this.checkScreenWidth();
    window.addEventListener('resize', () => this.checkScreenWidth());
  }

  checkScreenWidth() {
    this.isMobile = window.innerWidth <= 768;
    this.isCollapsed = this.isMobile; // Oculta por defecto en móvil
  }
  
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
  
  restobarDashboard(){
    this.router.navigate(['restobarDashboard']);  
  }

  misRestobars(){
    this.router.navigate(['misRestobar']);  
  }

  compartirCarta(){
    this.router.navigate(['compartirCarta']);
  }

  miperfil(){
    this.router.navigate(['miperfil']);
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/']).then(() => {
      location.reload();
    });
  }

}
