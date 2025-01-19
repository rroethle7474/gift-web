import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { filter, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { of } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  isMenuOpen = false;
  readonly environment = environment;

  showAdminLinks$ = this.authService.currentUser$.pipe(
    map(user => this.environment.initialSetup || user?.isAdmin || false)
  );

  showMenu$ = this.authService.isLoggedIn$.pipe(
    map(isLoggedIn => isLoggedIn || this.environment.initialSetup)
  );

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    // Close menu on any navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.closeMenu();
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.updateBodyScroll();
  }

  closeMenu() {
    if (this.isMenuOpen) {
      this.isMenuOpen = false;
      this.updateBodyScroll();
    }
  }

  private updateBodyScroll() {
    document.body.style.overflow = this.isMenuOpen ? 'hidden' : 'auto';
  }

  logout() {
    this.closeMenu();
    this.authService.logout();
  }
}
