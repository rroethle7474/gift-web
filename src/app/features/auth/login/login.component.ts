// login.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { GoodbyeModalComponent } from '../../../shared/modals/goodbye-modal/goodbye-modal.component';
import { environment } from '../../../../environments/environment';
import { User } from '../../../shared/models/user.interface';
import { UserService } from '../../../core/services/user.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, GoodbyeModalComponent],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    isLoading = false;
    errorMessage: string | null = null;
    showPassword = false;
    showGoodbyeModal = false;
    userName = '';
    isDemoMode = environment.demoMode;
    guestUsers: User[] = [];
    selectedGuestUser: User | null = null;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private userService: UserService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required]]
        });

        // Check if we should show the goodbye modal
        const navigation = this.router.getCurrentNavigation();
        const state = navigation?.extras.state as { showGoodbyeModal: boolean, userName: string };

        if (state?.showGoodbyeModal) {
            this.showGoodbyeModal = true;
            this.userName = state.userName || '';
        }
    }

    ngOnInit(): void {
        if (this.isDemoMode) {
            this.loadGuestUsers();
        }
    }

    loadGuestUsers(): void {
        // TODO: Replace with actual API call when available
        this.userService.getAllUsers().subscribe({
            next: (users) => {
              if (users) {
                this.guestUsers = users.filter(user => user.isGuestUser);
              }
              else {
                this.guestUsers = [];
              }
            },
            error: () => {
                // Silently handle the error by setting an empty array
                this.guestUsers = [];
            }
        });
    }

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    onSubmit(): void {
        if (this.loginForm.valid) {
            this.isLoading = true;
            this.errorMessage = null;

            this.authService.login(
                this.loginForm.value.username,
                this.loginForm.value.password,
                false
            ).subscribe({
                next: () => {
                    this.router.navigate(['/wish-list'], {
                        state: { showWelcomeModal: true, fromLogin: true }
                    });
                },
                error: (error) => {
                    this.errorMessage = error.error?.message || 'An error occurred during sign in';
                    this.isLoading = false;
                }
            });
        }
    }

    loginAsGuest(): void {
        if (this.selectedGuestUser) {
            this.isLoading = true;
            this.errorMessage = null;

            this.authService.login(
                this.selectedGuestUser.username!,
                'GUEST_USER_PASSWORD',
                true
            ).subscribe({
                next: () => {
                    this.router.navigate(['/wish-list'], {
                        state: { showWelcomeModal: true, fromLogin: true }
                    });
                },
                error: (error) => {
                    this.errorMessage = error.error?.message || 'An error occurred during guest sign in';
                    this.isLoading = false;
                }
            });
        }
    }

    onCloseGoodbyeModal(): void {
        this.showGoodbyeModal = false;
    }
}
