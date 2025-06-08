import { inject, Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { AccesoService } from './acceso.service';
import { RefreshTokenRequest, RefreshTokenResponse } from '../interfaces/RefreshToken';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  
  private refreshTimeout?: any;
  private readonly TOKEN_KEY = 'token';
  private readonly USERNAME_KEY = 'username';
  private readonly ROLE_KEY = 'rol';
  private readonly REFRESH_TOKEN = 'refreshToken';

  private accesoService = inject(AccesoService);
  
  
  // Guarda token y datos del usuario en localStorage
  saveSession(token: string, refreshToken: string): void {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded) throw new Error('Token inválido');
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USERNAME_KEY, decoded.email);
      localStorage.setItem(this.ROLE_KEY, decoded.role);
      localStorage.setItem(this.REFRESH_TOKEN, refreshToken);
    } catch (error) {
      console.error('Error al guardar la sesión:', error);
    }
  }

  // Decodifica un JWT sin librerías externas
  private decodeToken(token: string): any | null {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  // Verifica si el usuario está logueado
  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  // Obtiene el token
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN);
  }

  // Obtiene el userid
  getUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId ?? null;
    } catch {
      return null;
    }
  }

  // Obtiene el rol
  getRol(): string | null {
    return localStorage.getItem(this.ROLE_KEY);
  }

  // Obtiene el email del usuario
  getUsername(): string | null {
    return localStorage.getItem(this.USERNAME_KEY);
  }

  // Elimina la sesión del usuario
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USERNAME_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN);
    
  }

  async refreshToken(): Promise<void> {
    const refresh_token = this.getRefreshToken();

    if (!refresh_token) {
      this.logout();
      return;
    }

    const refreshTokenRequest: RefreshTokenRequest = {
      refreshToken: refresh_token
    };

    try {
      const response: RefreshTokenResponse = await firstValueFrom(
        this.accesoService.refreshToken(refreshTokenRequest)
      );

      this.saveSession(response.accessToken,refresh_token); 
    } catch (error) {
      this.logout();
    }
  }

  scheduleTokenRefresh(expiresInSeconds: number) {
    clearTimeout(this.refreshTimeout);
    const timeout = (expiresInSeconds - 60) * 1000;
    this.refreshTimeout = setTimeout(() => this.refreshToken(), timeout);
  }
  
  decodeTokenExpiry(token: string): number {
    const decoded: any = jwtDecode(token);
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
    return expiresIn > 0 ? expiresIn : 0;
  }
  
}

