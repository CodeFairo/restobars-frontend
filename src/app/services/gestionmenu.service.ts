import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { appsettings } from '../settings/appsettings';
import { Observable } from 'rxjs';
import { Restobar } from '../interfaces/Restobar';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class GestionMenuService {

    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private baseUrl: string = appsettings.apiUrlBAse;

    constructor() { }

    obtenerCategoriasPorEstado(activo: boolean): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}api/categorias-menu/estado/${activo}`);
    }
}