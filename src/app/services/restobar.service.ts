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
     private userId = this.authService.getUserId() ?? '';
     private baseUrl: string = appsettings.apiUrlBAse;

     constructor() { }

     lista() : Observable<any>{
        return  this.http.get<any>(`${this.baseUrl}api/restobar/userid/${this.userId}`);
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

     listaAll() : Observable<any>{
        return  this.http.get<any>(`${this.baseUrl}api/restobar`);
     }
}