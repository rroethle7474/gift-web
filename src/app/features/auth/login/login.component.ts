// login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { GoodbyeModalComponent } from '../../../shared/modals/goodbye-modal/goodbye-modal.component';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, GoodbyeModalComponent],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    loginForm: FormGroup;
    isLoading = false;
    errorMessage: string | null = null;
    showPassword = false;
    showGoodbyeModal = false;
    userName = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
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

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    onSubmit(): void {
        if (this.loginForm.valid) {
            this.isLoading = true;
            this.errorMessage = null;

            this.authService.login(this.loginForm.value.username, this.loginForm.value.password).subscribe({
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

    onCloseGoodbyeModal(): void {
        this.showGoodbyeModal = false;
    }
}
