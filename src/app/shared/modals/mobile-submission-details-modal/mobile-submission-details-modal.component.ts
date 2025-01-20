import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WishListSubmission } from '../../../core/models/wish-list-submission';
import { WishListItem } from '../../../core/models/wish-list-item';

@Component({
  selector: 'app-mobile-submission-details-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mobile-submission-details-modal.component.html',
  styleUrls: ['./mobile-submission-details-modal.component.css']
})
export class MobileSubmissionDetailsModalComponent {
  @Input() submission!: WishListSubmission;
  @Input() wishListItems: WishListItem[] = [];
  @Input() isGuestUser = false;
  @Output() close = new EventEmitter<void>();
  @Output() approve = new EventEmitter<void>();
  @Output() reject = new EventEmitter<void>();

  formatCurrency(value: number | undefined): string {
    if (value === undefined) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  getStatusFriendlyName(statusId: number): string {
    switch (statusId) {
      case 1:
        return 'Pending';
      case 2:
        return 'Completed';
      case 3:
        return 'Rejected';
      default:
        return 'Unknown';
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onApprove(): void {
    this.approve.emit();
  }

  onReject(): void {
    this.reject.emit();
  }
}
