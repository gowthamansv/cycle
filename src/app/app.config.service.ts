import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { lastValueFrom } from 'rxjs';

interface Config {
  AuthUrl: string;

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
      throw new Error('Failed to load config: ' + error.message);
    }
  }

  get AuthUrl() {
    if (!this.appConfig()) {
      throw Error('Config file not loaded!');
    }
    return this.appConfig()?.AuthUrl;
  }

}
