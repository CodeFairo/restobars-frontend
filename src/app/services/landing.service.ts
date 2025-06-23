import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { appsettings } from '../settings/appsettings';
import { Observable } from 'rxjs';
import { Restobar } from '../interfaces/Restobar';
import { AuthService } from './auth.service';
import { RestobarMenuComplemento } from '../interfaces/RestobarMenuComplemento';

@Injectable({
     providedIn: 'root'
})
export class LandingService {

     private http = inject(HttpClient);
     private authService = inject(AuthService);
     private baseUrl: string = appsettings.apiUrlBAse;

     constructor() { }

     listaAll() : Observable<any>{
          return  this.http.get<any>(`${this.baseUrl}api/landing/buscatodosrestobarparalanding`);
     }

     buscarPorNombre(nombre: string) {
          return this.http.get<any>(`${this.baseUrl}api/landing/buscarestobarpornombre/${encodeURIComponent(nombre)}`);
     }

     buscarPorUbicacion(lat: number, lng: number, nombre: string) {
          return this.http.get<any>(`${this.baseUrl}api/landing/buscarestobarporubicacion/${lat}/${lng}/${encodeURIComponent(nombre)}`);
     }

    getDetalleRestobar(restobarId: number): Observable<RestobarMenuComplemento> {
        return this.http.get<RestobarMenuComplemento>(`${this.baseUrl}api/landing/traeDetallePorRestobarId/${restobarId}`);
    }
}