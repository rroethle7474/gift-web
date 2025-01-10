import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { WishListSubmissionService } from '../../../core/services/wish-list-submission.service';
import { WishListService } from '../../../core/services/wish-list.service';
import { WishListSubmission } from '../../../core/models/wish-list-submission';
import { WishListItem } from '../../../core/models/wish-list-item';
import { RejectionModalComponent } from '../../../shared/modals/rejection-modal/rejection-modal.component';

@Component({
  selector: 'app-wish-list-approval',
  standalone: true,
  imports: [CommonModule, RejectionModalComponent],
  templateUrl: './wish-list-approval.component.html',
  styleUrls: ['./wish-list-approval.component.scss']
})
export class WishListApprovalComponent implements OnInit {
  submission: WishListSubmission | null = null;
  wishListItems: WishListItem[] = [];
  loading = true;
  error = false;
  showRejectionModal = false;

  constructor(
    private route: ActivatedRoute,
    private wishListSubmissionService: WishListSubmissionService,
    private wishListService: WishListService
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('userId');
    const submissionId = this.route.snapshot.paramMap.get('submissionId');

    if (!userId || !submissionId) {
      this.loading = false;
      this.error = true;
      return;
    }

    // Load submission details
    this.wishListSubmissionService.getSubmissionByUserId(Number(userId)).subscribe({
      next: (submissions: WishListSubmission[]) => {
        if (submissions.length > 0) {
          this.submission = submissions.find(submission => submission.submissionId === Number(submissionId)) ?? null;
          this.loadWishListItems(Number(userId));
        } else {
          this.error = true;
        }
      },
      error: (error: any) => {
        console.error('Error loading submission:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  private loadWishListItems(userId: number): void {
    this.wishListService.getUserItems(userId).subscribe({
      next: (items) => {
        this.wishListItems = items;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading wish list items:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

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
        return 'Pending Approval';
      case 2:
        return 'Completed';
      case 3:
        return 'Rejected';
      default:
        return 'Unknown';
    }
  }

  onApprove(): void {
    if (this.submission) {
      const updateDto = {
        statusId: 2, // Completed
        makeInactive: false,
        reason: this.submission.reason,
        shipmentDate: this.submission.shipmentDate
      };

      this.wishListSubmissionService
        .updateSubmission(this.submission.submissionId, updateDto)
        .subscribe({
          next: (updatedSubmission) => {
            this.submission = updatedSubmission;
          },
          error: (error) => {
            console.error('Error approving submission:', error);
          }
        });
    }
  }

  onReject(): void {
    this.showRejectionModal = true;
  }

  onConfirmRejection(reason: string): void {
    if (this.submission) {
      const updateDto = {
        statusId: 3, // Rejected
        makeInactive: true,
        reason: reason,
        shipmentDate: this.submission.shipmentDate
      };

      this.wishListSubmissionService
        .updateSubmission(this.submission.submissionId, updateDto)
        .subscribe({
          next: (updatedSubmission) => {
            this.submission = updatedSubmission;
            this.showRejectionModal = false;
          },
          error: (error) => {
            console.error('Error rejecting submission:', error);
          }
        });
    }
  }

  onCancelRejection(): void {
    this.showRejectionModal = false;
  }
}
