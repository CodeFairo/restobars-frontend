import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { appsettings } from '../settings/appsettings';
import { Observable } from 'rxjs';
import { Producto } from '../interfaces/Producto';

@Injectable({
     providedIn: 'root'
})
export class ProductoService {

     private http = inject(HttpClient);
     private baseUrl: string = appsettings.apiUrlBAse;
     constructor() { }

     lista() : Observable<any>{
          return  this.http.get<any>(`${this.baseUrl}api/Productos/todos?pageNumber=1&pageSize=50`)
     }

     listaNombre(nombre: string): Observable<any> {
          const params = new HttpParams()
            .set('nombre', nombre)
            .set('pageNumber', 1)
            .set('pageSize', 50);
        
          return this.http.get<any>(`${this.baseUrl}api/Productos/buscar/nombre`, { params });
     }

     listaPorCategoria(categoriaId: string): Observable<any> {
          const params = new HttpParams()
            .set('categoriaId', categoriaId)
            .set('pageNumber', 1)
            .set('pageSize', 50);
        
          return this.http.get<any>(`${this.baseUrl}api/Productos/buscar/categoria`, { params });
     }

     crearProducto(producto: Producto): Observable<Producto> 
     { 
          return this.http.post<any>(`${this.baseUrl}api/Productos`, producto);
     } 

     modificarProducto(producto: Producto): Observable<Producto> 
     { 
          return this.http.put<any>(`${this.baseUrl}api/Productos/${producto.id}`, producto);
     } 
     
     eliminarProducto(producto: Producto): Observable<Producto> 
     { 
          return this.http.delete<any>(`${this.baseUrl}api/Productos/${producto.id}`);
     } 
}