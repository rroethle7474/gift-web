import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/home/hero-section/hero-section.component').then(m => m.HeroSectionComponent)
    },
    {
      path: 'landing',
      loadComponent: () => import('./features/home/landing/landing.component').then(m => m.LandingComponent)
    },
    {
      path: 'wish-list',
      loadComponent: () => import('./features/wish-list/wish-list/wish-list.component').then(m => m.WishListComponent),
      canActivate: [authGuard]
    },
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
    },
    {
      path: 'wish-list-approval/:userId/:submissionId',
      loadComponent: () => import('./features/admin/wish-list-approval/wish-list-approval.component').then(m => m.WishListApprovalComponent)
    },
    {
      path: 'admin',
      // canActivate: [adminGuard],
      children: [
          {
              path: 'users',
              loadComponent: () => import('./features/admin/user-management/user-management.component').then(m => m.UserManagementComponent)
          },
          {
              path: 'wish-list-overview',
              loadComponent: () => import('./features/admin/wish-list-overview/wish-list-overview.component').then(m => m.WishListOverviewComponent)
          }
      ]
  }
];
