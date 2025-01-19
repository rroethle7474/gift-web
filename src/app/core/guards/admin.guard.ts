import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const adminGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const authService = inject(AuthService);

    // Allow access if in initial setup mode
    if (environment.initialSetup) {
        return true;
    }

    return authService.currentUser$.pipe(
        map(user => {
            if (user?.isAdmin) {
                return true;
            }

            router.navigate(['/login']);
            return false;
        })
    );
};
