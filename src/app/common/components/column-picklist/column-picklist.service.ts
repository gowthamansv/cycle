// src/app/common/services/column-preferences.service.ts
import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { AppConfigService } from '../../../app.config.service';
import { map, finalize } from 'rxjs';
import { DatePipe } from '@angular/common';

export interface SaveColumnPreferencesPayload {
  Pagename: string;
  Columns: string[];
  Preset: string;
  Addwho: string;
}

@Injectable({
  providedIn: 'root',
})
export class ColumnPreferencesService {
  loading = signal<boolean>(false);
  SetActive = signal(false);
  private httpClient = inject(HttpClient);
  private authService = inject(AuthService);
  private config = inject(AppConfigService);

  getPreferences(pageName: string) {
    return this.httpClient.get<any>(
      this.config.appConfig()?.RequestUrl + `views?Pagename=${pageName}`,
      { headers: this.authService.getAuthHeaders() },
    );
  }

  getColumnById(pageName: string) {
    return this.httpClient
      .get<any>(this.config.appConfig()?.RequestUrl + `views/byuser?Pagename=${pageName}`, {
        headers: this.authService.getAuthHeaders(),
      })
      .pipe(
        map((res) => {
          const columns = String(res?.Columns ?? '').trim();
          let columnNames: string[];

          try {
            columnNames = JSON.parse(columns.replace(/^\{/, '[').replace(/\}$/, ']'));
          } catch {
            columnNames = columns
              .replace(/[{}"']/g, '')
              .split(',')
              .map((c) => c.trim());
          }
          return columnNames.map((field, idx) => ({
            field,
            // label: field.toLowerCase().includes('date') ? (datePipe.transform(field, 'M/d/yy, h:mm a') ?? field) : field,
            label: field,
            rowId: idx + 1,
          }));
        }),
      );
  }

  savePreferences(pageName: string, userId: string, columns: string[], preset: string = 'default') {
    const body = {
      pagename: pageName,
      Columns: `{${columns.map((c) => `"${c}"`).join(',')}}`,
      Preset: preset,
      AddWho: userId,
    };

    return this.httpClient.post(this.config.appConfig()?.RequestUrl + 'views', body, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  updatePreferences(pageName: string, userId: string, columns: string[], id: number = 0) {
    const body = {
      Id: id,
      Pagename: pageName,
      Columns: `{${columns.map((c) => `"${c}"`).join(',')}}`,
      Preset: 'default',
      EditWho: userId,
    };
    return this.httpClient.put(this.config.appConfig()?.RequestUrl + 'views', body, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  upsertPreferences(
    pageName: string,
    userId: string,
    columns: string[],
    preset: string = 'default',
  ) {
    return this.getPreferences(pageName).pipe(
      switchMap((res) => {
        if (res && res.length > 0) {
          // update existing
          return this.updatePreferences(pageName, userId, columns, res[0].Id);
        } else {
          // create new
          return this.savePreferences(pageName, userId, columns, preset);
        }
      }),
    );
  }
  getE2EPreferences(pageName: string) {
    return this.httpClient.get<any>(
      this.config.appConfig()?.RequestUrl + `views?Pagename=${pageName}`,
      { headers: this.authService.getAuthHeaders() },
    );
  }

  getE2EColumnById(pageName: string) {
    const datePipe = new DatePipe('en-US');

    return this.httpClient
      .get<any>(this.config.appConfig()?.RequestUrl + `views/byuser?Pagename=${pageName}`, {
        headers: this.authService.getAuthHeaders(),
      })
      .pipe(
        map((res) => {
          const columns = String(res?.Columns ?? '').trim();
          let columnNames: string[];

          try {
            columnNames = JSON.parse(columns.replace(/^\{/, '[').replace(/\}$/, ']'));
          } catch {
            columnNames = columns
              .replace(/[{}"']/g, '')
              .split(',')
              .map((c) => c.trim());
          }
          return columnNames.map((field, idx) => ({
            field,
            // label: field.toLowerCase().includes('date') ? (datePipe.transform(field, 'M/d/yy, h:mm a') ?? field) : field,
            label: field,
            rowId: idx + 1,
          }));
        }),
      );
  }

  saveE2EPreferences(
    pageName: string,
    userId: string,
    columns: string[],
    preset: string = 'default',
  ) {
    const body = {
      pagename: pageName,
      Columns: `{${columns.map((c) => `"${c}"`).join(',')}}`,
      Preset: preset,
      AddWho: userId,
    };

    return this.httpClient.post(this.config.appConfig()?.RequestUrl + 'views', body, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  updateE2EPreferences(pageName: string, userId: string, columns: string[], id: number = 0) {
    const body = {
      Id: id,
      Pagename: pageName,
      Columns: `{${columns.map((c) => `"${c}"`).join(',')}}`,
      Preset: 'default',
      EditWho: userId,
    };
    return this.httpClient.put(this.config.appConfig()?.RequestUrl + 'views', body, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  upsertE2EPreferences(
    pageName: string,
    userId: string,
    columns: string[],
    preset: string = 'default',
  ) {
    return this.getE2EPreferences(pageName).pipe(
      switchMap((res) => {
        if (res && res.length > 0) {
          // update existing
          return this.updatePreferences(pageName, userId, columns, res[0].Id);
        } else {
          // create new
          return this.savePreferences(pageName, userId, columns, preset);
        }
      }),
    );
  }
}
