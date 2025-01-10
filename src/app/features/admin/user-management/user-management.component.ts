import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { User } from '../../../shared/models/user.interface';
import { PhoneInputComponent } from '../../../shared/components/phone-input/phone-input.component';
import { provideNgxMask } from 'ngx-mask';
import { WishListRecommendationsService } from '../../../core/services/wish-list-recommendations.service';
import { CreateRecommendWishListItemDto } from '../../../core/models/create-recommend-wish-list-item.dto';
import { RecommendedWishListItem } from '../../../core/models/recommended-wish-list-item';
import { PhoneNumberPipe } from '../../../shared/pipes/phone-number.pipe';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PhoneInputComponent,
    PhoneNumberPipe
  ],
  providers: [provideNgxMask()],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  userForm: FormGroup;
  passwordForm: FormGroup;
  editForm: FormGroup | null = null;
  additionalPropertiesForm: FormGroup | null = null;
  users: User[] = [];
  isLoading = false;
  showPasswordModal = false;
  showAdditionalPropertiesModal = false;
  selectedUserId: number | null = null;
  showNewPassword = false;
  showConfirmPassword = false;
  editingUserId: number | null = null;
  selectedUser: User | null = null;
  showRecommendationModal = false;
  recommendationForm: FormGroup;
  selectedUserForRecommendation: User | null = null;
  showRecommendationsViewModal = false;
  selectedUserForRecommendations: User | null = null;
  userRecommendations: RecommendedWishListItem[] = [];
  editingRecommendationId: number | null = null;
  editRecommendationForm: FormGroup | null = null;
  expandedUserId: number | null = null;
  isEditingAdditionalProperties: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private notificationService: NotificationService,
    private wishListRecommendationsService: WishListRecommendationsService
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      isAdmin: [false],
      spendingLimit: [null],
      sillyDescription: [''],
      parentEmail1: ['', [Validators.email]],
      parentEmail2: ['', [Validators.email]],
      parentPhone1: ['', [Validators.pattern(/^\(\d{3}\) \d{3}-\d{4}$/)]],
      parentPhone2: ['', [Validators.pattern(/^\(\d{3}\) \d{3}-\d{4}$/)]],
      birthday: [null]
    });

    this.passwordForm = this.fb.group({
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });

    this.recommendationForm = this.fb.group({
      itemName: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      productUrl: ['', [Validators.maxLength(2048)]],
      estimatedCost: [null, [Validators.min(0), Validators.max(99999.99)]],
      defaultQuantity: [1, [Validators.required, Validators.min(1)]],
      productSrcImage: ['', [Validators.maxLength(2048)]]
    });
  }

  passwordMatchValidator(g: FormGroup) {
    const newPassword = g.get('newPassword')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.error(error.error?.message || 'Failed to load users');
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.isLoading = true;
      console.log("Creating user with values:", this.userForm.value);
      this.userService.createUser(this.userForm.value).subscribe({
        next: () => {
          this.notificationService.success('User created successfully');
          this.loadUsers();
          this.userForm.reset();
          this.isLoading = false;
        },
        error: (error) => {
          this.notificationService.error(error.error?.message || 'Failed to create user');
          this.isLoading = false;
        }
      });
    } else {
      this.notificationService.warning('Please fill in all required fields correctly');
    }
  }

  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.isLoading = true;
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.notificationService.success('User deleted successfully');
          this.loadUsers();
        },
        error: (error) => {
          this.notificationService.error(error.error?.message || 'Failed to delete user');
          this.isLoading = false;
        }
      });
    }
  }

  openPasswordModal(userId: number): void {
    this.selectedUserId = userId;
    this.showPasswordModal = true;
    this.passwordForm.reset();
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
    this.selectedUserId = null;
    this.passwordForm.reset();
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }

  togglePasswordVisibility(field: 'new' | 'confirm'): void {
    if (field === 'new') {
      this.showNewPassword = !this.showNewPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onChangePassword(): void {
    if (this.passwordForm.valid && this.selectedUserId) {
      this.isLoading = true;
      this.userService.changePassword(this.selectedUserId, this.passwordForm.get('newPassword')?.value).subscribe({
        next: () => {
          this.notificationService.success('Password changed successfully');
          this.closePasswordModal();
          this.isLoading = false;
        },
        error: (error) => {
          this.notificationService.error(error.error?.message || 'Failed to change password');
          this.isLoading = false;
        }
      });
    } else if (this.passwordForm.errors?.['mismatch']) {
      this.notificationService.error('Passwords do not match');
    }
  }

  openAdditionalPropertiesModal(user: User): void {
    this.selectedUser = user;
    this.showAdditionalPropertiesModal = true;

    if (this.editingUserId === user.userId) {
      this.additionalPropertiesForm = this.fb.group({
        spendingLimit: [user.spendingLimit || null],
        sillyDescription: [user.sillyDescription || ''],
        parentEmail1: [user.parentEmail1 || '', [Validators.email]],
        parentEmail2: [user.parentEmail2 || '', [Validators.email]],
        parentPhone1: [user.parentPhone1 || '', [Validators.pattern(/^\(\d{3}\) \d{3}-\d{4}$/)]],
        parentPhone2: [user.parentPhone2 || '', [Validators.pattern(/^\(\d{3}\) \d{3}-\d{4}$/)]]
      });
    }
  }

  closeAdditionalPropertiesModal(): void {
    this.showAdditionalPropertiesModal = false;
    this.selectedUser = null;
    this.isEditingAdditionalProperties = false;
    this.additionalPropertiesForm = null;
  }

  saveAdditionalProperties(): void {
    if (this.additionalPropertiesForm?.valid && this.selectedUser) {
      this.isLoading = true;

      // Ensure all fields are included in the update, even if they are empty
      const updateData = {
        spendingLimit: this.additionalPropertiesForm.get('spendingLimit')?.value,
        sillyDescription: this.additionalPropertiesForm.get('sillyDescription')?.value,
        parentEmail1: this.additionalPropertiesForm.get('parentEmail1')?.value || null,
        parentEmail2: this.additionalPropertiesForm.get('parentEmail2')?.value || null,
        parentPhone1: this.additionalPropertiesForm.get('parentPhone1')?.value || null,
        parentPhone2: this.additionalPropertiesForm.get('parentPhone2')?.value || null,
        birthday: this.additionalPropertiesForm.get('birthday')?.value || null,
        userId: this.selectedUser.userId
      };

      this.userService.updateUser(this.selectedUser.userId, updateData).subscribe({
        next: () => {
          this.notificationService.success('User properties updated successfully');
          this.selectedUser = { ...this.selectedUser, ...updateData };
          this.isEditingAdditionalProperties = false;
          this.additionalPropertiesForm = null;
          this.isLoading = false;
        },
        error: (error) => {
          this.notificationService.error(error.error?.message || 'Failed to update user properties');
          this.isLoading = false;
        }
      });
    } else {
      console.log('Form validation failed or no user selected');
    }
  }

  startEditing(user: User): void {
    this.editingUserId = user.userId;
    this.editForm = this.fb.group({
      username: [user.username || '', [Validators.required]],
      name: [user.name || '', [Validators.required]],
      email: [user.email || '', [Validators.required, Validators.email]],
      birthday: [user.birthday],
      isAdmin: [!!user.isAdmin]
    });

    this.editForm.markAsPristine();
    this.editForm.markAsUntouched();
  }

  cancelEditing(): void {
    this.editingUserId = null;
    this.editForm = null;
  }

  saveEdit(): void {
    if (this.editForm?.valid && this.editingUserId) {
      this.isLoading = true;
      this.userService.updateUser(this.editingUserId, this.editForm.value).subscribe({
        next: () => {
          this.notificationService.success('User updated successfully');
          this.loadUsers();
          this.cancelEditing();
          this.isLoading = false;
        },
        error: (error) => {
          this.notificationService.error(error.error?.message || 'Failed to update user');
          this.isLoading = false;
        }
      });
    } else {
      this.notificationService.warning('Please fill in all required fields correctly');
    }
  }

  openRecommendationModal(user: User): void {
    this.selectedUserForRecommendation = user;
    this.showRecommendationModal = true;
    this.recommendationForm.reset({ defaultQuantity: 1 });
  }

  closeRecommendationModal(): void {
    this.showRecommendationModal = false;
    this.selectedUserForRecommendation = null;
    this.recommendationForm.reset({ defaultQuantity: 1 });
  }

  addRecommendation(): void {
    if (this.recommendationForm.valid && this.selectedUserForRecommendation) {
      this.isLoading = true;

      const dto: CreateRecommendWishListItemDto = {
        userId: this.selectedUserForRecommendation.userId,
        itemName: this.recommendationForm.get('itemName')?.value,
        description: this.recommendationForm.get('description')?.value || undefined,
        productUrl: this.recommendationForm.get('productUrl')?.value || undefined,
        productSrcImage: this.recommendationForm.get('productSrcImage')?.value || undefined,
        estimatedCost: this.recommendationForm.get('estimatedCost')?.value || undefined,
        defaultQuantity: this.recommendationForm.get('defaultQuantity')?.value,
        isActive: true
      };

      this.wishListRecommendationsService.createRecommendation(dto).subscribe({
        next: () => {
          this.notificationService.success('Recommendation added successfully');
          this.closeRecommendationModal();
          this.isLoading = false;
        },
        error: (error) => {
          this.notificationService.error(error.error?.message || 'Failed to add recommendation');
          this.isLoading = false;
        }
      });
    }
  }

  openRecommendationsViewModal(user: User): void {
    this.selectedUserForRecommendations = user;
    this.showRecommendationsViewModal = true;
    this.loadUserRecommendations(user.userId);
  }

  closeRecommendationsViewModal(): void {
    this.showRecommendationsViewModal = false;
    this.selectedUserForRecommendations = null;
    this.userRecommendations = [];
    this.cancelRecommendationEdit();
  }

  loadUserRecommendations(userId: number): void {
    this.isLoading = true;
    this.wishListRecommendationsService.getRecommendations(userId).subscribe({
      next: (recommendations) => {
        this.userRecommendations = recommendations;
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.error(error.error?.message || 'Failed to load recommendations');
        this.isLoading = false;
      }
    });
  }

  startEditingRecommendation(item: RecommendedWishListItem): void {
    this.editingRecommendationId = item.recommendItemId;
    this.editRecommendationForm = this.fb.group({
      itemName: [item.itemName, [Validators.required, Validators.maxLength(100)]],
      description: [item.description || '', [Validators.maxLength(500)]],
      productUrl: [item.productUrl || '', [Validators.maxLength(2048)]],
      productSrcImage: [item.productSrcImage || '', [Validators.maxLength(2048)]],
      estimatedCost: [item.estimatedCost || null, [Validators.min(0), Validators.max(99999.99)]],
      defaultQuantity: [item.defaultQuantity, [Validators.required, Validators.min(1)]],
      isActive: [item.isActive]
    });
  }

  cancelRecommendationEdit(): void {
    this.editingRecommendationId = null;
    this.editRecommendationForm = null;
  }

  saveRecommendationEdit(): void {
    if (this.editRecommendationForm?.valid && this.editingRecommendationId && this.selectedUserForRecommendations) {
      this.isLoading = true;

      const updateDto = {
        ...this.editRecommendationForm.value,
        userId: this.selectedUserForRecommendations.userId
      };

      this.wishListRecommendationsService.updateRecommendation(this.editingRecommendationId, updateDto).subscribe({
        next: () => {
          this.notificationService.success('Recommendation updated successfully');
          this.loadUserRecommendations(this.selectedUserForRecommendations!.userId);
          this.cancelRecommendationEdit();
        },
        error: (error) => {
          this.notificationService.error(error.error?.message || 'Failed to update recommendation');
          this.isLoading = false;
        }
      });
    }
  }

  deleteRecommendation(recommendItemId: number): void {
    if (confirm('Are you sure you want to delete this recommendation?')) {
      this.isLoading = true;
      this.wishListRecommendationsService.deleteRecommendation(recommendItemId).subscribe({
        next: () => {
          this.notificationService.success('Recommendation deleted successfully');
          this.loadUserRecommendations(this.selectedUserForRecommendations!.userId);
        },
        error: (error) => {
          this.notificationService.error(error.error?.message || 'Failed to delete recommendation');
          this.isLoading = false;
        }
      });
    }
  }

  isValidUrl(url: string): boolean {
    if (!url) return true; // Empty URLs are considered valid
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  openProductUrl(url: string): void {
    if (this.isValidUrl(url)) {
      window.open(url, '_blank');
    } else {
      this.notificationService.error('Invalid URL');
    }
  }

  toggleUserCard(userId: number): void {
    this.expandedUserId = this.expandedUserId === userId ? null : userId;
  }

  startEditingAdditionalProperties(): void {
    this.isEditingAdditionalProperties = true;
    this.additionalPropertiesForm = this.fb.group({
      spendingLimit: [this.selectedUser?.spendingLimit || null],
      sillyDescription: [this.selectedUser?.sillyDescription || ''],
      parentEmail1: [this.selectedUser?.parentEmail1 || '', [Validators.email]],
      parentEmail2: [this.selectedUser?.parentEmail2 || '', [Validators.email]],
      parentPhone1: [this.selectedUser?.parentPhone1 || ''],
      parentPhone2: [this.selectedUser?.parentPhone2 || ''],
      birthday: [this.selectedUser?.birthday]
    });
  }

  cancelEditingAdditionalProperties(): void {
    this.isEditingAdditionalProperties = false;
    this.additionalPropertiesForm = null;
  }
}
