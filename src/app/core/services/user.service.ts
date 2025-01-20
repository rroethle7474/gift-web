import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CreateUserRequest, UpdateUserRequest } from '../../shared/models/user.interface';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = `${environment.apiUrl}/users`;

    constructor(private http: HttpClient) {}

    getAllUsers(): Observable<User[]> {
        return this.http.get<User[]>(this.apiUrl);
    }

    getUserById(id: number): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/${id}`);
    }

    createUser(user: CreateUserRequest): Observable<User> {
        const payload = {
            ...user,
            isAdmin: !!user.isAdmin
        };
        return this.http.post<User>(this.apiUrl, payload);
    }

    updateUser(id: number, user: UpdateUserRequest): Observable<User> {
        const payload = {
            ...user,
            isAdmin: user.isAdmin !== undefined ? !!user.isAdmin : undefined,
            isGuestUser: user.isGuestUser !== undefined ? !!user.isGuestUser : undefined
        };
        return this.http.put<User>(`${this.apiUrl}/${id}`, payload);
    }

    deleteUser(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    changePassword(userId: number, newPassword: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${userId}/change-password`, { newPassword });
    }
}
