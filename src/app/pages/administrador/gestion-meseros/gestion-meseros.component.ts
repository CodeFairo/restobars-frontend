import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AlertService } from '../../../services/alert.service';
import { SolicitudMeseroService } from '../../../services/solicitudMesero.service';

@Component({
  selector: 'app-gestion-meseros',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './gestion-meseros.component.html',
  styleUrl: './gestion-meseros.component.css'
})
export class GestionMeserosComponent implements OnInit {

  solicitudes: any[] = [];
  usuarioId: string | null = null;
  loading = true;

  constructor(
    private solicitudService: SolicitudMeseroService,
    private authService: AuthService,
    private alert: AlertService
  ) { }

  ngOnInit(): void {
    this.usuarioId = this.authService.getUserId();

    if (this.usuarioId) {
      this.cargarSolicitudes();
    } else {
      this.alert.warning('No se encontró un restaurante asociado al usuario.');
    }
  }

  cargarSolicitudes(): void {
    this.loading = true;
    this.solicitudService.obtenerSolicitudesPorAdministrador().subscribe({
      next: data => {
        this.solicitudes = data;
        this.loading = false;
      },
      error: err => {
        console.error('Error al cargar solicitudes', err);
        this.alert.error('No se pudieron obtener las solicitudes.');
        this.loading = false;
      }
    });
  }

  cambiarEstado(id: number, estado: string): void {
    this.solicitudService.cambiarEstadoSolicitud(id, estado).subscribe({
      next: () => {
        this.alert.success('Estado actualizado correctamente.');
        this.cargarSolicitudes();
      },
      error: () => {
        this.alert.error('No se pudo actualizar el estado.');
      }
    });
  }

  eliminarSolicitud(id: number): void {
    if (!confirm('¿Estás seguro de eliminar esta solicitud?')) return;

    this.solicitudService.eliminarSolicitud(id).subscribe({
      next: () => {
        this.alert.success('Solicitud eliminada.');
        this.cargarSolicitudes();
      },
      error: () => {
        this.alert.error('Error al eliminar la solicitud.');
      }
    });
  }
}
