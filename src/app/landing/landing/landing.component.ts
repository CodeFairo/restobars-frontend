import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  private router = inject(Router);

  ingresar() {
    this.router.navigate(['login']);
  }
  
  registrarse(){
    this.router.navigate(['registro'])
  }

}
