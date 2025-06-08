import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsService {
  getGoogleMapsUrl(lat: number, lng: number): string {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }

  abrirEnGoogleMaps(lat: number, lng: number): void {
    const url = this.getGoogleMapsUrl(lat, lng);
    window.open(url, '_blank');
  }
}
