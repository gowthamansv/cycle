import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfigService } from '../../app.config.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);
  private http = inject(HttpClient);
  private configService = inject(AppConfigService);
  facility = signal<string | null>(sessionStorage.getItem('Facility'));
  TraderKey = signal<string | null>(sessionStorage.getItem('TraderKey'));
  token = signal<string | null>(sessionStorage.getItem('Token'));
  tokenAp = signal<string | null>(sessionStorage.getItem('TokenAp'));

  getAuthHeaders() {
    const facility = sessionStorage.getItem('Facility');
    const TraderKey = sessionStorage.getItem('TraderKey');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.token() ? JSON.parse(this.token() || '') : ''}`)
      .set('Facility', facility || '')
      .set('TraderKey', TraderKey || '')
      .set('storer', TraderKey || '');
    return headers;
  }
}
