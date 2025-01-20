import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WishListService } from '../../../core/services/wish-list.service';
import { WishListItem } from '../../../core/models/wish-list-item';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../shared/models/user.interface';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LoadingService } from '../../../core/services/loading.service';
import { WishListSubmissionService } from '../../../core/services/wish-list-submission.service';
import { WishListSubmission } from '../../../core/models/wish-list-submission';
import { WishListSubmissionStatus } from '../../../core/models/enums/wish-list-submission-status';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ProductModalComponent } from '../../../shared/modals/product-modal/product-modal.component';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { WelcomeModalComponent } from '../../../shared/modals/welcome-modal/welcome-modal.component';
import { ShipmentAnnouncementComponent } from '../../../shared/components/shipment-announcement/shipment-announcement.component';
import { TextEditModalComponent } from '../../../shared/modals/text-edit-modal/text-edit-modal.component';
import { WishListRecommendationsService } from '../../../core/services/wish-list-recommendations.service';
import { RecommendedWishListItem } from '../../../core/models/recommended-wish-list-item';
import { SlickCarouselModule } from 'ngx-slick-carousel';

@Component({
  selector: 'app-wish-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    ProductModalComponent,
    WelcomeModalComponent,
    ShipmentAnnouncementComponent,
    TextEditModalComponent,
    SlickCarouselModule
  ],
  templateUrl: './wish-list.component.html',
  styleUrl: './wish-list.component.scss',
  host: {
    class: 'block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
  }
})
export class WishListComponent implements OnInit {
  WishListSubmissionStatus = WishListSubmissionStatus;
  wishListItems: WishListItem[] = [];
  userSubmissions: WishListSubmission[] = [];
  showModal = false;
  loading = false;
  error: string | null = null;
  currentUser: User | null = null;
  currentStep = 1;

  giftForm: Omit<WishListItem, 'id'> = {
    userId: 0,
    itemName: '',
    description: '',
    productUrl: '',
    quantity: 1,
    estimatedCost: 0
  };

  editingItem: WishListItem | null = null;
  editForm: WishListItem | null = null;

  loading$ = this.loadingService.loading$;
  submission: WishListSubmission | null = null;

  showProductModal = false;
  selectedProductUrl = '';

  submissionError: boolean = false;

  private readonly statusMap: Record<number, string> = {
    0: 'Not Submitted',
    1: 'Pending Approval',
    2: 'Completed',
    3: 'Rejected'
  };

  showWelcomeModal = false;

  showTextEditModal = false;
  textEditField: 'description' | 'productUrl' | null = null;
  textEditValue = '';
  textEditTitle = '';
  textEditPlaceholder = '';

  recommendedItems: RecommendedWishListItem[] = [];

  slickConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    dots: true,
    infinite: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1
        }
      }
    ]
  };

  isAddingToWishList = false;

  constructor(
    private wishListService: WishListService,
    private authService: AuthService,
    private loadingService: LoadingService,
    private submissionService: WishListSubmissionService,
    private toastr: ToastrService,
    private router: Router,
    private recommendationsService: WishListRecommendationsService
  ) {
    // Check if we're coming from login
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { showWelcomeModal: boolean, fromLogin: boolean };

    if (state?.showWelcomeModal && state?.fromLogin) {
      this.showWelcomeModal = true;
    }
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.currentUser = user;
        this.loadWishList();
        this.loadSubmission();
        this.loadRecommendations();
      }
    });
  }

  private loadWishList(): void {
    this.loading = true;
    this.error = null;
    if (this.currentUser && this.currentUser.userId) {
      this.wishListService.getUserItems(this.currentUser.userId).subscribe({
        next: (items) => {
          this.wishListItems = items;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load wish list items. Please try again later.';
          this.loading = false;
          console.error('Error loading wish list:', error);
        }
      });
    }
  }

  private loadSubmission(): void {
    if (this.currentUser?.userId) {
      this.submissionService.getSubmissionByUserId(this.currentUser.userId).subscribe({
        next: (submissions: WishListSubmission[]) => {
          this.userSubmissions = submissions.sort((a, b) =>
            new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
          );

          // Get the most recent active submission
          this.submission = this.userSubmissions.find(s => s.isActive) || null;
          this.submissionError = false;
        },
        error: (error) => {
          console.error('Error loading submission:', error);
          this.submissionError = true;
        }
      });
    }
  }

  addGift(): void {
    if (!this.currentUser?.userId) {
      this.error = 'User not authenticated';
      return;
    }
    this.giftForm = {
      userId: this.currentUser.userId,
      itemName: '',
      description: '',
      productUrl: '',
      quantity: 1,
      estimatedCost: 0
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  isFormValid(): boolean {
    return !!this.giftForm!.itemName &&
           this.giftForm!.quantity > 0 &&
           this.isValidUrl(this.giftForm!.productUrl || '');
  }

  onSubmit(): void {
    if (!this.currentUser?.userId) {
      this.error = 'User not authenticated';
      return;
    }

    this.giftForm.userId = this.currentUser.userId;

    if (this.isFormValid()) {
      this.loading = true;
      this.wishListService.createItem(this.giftForm).subscribe({
        next: (newItem) => {
          this.wishListItems.push(newItem);
          this.closeModal();
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to add item. Please try again.';
          this.loading = false;
          console.error('Error adding item:', error);
        }
      });
    }
  }

  private resetForm(): void {
    this.giftForm = {
      userId: 0,
      itemName: '',
      description: '',
      productUrl: '',
      quantity: 1,
      estimatedCost: 0
    };
  }

  startEditing(item: WishListItem): void {
    if (!this.currentUser?.userId) {
      this.error = 'User not authenticated';
      return;
    }
    this.editingItem = item;
    this.editForm = {
      ...item,
      userId: this.currentUser.userId
    };
  }

  cancelEditing(): void {
    this.editingItem = null;
    this.editForm = null;
  }

  saveEdit(): void {
    if (this.editingItem && this.editForm) {
      this.loading = true;
      this.wishListService.updateItem(this.editingItem.itemId!, this.editForm).subscribe({
        next: (updatedItem) => {
          const index = this.wishListItems.findIndex(item => item.itemId === updatedItem.itemId);
          if (index !== -1) {
            this.wishListItems[index] = updatedItem;
          }
          this.cancelEditing();
          this.loading = false;
          this.toastr.success('Gift updated successfully');
        },
        error: (error) => {
          this.error = 'Failed to update item. Please try again.';
          this.loading = false;
          this.toastr.error(error?.error?.message || 'Failed to update gift. Please try again.');
          console.error('Error updating item:', error);
        }
      });
    }
  }

  confirmDelete(item: WishListItem): void {
    if (confirm('Are you sure you want to delete this gift?')) {
      this.loading = true;
      this.wishListService.deleteItem(item.itemId!).subscribe({
        next: () => {
          const index = this.wishListItems.findIndex(i => i.itemId === item.itemId);
          if (index !== -1) {
            this.wishListItems.splice(index, 1);
          }
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to delete item. Please try again.';
          this.loading = false;
          console.error('Error deleting item:', error);
        }
      });
    }
  }

  get hasItems(): boolean {
    return this.wishListItems.length > 0;
  }

  submitWishList(): void {
    if (!this.currentUser?.userId) {
      this.toastr.error('User not authenticated', 'Error');
      return;
    }

    this.loading = true;
    this.submissionService.createSubmission(this.currentUser.userId).subscribe({
      next: (submission) => {
        this.submission = submission;
        this.loading = false;
        this.currentStep = 2;
      },
      error: (error) => {
        console.error('Error creating submission:', error);
        this.loading = false;
      }
    });
  }

  get currentStepFromStatus(): number {
    let currentSubmission = this.submission;
    if (!currentSubmission) return 0;

    switch (currentSubmission.statusId) {
      case WishListSubmissionStatus.PendingApproval:
        return 1;  // Parent Approval step
      case WishListSubmissionStatus.Completed:
        return 2;  // Gifts!!!! step
      case WishListSubmissionStatus.Rejected:
        return 1;  // Back to step 1 if rejected
      default:
        return 1;  // Default to step 1
    }
  }

  confirmEditSubmittal(): void {
    if (!this.submission) {
      this.toastr.error('No active submission found', 'Error');
      return;
    }

    const confirmed = confirm('This will re-start the approval process. Are you sure you want to continue?');

    if (confirmed) {
      const updateDto = {
        statusId: 0,
        makeInactive: true,
        reason: 'Edit/Update/Resubmit'
      };

      this.loading = true;
      this.submissionService.updateSubmission(this.submission.submissionId, updateDto).subscribe({
        next: (response) => {
          this.submission = null;
          this.currentStep = 1;
          this.loading = false;
          this.loadWishList();
          this.loadSubmission();
        },
        error: (error) => {
          console.error('Error updating submission:', error);
          this.loading = false;
        }
      });
    }
  }

  getStatusName(statusId: number | null): string {
    if (this.submissionError) {
      return 'Error retrieving Form Status';
    }

    if (!statusId && statusId !== 0) {
      return 'Not Submitted';
    }

    return this.statusMap[statusId] || 'Unknown Status';
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
      // Option 1: Show modal with warning
      this.showProductModal = true;
      this.selectedProductUrl = url;

      // Option 2: Direct open in new tab
      // window.open(url, '_blank');
    } else {
      console.error('Invalid URL');
    }
  }

  closeProductModal(): void {
    this.showProductModal = false;
    this.selectedProductUrl = '';
  }

  isEditFormValid(): boolean {
    return this.editForm !== null &&
           !!this.editForm.itemName &&
           this.editForm.quantity > 0 &&
           (!this.editForm.productUrl || this.isValidUrl(this.editForm.productUrl));
  }

  getStepProgress(): string {
    if (!this.submission || this.submission.statusId === 0) return '0%';
    if (this.submission.statusId === 1) return '50%';
    if (this.submission.statusId === 2) return '100%';
    return '0%';
  }

  isStepActive(step: number): boolean {
    if (!this.submission) return step === 1;
    if (this.submission.statusId === 0) return step === 1;

    // For PendingApproval (statusId = 1), activate step 2
    if (this.submission.statusId === 1) return step === 2;
    // For Completed (statusId = 2), activate step 3
    if (this.submission.statusId === 2) return step === 3;

    return false;
  }

  isStepCompleted(step: number): boolean {
    if (!this.submission) return false;

    // Step 1 is completed when status is PendingApproval or Completed
    if (step === 1) return this.submission.statusId >= 1;
    // Step 2 is completed only when status is Completed
    if (step === 2) return this.submission.statusId >= 2;
    // Step 3 is never "completed" (it's the final state)
    return false;
  }

  isStepGreen(step: number): boolean {
    return !!this.submission && this.submission.statusId >= step;
  }

  isStepBold(step: number): boolean {
    return !!this.submission && this.submission.statusId === step;
  }

  trackBySubmissionId(index: number, submission: WishListSubmission): number {
    return submission.submissionId;
  }

  onCloseModal(): void {
    this.showWelcomeModal = false;
  }

  openTextEditModal(field: 'description' | 'productUrl'): void {
    if (!this.editForm) return;

    this.textEditField = field;
    this.textEditValue = this.editForm[field] || '';

    if (field === 'description') {
      this.textEditTitle = 'Edit Description';
      this.textEditPlaceholder = 'Enter a detailed description of the gift...';
    } else {
      this.textEditTitle = 'Edit Product URL';
      this.textEditPlaceholder = 'Enter the product URL...';
    }

    this.showTextEditModal = true;
  }

  onTextEditSave(text: string): void {
    if (this.editForm && this.textEditField) {
      this.editForm[this.textEditField] = text;
    }
    this.closeTextEditModal();
  }

  closeTextEditModal(): void {
    this.showTextEditModal = false;
    this.textEditField = null;
    this.textEditValue = '';
  }

  private loadRecommendations(): void {
    if (!this.currentUser?.userId) return;

    this.loadingService.setLoading(true);
    this.recommendationsService.getRecommendations(this.currentUser.userId).subscribe({
      next: (items: RecommendedWishListItem[]) => {
        this.recommendedItems = items;
        this.loadingService.setLoading(false);
      },
      error: (error: any) => {
        console.error('Error loading recommendations:', error);
        this.toastr.error('Failed to load recommendations');
        this.loadingService.setLoading(false);
      }
    });
  }

  addRecommendedItem(recommendItemId: number): void {
    if (!this.currentUser?.userId) {
      this.toastr.error('User not authenticated');
      return;
    }

    // this.loadingService.setLoading(true);
    // this.recommendationsService.addToWishList(this.currentUser.userId, recommendItemId).subscribe({
    //   next: (newItem: WishListItem) => {
    //     this.wishListItems.push(newItem);
    //     this.toastr.success('Item added to your wish list');
    //     this.loadingService.setLoading(false);
    //   },
    //   error: (error: any) => {
    //     console.error('Error adding recommended item:', error);
    //     this.toastr.error('Failed to add item to wish list');
    //     this.loadingService.setLoading(false);
    //   }
    // });
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/placeholder.jpg';
  }

  addRecommendedItemToWishList(item: RecommendedWishListItem): void {
    if (!this.currentUser?.userId) {
      this.toastr.error('User not authenticated');
      return;
    }

    this.isAddingToWishList = true;
    const wishListItem: Omit<WishListItem, 'itemId'> = {
      userId: this.currentUser.userId,
      itemName: item.itemName,
      description: item.description,
      productUrl: item.productUrl,
      quantity: item.defaultQuantity,
      estimatedCost: item.estimatedCost
    };

    this.wishListService.createItem(wishListItem).subscribe({
      next: (newItem) => {
        this.wishListItems.push(newItem);
        this.toastr.success('Item added to your wish list');
        // Remove the item from recommendations
        this.recommendedItems = this.recommendedItems.filter(
          rec => rec.recommendItemId !== item.recommendItemId
        );
        this.isAddingToWishList = false;
      },
      error: (error) => {
        console.error('Error adding recommended item:', error);
        this.toastr.error('Failed to add item to wish list');
        this.isAddingToWishList = false;
      }
    });
  }

  get isWishListLocked(): boolean {
    return this.submission?.statusId === 1 || this.submission?.statusId === 2;
  }

  getAddButtonText(): string {
    if (this.isAddingToWishList) {
      return 'Adding...';
    }
    if (this.isWishListLocked) {
      return this.submission?.statusId === 1 ? 'Pending Approval' : 'List Completed';
    }
    return 'Add to Wish List';
  }

  getAddButtonTooltip(): string {
    if (this.isWishListLocked) {
      return this.submission?.statusId === 1
        ? 'Cannot add items while wish list is pending approval'
        : 'Cannot add items to a completed wish list';
    }
    return 'Add this item to your wish list';
  }

  get hasSpendingLimit(): boolean {
    return !!this.currentUser?.spendingLimit && this.currentUser.spendingLimit > 0;
  }
}
