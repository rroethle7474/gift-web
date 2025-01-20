import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpdateWishListSubmissionDto, WishListSubmissionService } from '../../../core/services/wish-list-submission.service';
import { WishListService } from '../../../core/services/wish-list.service';
import { UserService } from '../../../core/services/user.service';
import { WishListSubmission } from '../../../core/models/wish-list-submission';
import { WishListItem } from '../../../core/models/wish-list-item';
import { WishListSubmissionStatus } from '../../../core/models/enums/wish-list-submission-status';
import { User } from '../../../shared/models/user.interface';
import { ShipmentDateModalComponent } from '../../../shared/modals/shipment-date-modal/shipment-date-modal.component';
import { SubmissionDetailsModalComponent } from '../../../shared/modals/submission-details-modal/submission-details-modal.component';
import { MobileSubmissionDetailsModalComponent } from '../../../shared/modals/mobile-submission-details-modal/mobile-submission-details-modal.component';
import { BreakpointService } from '../../../core/services/breakpoint.service';
import { AuthService } from '../../../core/services/auth.service';

interface UserSubmissionData {
  submissions: WishListSubmission[];
  wishListItems: WishListItem[];
}

interface UserSummary {
  user: User;
  activeSubmission: WishListSubmission | null;
}

@Component({
  selector: 'app-wish-list-overview',
  standalone: true,
  imports: [CommonModule, ShipmentDateModalComponent, SubmissionDetailsModalComponent, MobileSubmissionDetailsModalComponent],
  templateUrl: './wish-list-overview.component.html',
  styleUrl: './wish-list-overview.component.scss'
})
export class WishListOverviewComponent implements OnInit {
  submissionsByUser: { [key: string]: UserSubmissionData } = {};
  userSummaries: UserSummary[] = [];
  showShipmentDateModal = false;
  selectedSubmission: WishListSubmission | null = null;
  showDetailsModal = false;
  showMobileDetailsModal = false;
  isGuestUser = false;

  constructor(
    private wishListSubmissionService: WishListSubmissionService,
    private wishListService: WishListService,
    private userService: UserService,
    private breakpointService: BreakpointService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Check if current user is a guest
    this.authService.currentUser$.subscribe({
      next: (user: User | null) => {
        this.isGuestUser = user?.isGuestUser ?? false;
      },
      error: (error: any) => {
        console.error('Error getting current user:', error);
        this.isGuestUser = false;
      }
    });

    this.loadUserSummaries();
    this.loadSubmissions();
  }

