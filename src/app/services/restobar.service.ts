import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { appsettings } from '../settings/appsettings';
import { Observable } from 'rxjs';
import { Restobar } from '../interfaces/Restobar';
import { AuthService } from './auth.service';

@Injectable({
     providedIn: 'root'
})
export class RestobarService {

     private http = inject(HttpClient);
     private authService = inject(AuthService);
     private baseUrl: string = appsettings.apiUrlBAse;

     constructor() { }

     listaRestobarsPorUsuario() : Observable<any>{
        const userId = this.authService.getUserId();
        return  this.http.get<any>(`${this.baseUrl}api/restobar/userid/${userId}`);
     }

     registrar(data: any): Observable<Restobar> {
          return this.http.post<Restobar>(`${this.baseUrl}api/restobar`, data);
     }
   
     actualizar(id: string, body: any) {
          return this.http.put(`${this.baseUrl}api/restobar/${id}`, body);
     }

     cambiarEstado(id: string, estado: boolean) {
          return this.http.put(`${this.baseUrl}api/restobar/${id}/estado`, { estaActivo: estado });
     }
     
     eliminar(id: number): Observable<Restobar> 
     { 
          return this.http.delete<any>(`${this.baseUrl}api/restobar/${id}`);
     } 

     /*******BUSQUEDAS PARA EL LANDING PRINCIPAL******/
     listaAll() : Observable<any>{
          return  this.http.get<any>(`${this.baseUrl}api/restobar`);
     }

     buscarPorNombre(nombre: string) {
          return this.http.get<any>(`${this.baseUrl}api/restobar/buscarestobarpornombre/${encodeURIComponent(nombre)}`);
     }

     buscarPorUbicacion(lat: number, lng: number, nombre: string) {
          return this.http.get<any>(`${this.baseUrl}api/restobar/buscarestobarporubicacion/${lat}/${lng}/${encodeURIComponent(nombre)}`);
     }
}