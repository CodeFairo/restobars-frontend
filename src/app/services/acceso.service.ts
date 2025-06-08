import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { appsettings } from '../settings/appsettings';
import { UsuarioRegistro } from '../interfaces/Usuario';
import { Observable } from 'rxjs';
import { ResponseAcceso, ResponseVerificaEmail } from '../interfaces/ResponseAcceso';
import { Login } from '../interfaces/Login';
import { RefreshTokenRequest, RefreshTokenResponse } from '../interfaces/RefreshToken';

@Injectable({
     providedIn: 'root'
})
export class AccesoService {

     private http = inject(HttpClient);
     private baseUrl: string = appsettings.apiUrlBAse;

     constructor() { }

     registrarse(objeto: UsuarioRegistro): Observable<ResponseAcceso> {
          return this.http.post<ResponseAcceso>(`${appsettings.apiUrlBAse}api/users/register`, objeto)
     }

     login(objeto: Login): Observable<ResponseAcceso> {
          return this.http.post<ResponseAcceso>(`${appsettings.apiUrlBAse}auth/login`, objeto)
     }

     obtenerPorCorreo(objeto: Login): Observable<ResponseVerificaEmail> {
          return this.http.post<ResponseVerificaEmail>(`${appsettings.apiUrlBAse}auth/verificaemail`, objeto)
     }

     refreshToken(objeto: RefreshTokenRequest): Observable<RefreshTokenResponse> {         
          return this.http.post<ResponseAcceso>(`${appsettings.apiUrlBAse}auth/refresh`, objeto)
     }
}