  loadUserSummaries(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        // Filter active users
        const activeUsers = users;

        // For each active user, get their submissions
        activeUsers.forEach(user => {
          this.wishListSubmissionService.getSubmissionByUserId(user.userId).subscribe({
            next: (submissions) => {
              // Find the active submission (if any)
              const activeSubmission = submissions.find(s => s.isActive) ?? null;
              this.userSummaries.push({
                user,
                activeSubmission
              });
            },
            error: (error) => {
              console.error(`Error loading submissions for user ${user.username}:`, error);
              this.userSummaries.push({
                user,
                activeSubmission: null
              });
            }
          });
        });
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  loadSubmissions(): void {
    this.wishListSubmissionService.getAllSubmissions().subscribe({
      next: (submissions) => {
        // First group submissions by user
        const groupedSubmissions = this.groupSubmissionsByUser(submissions);

        // For each user, fetch their wish list items
        Object.entries(groupedSubmissions).forEach(([userName, userSubmissions]) => {
          const userId = userSubmissions[0].userId; // Get userId from first submission
          this.wishListService.getUserItems(userId).subscribe({
            next: (items) => {
              this.submissionsByUser[userName] = {
                submissions: userSubmissions,
                wishListItems: items
              };
            },
            error: (error) => {
              console.error(`Error loading wish list items for user ${userName}:`, error);
              this.submissionsByUser[userName] = {
                submissions: userSubmissions,
                wishListItems: []
              };
            }
          });
        });
      },
      error: (error) => {
        console.error('Error loading submissions:', error);
      }
    });
  }

  private groupSubmissionsByUser(submissions: WishListSubmission[]): { [key: string]: WishListSubmission[] } {
    return submissions.reduce((groups: { [key: string]: WishListSubmission[] }, submission) => {
      const userName = submission.userName;
      if (!groups[userName]) {
        groups[userName] = [];
      }
      groups[userName].push(submission);
      return groups;
    }, {});
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

  onApprove(submission: WishListSubmission): void {
    const updateDto = {
      statusId: WishListSubmissionStatus.Completed,
      makeInactive: false,
      reason: ''
    };

    this.wishListSubmissionService.updateSubmission(submission.submissionId, updateDto)
      .subscribe({
        next: () => {
          this.loadSubmissions(); // Refresh the data
        },
        error: (error) => {
          console.error('Error approving submission:', error);
        }
      });
  }

  onReject(submission: WishListSubmission): void {
    // Show confirmation dialog before rejecting
    if (!confirm('Are you sure you want to reject this submission? Please provide a reason.')) {
      return;
    }

    const reason = prompt('Please enter a reason for rejection:');
    if (reason === null) return; // User cancelled the prompt

    const updateDto = {
      statusId: WishListSubmissionStatus.Rejected,
      makeInactive: true,
      reason: reason
    };

    this.wishListSubmissionService.updateSubmission(submission.submissionId, updateDto)
      .subscribe({
        next: () => {
          this.loadSubmissions(); // Refresh the data
        },
        error: (error) => {
          console.error('Error rejecting submission:', error);
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

  getUserSubmissionStatus(summary: UserSummary): string {
    if (!summary.activeSubmission) {
      return 'No Submission';
    }
    return this.getStatusFriendlyName(summary.activeSubmission.statusId);
  }

  onAddShipmentDate(submission: WishListSubmission) {
    this.selectedSubmission = submission;
    this.showShipmentDateModal = true;
  }

  onEditShipmentDate(submission: WishListSubmission) {
    this.selectedSubmission = submission;
    this.showShipmentDateModal = true;
  }

  onSaveShipmentDate(date: Date) {
    if (this.selectedSubmission) {
      const updateDto: UpdateWishListSubmissionDto = {
        statusId: this.selectedSubmission.statusId,
        makeInactive: false,
        reason: this.selectedSubmission.reason,
        shipmentDate: date
      };

      this.wishListSubmissionService
        .updateSubmission(this.selectedSubmission.submissionId, updateDto)
        .subscribe({
          next: (updatedSubmission) => {
            this.loadSubmissions();
            this.showShipmentDateModal = false;
            this.selectedSubmission = null;
          },
          error: (error) => {
            console.error('Error updating shipment date:', error);
          }
        });
    }
  }

  onCancelShipmentDate() {
    this.showShipmentDateModal = false;
    this.selectedSubmission = null;
  }

  private updateSubmissionInList(updatedSubmission: WishListSubmission) {
    // Update the submission in your userSummaries and submissionsByUser
    // Implementation depends on your data structure
    // This is just an example:
    const username = updatedSubmission.userName;
    if (this.submissionsByUser[username]) {
      const index = this.submissionsByUser[username].submissions.findIndex(
        s => s.submissionId === updatedSubmission.submissionId
      );
      if (index !== -1) {
        this.submissionsByUser[username].submissions[index] = updatedSubmission;
      }
    }
  }

  onViewDetails(submission: WishListSubmission): void {
    this.selectedSubmission = submission;
    this.showDetailsModal = true;
  }

  onSaveDetails(details: {shipmentDate: Date | null, reason: string}): void {
    if (this.selectedSubmission) {
      const updateDto: UpdateWishListSubmissionDto = {
        statusId: this.selectedSubmission.statusId,
        makeInactive: false,
        reason: details.reason,
        shipmentDate: details.shipmentDate ?? undefined
      };

      this.wishListSubmissionService
        .updateSubmission(this.selectedSubmission.submissionId, updateDto)
        .subscribe({
          next: () => {
            this.loadSubmissions();
            this.showDetailsModal = false;
            this.selectedSubmission = null;
          },
          error: (error) => {
            console.error('Error updating submission details:', error);
          }
        });
    }
  }

  onCancelDetails(): void {
    this.showDetailsModal = false;
    this.selectedSubmission = null;
  }

  onMobileRowClick(userGroup: { key: string, value: UserSubmissionData }): void {
    if (!this.breakpointService.isDesktop) {
      const submission = userGroup.value.submissions[0];
      this.selectedSubmission = submission;
      this.showMobileDetailsModal = true;
    }
  }

  onCloseMobileDetails(): void {
    this.showMobileDetailsModal = false;
    this.selectedSubmission = null;
  }
}
