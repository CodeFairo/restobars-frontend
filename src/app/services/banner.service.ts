import { inject, Injectable } from "@angular/core";

import { appsettings } from "../settings/appsettings";
import { AuthService } from "./auth.service";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";

@Injectable({
    providedIn: "root",
})
export class BannerService {
    private http = inject(HttpClient);
    private baseUrl: string = appsettings.apiUrlBAse;
    private authService = inject(AuthService);
    constructor() { }

    listaBannersAll(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}api/banner/activosLista`);
    }
    registrarBanner(data: any) {
        return this.http.post<any>(`${this.baseUrl}api/banner/createBanner`, data);
    }

    actualizarBanner(data: any) {
        return this.http.put(`${this.baseUrl}api/banner/updateBanner`, data);
    }

    cambiarEstadoBanner(data: any) {
        return this.http.put(`${this.baseUrl}api/banner/cambiarEstado`, data);
    }

    eliminarBanner(id: string) {
        return this.http.delete(`${this.baseUrl}api/banner/deleteBanner/${id}`);
    }

}