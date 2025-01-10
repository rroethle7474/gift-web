import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Setting } from '../models/setting';

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  private apiUrl = `${environment.apiUrl}/Settings`;
  private readonly CACHE_KEY = 'app_settings';
  private readonly CACHE_EXPIRY_KEY = 'app_settings_expiry';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  private settingsSubject = new BehaviorSubject<Setting[]>([]);
  public settings$ = this.settingsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeSettings();
  }

  private initializeSettings(): void {
    const cachedSettings = this.getCachedSettings();
    if (cachedSettings) {
      this.settingsSubject.next(cachedSettings);
    } else {
      this.refreshSettings().subscribe();
    }
  }

  getAllSettings(): Observable<Setting[]> {
    const cachedSettings = this.getCachedSettings();
    if (cachedSettings) {
      return of(cachedSettings);
    }
    return this.refreshSettings();
  }

  refreshSettings(): Observable<Setting[]> {
    return this.http.get<Setting[]>(this.apiUrl).pipe(
      tap(settings => {
        this.setCachedSettings(settings);
        this.settingsSubject.next(settings);
      }),
      catchError(error => {
        console.error('Error fetching settings:', error);
        return throwError(() => error);
      })
    );
  }

  getSetting(name: string): Observable<string | undefined> {
    return this.settings$.pipe(
      map(settings => settings.find(s => s.name === name)?.value)
    );
  }

  private getCachedSettings(): Setting[] | null {
    const expiryTimestamp = localStorage.getItem(this.CACHE_EXPIRY_KEY);
    if (!expiryTimestamp || new Date().getTime() > parseInt(expiryTimestamp)) {
      this.clearCache();
      return null;
    }

    const cachedData = localStorage.getItem(this.CACHE_KEY);
    return cachedData ? JSON.parse(cachedData) : null;
  }

  private setCachedSettings(settings: Setting[]): void {
    localStorage.setItem(this.CACHE_KEY, JSON.stringify(settings));
    localStorage.setItem(
      this.CACHE_EXPIRY_KEY,
      (new Date().getTime() + this.CACHE_DURATION).toString()
    );
  }

  private clearCache(): void {
    localStorage.removeItem(this.CACHE_KEY);
    localStorage.removeItem(this.CACHE_EXPIRY_KEY);
  }
}
