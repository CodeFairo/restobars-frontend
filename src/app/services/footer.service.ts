import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FooterLink {
  label: string;
  url: string;
}

export interface SocialLink {
  icon: string;
  url: string;
}

export interface FooterData {
  logo: string;
  links: FooterLink[];
  social: SocialLink[];
  copyright: string;
}

@Injectable({ providedIn: 'root' })
export class FooterService {
  constructor(private http: HttpClient) {}

  getFooterData(): Observable<FooterData> {
    return this.http.get<FooterData>('assets/footer.json');
  }
}
