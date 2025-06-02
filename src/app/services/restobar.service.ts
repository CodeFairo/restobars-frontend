import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { appsettings } from '../settings/appsettings';
import { Observable } from 'rxjs';
import { Producto } from '../interfaces/Producto';
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
        return  this.http.get<any>(`${this.baseUrl}api/restobar/userid/${this.userId}`)
     }   
 
     registrar(data: any): Observable<Restobar> {          
          return this.http.post<Restobar>(`${this.baseUrl}api/restobar`,  data );
     }
   
     modificarProducto(producto: Producto): Observable<Producto> 
     { 
          return this.http.put<any>(`${this.baseUrl}api/restobar/${producto.id}`, producto);
     } 
     
     eliminarProducto(producto: Producto): Observable<Producto> 
     { 
          return this.http.delete<any>(`${this.baseUrl}api/restobar/${producto.id}`);
     } 
}