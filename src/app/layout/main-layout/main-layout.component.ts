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

  ngOnInit(): void {
          
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
  
  miDashboard(){
    this.router.navigate(['miDashboard']);  
  }

  misRestobars(){
    this.router.navigate(['misRestobar']);
  }

  cerrarSesion(){
    this.authService.logout();
    this.router.navigate(['/login']).then(() => {
          location.reload();
        });
  }

}
