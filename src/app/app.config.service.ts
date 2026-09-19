import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { lastValueFrom } from 'rxjs';

interface Config {
  AuthUrl: string;
  storer: string;
  InbUrl: string;
  OutUrl: string;
  MasterUrl: string;
  InvUrl: string;
  ConfigUrl: string;
  GEUrl: string;
  ZFUrl: string;
  PanasonicUrl: string;
  EnquiryUrl: string;
  Reports: { [key: string]: ReportData[] };
  AppointmentUrl: string;
  WaveUrl: string;
  SessionTimeOut: number;
  AIBotUrl: string;
  RequestUrl: string;
}
interface ReportData {
  ReportLabel: string;
  ReportFile: string;
  color: string;
  iconcolor: string;
}

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  appConfig = signal<Config | undefined>(undefined);

  constructor(private http: HttpClient) {}

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
  get storer() {
    if (!this.appConfig()) {
      throw Error('Config file not loaded!');
    }
    return this.appConfig()?.storer;
  }
  get inbUrl() {
    if (!this.appConfig()) {
      throw Error('Config file not loaded!');
    }
    return this.appConfig()?.InbUrl;
  }
  get masterUrl() {
    if (!this.appConfig()) {
      throw Error('Config file not loaded!');
    }
    return this.appConfig()?.MasterUrl;
  }
  get invUrl() {
    if (!this.appConfig()) {
      throw Error('Config file not loaded!');
    }
    return this.appConfig()?.InvUrl;
  }
  get configUrl() {
    if (!this.appConfig()) {
      throw Error('Config file not loaded!');
    }
    const st = sessionStorage.getItem('TraderKey');
    if (st === 'BODYARMOR') {
      return 'http://31.97.230.203:3032/';
    } else if (st === 'ZF') {
      return 'http://31.97.230.203:3031/';
    } else if (st === 'Panasonic') {
      return 'http://31.97.230.203:3033/';
    } else {
      return this.appConfig()?.ConfigUrl;
    }
  }
  get enquiryUrl() {
    if (!this.appConfig()) {
      throw Error('Config file not loaded!');
    }
    return this.appConfig()?.EnquiryUrl;
  }
  get AppointmentUrl() {
    if (!this.appConfig()) {
      throw Error('Config file not loaded!');
    }

    return this.appConfig()?.AppointmentUrl;
  }
  get WaveUrl() {
    if (!this.appConfig()) {
      throw Error('Config file not loaded!');
    }
    return this.appConfig()?.WaveUrl;
  }
  get sessionTime() {
    if (!this.appConfig) {
      throw Error('Config file not loaded!');
    }
    return this.appConfig()?.SessionTimeOut;
  }
  get AIBotUrl() {
    if (!this.appConfig()) {
      throw Error('Config file not loaded!');
    }
    return this.appConfig()?.AIBotUrl;
  }

  get RequestUrl() {
    if (!this.appConfig()) {
      throw Error('Config file not loaded!');
    }
    return this.appConfig()?.RequestUrl;
  }
}
