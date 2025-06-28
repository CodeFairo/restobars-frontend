import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RestobarService } from '../../../services/restobar.service';
import { SolicitudMeseroService } from '../../../services/solicitudMesero.service';
import { Restobar } from '../../../interfaces/Restobar';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-mis-restobars',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    CommonModule
  ],
  templateUrl: './mis-restobars.component.html',
  styleUrl: './mis-restobars.component.css'
})
export class MisRestobarsComponent {

  codigoRestobar = '';
  restobarEncontrado: Restobar | null = null;
  solicitando = false;
  solicitudes: any[] = [];

  constructor(
    private restobarService: RestobarService,
    private solicitudMeseroService: SolicitudMeseroService,
    private authService: AuthService,
    private alert: AlertService
  ) { }

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes(): void {
    this.solicitudMeseroService.listarSolicitudesPorUsuario().subscribe({
      next: (data) => {
        this.solicitudes = data;
      },
      error: (err) => {
        console.error('Error cargando solicitudes:', err);
        this.alert.error('No se pudieron cargar tus solicitudes.');
      }
    });
  }

  buscarRestobar(): void {
    if (!this.codigoRestobar) return;

    this.restobarService.buscarPorCodigo(this.codigoRestobar).subscribe({
      next: (restobar) => {
        this.restobarEncontrado = restobar;
        this.alert.success('Restobar encontrado.');
      },
      error: (err) => {
        this.restobarEncontrado = null;
        this.alert.warning('No se encontró ningún restaurante con ese código.');
        console.error(err);
      }
    });
  }

  solicitar(): void {
    if (!this.restobarEncontrado) return;

    const restobarId = this.restobarEncontrado.id;

    this.solicitando = true;

    this.solicitudMeseroService.solicitarSerMesero(restobarId).subscribe({
      next: () => {
        this.alert.success('Solicitud enviada con éxito.');
        this.restobarEncontrado = null;
        this.codigoRestobar = '';
        this.solicitando = false;
        this.cargarSolicitudes();
      },
      error: (err) => {

        this.solicitando = false;

        const codigo = err?.error?.code;
        const mensaje = err?.error?.message;

        if (codigo === 'LIMITE_SOLICITUD_MESERO') {
          this.alert.warning('Límite alcanzado', mensaje);
        } else {
          console.error('Error solicitando ser mesero:', err);
          this.alert.error('No se pudo enviar la solicitud.');
        }

      }
    });
  }

  cancelarSolicitud(restobarId: number): void {

    this.alert.confirm('¿Estás seguro de cancelar esta solicitud?')
      .then(result => {
        if (!result.isConfirmed) return;
        this.solicitudMeseroService.eliminarSolicitud(restobarId).subscribe({
          next: () => {
            this.alert.success('Solicitud cancelada con éxito.');
            this.cargarSolicitudes();
          },
          error: (err) => {
            console.error('Error al cancelar solicitud:', err);
            this.alert.error('No se pudo cancelar la solicitud.');
          }
        });
      })
  }

  abandonarRestobar(restobarId: number): void {
    this.alert.confirm('¿Estás seguro de abandonar este restaurante?')
      .then(result => {
        if (!result.isConfirmed) return;
        this.solicitudMeseroService.eliminarSolicitud(restobarId).subscribe({
          next: () => {
            this.alert.success('Has abandonado el restaurante.');
            this.cargarSolicitudes();
          },
          error: (err) => {
            console.error('Error al abandonar restaurante:', err);
            this.alert.error('No se pudo abandonar el restaurante.');
          }
        });
      })
  }
}
