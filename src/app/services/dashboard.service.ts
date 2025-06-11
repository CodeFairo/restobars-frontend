import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { appsettings } from '../settings/appsettings';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { DashboardRestobarResponse } from '../interfaces/DashboardRestobar';

@Injectable({
     providedIn: 'root'
})
export class DashboardService {

    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private baseUrl: string = appsettings.apiUrlBAse;

    constructor() { }

    getDashboardData(): Observable<DashboardRestobarResponse> {
        const userId = this.authService.getUserId();
        return this.http.get<DashboardRestobarResponse>(`${this.baseUrl}api/dashboard/restobar/${userId}`);
    }

}