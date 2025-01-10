import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const notificationService = inject(NotificationService);
    const token = localStorage.getItem('token');

    if (token) {
        const authReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`)
        });

        return next(authReq).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    // Show notification before logout
                    notificationService.warning('Your session has expired. Please log in again.', 'Session Expired');
                    // Token is expired or invalid, logout the user
                    authService.logout();
                }
                return throwError(() => error);
            })
        );
    }

    return next(req);
};
