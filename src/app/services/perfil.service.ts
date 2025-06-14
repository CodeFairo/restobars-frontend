import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PerfilResponse } from '../interfaces/Perfil';
import { AuthService } from './auth.service';
import { appsettings } from '../settings/appsettings';

@Injectable({
  providedIn: 'root'
})

export class PerfilService {

    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private baseUrl: string = appsettings.apiUrlBAse;

    obtenerPerfil(): Observable<PerfilResponse> {
        const userId = this.authService.getUserId();
        return this.http.get<any>(`${this.baseUrl}api/perfil/userid/${userId}`);
    }
}
