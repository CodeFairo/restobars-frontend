import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { appsettings } from '../settings/appsettings';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class CategoriaMenuService {

    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private baseUrl: string = appsettings.apiUrlBAse;

    constructor() { }

    obtenerCategoriasPorEstado(activo: boolean): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}api/categorias-menu/estado/${activo}`);
    }

    obtenerCategoriasPorEstadoEsMenu(activo: boolean,esMEnu: boolean): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}api/categorias-menu/estado/${activo}/${esMEnu}`);
    }
}