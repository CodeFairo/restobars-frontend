import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent {

  userName = 'Juan Pérez'; // Esto se debe extraer del token o backend
  reservas = [
    { fecha: '2025-06-05', restaurante: 'Picantería Arequipeña' }
  ];
  pedidos = [
    { fecha: '2025-05-30', total: 45.50 }
  ];
  favoritos = [
    { nombre: 'Cevichería La Mar' }
  ];

  ngOnInit(): void {
    // Aquí puedes consumir servicios con HttpClient para obtener los datos reales
  }

}
