import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RestobarMenuComplemento } from '../interfaces/RestobarMenuComplemento';
import { appsettings } from '../settings/appsettings';

@Injectable({
  providedIn: 'root'
})
export class RestobarMenuComplementoService {

  private baseUrl: string = appsettings.apiUrlBAse;

  constructor(private http: HttpClient) {}

  getByRestobarId(restobarId: number): Observable<RestobarMenuComplemento> {
    return this.http.get<RestobarMenuComplemento>(`${this.baseUrl}api/restobarcomplemento/restobarid/${restobarId}`)
      .pipe(catchError(this.handleError));
  }

  create(dto: RestobarMenuComplemento): Observable<RestobarMenuComplemento> {
    return this.http.post<RestobarMenuComplemento>(`${this.baseUrl}api/restobarcomplemento`, dto)
      .pipe(catchError(this.handleError));
  }

  /*update(id: number, dto: RestobarMenuComplemento): Observable<RestobarMenuComplemento> {
    return this.http.put<RestobarMenuComplemento>(`${this.baseUrl}/${id}`, dto)
      .pipe(catchError(this.handleError));
  }*/

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    //onsole.error('API error:', error);
    return throwError(() => new Error(error.error?.message || 'Error en el servidor'));
  }

  guardarMenuDia(restobarId: number, menuDiaJson: string): Observable<any> {
    const payload = {
      menuDia: menuDiaJson // ya viene como cadena JSON desde el componente
    };

    return this.http.post(`${this.baseUrl}/api/restobarcomplemento/menudiario/${restobarId}/menu-dia`, payload);
  }
  
}
