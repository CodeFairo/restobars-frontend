import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { appsettings } from '../settings/appsettings';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MesaService {
  private http = inject(HttpClient);
  private baseUrl = `${appsettings.apiUrlBAse}api/mesasconfiguracion`;

  listarPorRestobar(restobarId: number): Observable<{ restobarId: number, mesasJson: string }> {
    return this.http.get<{ restobarId: number, mesasJson: string }>(`${this.baseUrl}/getConfiguracion/${restobarId}`);
    
  }

  guardarMesas(restobarId: number, mesasJson: string): Observable<void> {
    const body = {
            restobarId,
            mesasJson 
        };
    return this.http.post<void>(`${this.baseUrl}/guardarPorRestobar`, body);
  }
}
