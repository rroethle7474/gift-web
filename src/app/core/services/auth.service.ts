// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { User } from '../../shared/models/user.interface';

interface LoginResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/users`;
  private loggedInSubject = new BehaviorSubject<boolean>(!!localStorage.getItem('token'));
  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUser());

  isLoggedIn$ = this.loggedInSubject.asObservable();
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.loggedInSubject.next(true);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  logout(): void {
    const currentUser = this.getCurrentUser();

    // Clear all auth-related storage first
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();

    // Reset the behavior subjects
    this.loggedInSubject.next(false);
    this.currentUserSubject.next(null);

    // Navigate to home page with state for showing goodbye modal
    this.router.navigate(['/'], {
      state: { showGoodbyeModal: true, userName: currentUser?.name }
    });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}
