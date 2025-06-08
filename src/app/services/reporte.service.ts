import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { appsettings } from '../settings/appsettings';
import { Observable } from 'rxjs';

@Injectable({
     providedIn: 'root'
})
export class ReporteService {

     private http = inject(HttpClient);
     private baseUrl: string = appsettings.apiUrlBAse;
     constructor() { }

     generarReporte(): Observable<Blob> {
          return this.http.get(`${this.baseUrl}api/Reporte/inventario-bajo`, {
               responseType: 'blob'
             }) as Observable<Blob>;
        }
     
}