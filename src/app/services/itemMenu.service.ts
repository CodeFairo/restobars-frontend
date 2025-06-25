import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { appsettings } from '../settings/appsettings';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class ItemMenuService {

    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private baseUrl: string = appsettings.apiUrlBAse;

    constructor() { }

    guardarMenu(restauranteId: number, menuJson: string): Observable<void> {
        const body = {
            restauranteId,
            menuJson 
        };

        return this.http.post<void>(`${this.baseUrl}api/menu/guardar`, body);
    }

    obtenerMenuPorRestaurante(restauranteId: number): Observable<{ restauranteId: number, menuJson: string }> {
        return this.http.get<{ restauranteId: number, menuJson: string }>(`${this.baseUrl}api/menu/restobar/${restauranteId}`);
    }
}
