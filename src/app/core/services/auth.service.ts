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

  login(username: string, password: string, isGuestUser: boolean = false): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username, password, isGuestUser })
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

    if (currentUser?.isGuestUser) {
      // Make API call for guest user logout
      this.http.post<boolean>(`${this.apiUrl}/logout`, {
        username: currentUser.username,
        isGuestUser: currentUser.isGuestUser
      }).subscribe({
        next: (response) => {
          this.performLogout(currentUser);
        },
        error: (error) => {
          console.error('Error during guest logout:', error);
          // Still perform logout even if API call fails
          this.performLogout(currentUser);
        }
      });
    } else {
      // Regular user logout
      this.performLogout(currentUser);
    }
  }

  // Helper method to handle the common logout logic
  private performLogout(currentUser: User | null): void {
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
