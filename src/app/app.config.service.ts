import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { lastValueFrom } from 'rxjs';

interface Config {
  AuthUrl: string;
  ApiUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  appConfig = signal<Config | undefined>(undefined);

  constructor(private http: HttpClient) { }

  async loadAppConfig() {
    try {
      const value = await lastValueFrom(this.http.get<Config>('config.json'));
      this.appConfig.set(value);
      return true;
    } catch (error: any) {
      console.warn('Config file load warning:', error?.message);
      // Fallback configuration if config.json fails
      this.appConfig.set({
        AuthUrl: 'https://localhost:7167/',
        ApiUrl: 'https://localhost:7167/'
      });
      return true;
    }
  }

  get AuthUrl(): string {
    return this.appConfig()?.AuthUrl || 'https://localhost:7167/';
  }

  get apiUrl(): string {
    const raw = this.appConfig()?.ApiUrl || this.appConfig()?.AuthUrl || 'https://localhost:7167/';
    return raw.endsWith('/') ? raw : `${raw}/`;
  }
}
