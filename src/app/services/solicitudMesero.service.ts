import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { appsettings } from '../settings/appsettings';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class SolicitudMeseroService {

    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private baseUrl: string = appsettings.apiUrlBAse;

    constructor() { }

    /**
     * Mesero solicita ser parte de un restobar
     */
    solicitarSerMesero(restobarId: string): Observable<void> {
        const userId = this.authService.getUserId();
        const url = `${this.baseUrl}/api/meseros/solicitar/user/${userId}/restobar/${restobarId}`;
        return this.http.post<void>(url, null);
    }

    listarSolicitudesPorUsuario(): Observable<any[]> {
        const userId = this.authService.getUserId();
        const url = `${this.baseUrl}/api/meseros/solicitudes/user/${userId}`;
        return this.http.get<any[]>(url);
    }

    /**
     * Obtener solicitudes de un restobar (para el administrador)
     */
    obtenerSolicitudesPorRestobar(restobarId: number): Observable<any[]> {
        const url = `${this.baseUrl}/api/meseros/solicitudes/restobar/${restobarId}`;
        return this.http.get<any[]>(url);
    }

    /**
     * Obtener solicitudes de todos los restobar (para el administrador)
     */
    obtenerSolicitudesPorAdministrador(): Observable<any[]> {
        const userId = this.authService.getUserId();
        const url = `${this.baseUrl}/api/meseros/solicitudes/administrador/userId/${userId}`;
        return this.http.get<any[]>(url);
    }

    /**
     * Obtener solicitudes hechas por un usuario
     */
    obtenerSolicitudesPorUsuario(userId: number): Observable<any[]> {
        const url = `${this.baseUrl}/api/meseros/solicitudes/usuario/${userId}`;
        return this.http.get<any[]>(url);
    }

    /**
     * Cambiar el estado de una solicitud (ACEPTADO, RECHAZADO, PENDIENTE)
     */
    cambiarEstadoSolicitud(solicitudId: number, estado: string): Observable<void> {
        const url = `${this.baseUrl}/api/meseros/solicitud/${solicitudId}/estado`;
        const params = new HttpParams().set('estado', estado);
        return this.http.patch<void>(url, null, { params });
    }

    /**
     * Eliminar una solicitud
     */
    eliminarSolicitud(solicitudId: number): Observable<void> {
        const url = `${this.baseUrl}/api/meseros/solicitud/${solicitudId}`;
        return this.http.delete<void>(url);
    }
}
