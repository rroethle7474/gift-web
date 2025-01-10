import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WishListSubmission } from '../../../core/models/wish-list-submission';

@Component({
  selector: 'app-submission-details-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
      <div class="relative top-20 sm:top-20 mx-auto p-4 border shadow-lg rounded-md bg-white w-full max-w-sm">
        <div class="flex flex-col">
          <h3 class="text-lg sm:text-xl font-semibold mb-4">Submission Details</h3>

          <!-- Shipment Date -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Shipment Date</label>
            @if (submission.statusId === 2) {
              <input
                type="date"
                [(ngModel)]="editedShipmentDate"
                (ngModelChange)="onFieldChange()"
                class="w-full p-2 border rounded-md text-sm">
            } @else {
              <p class="text-sm text-gray-500">Available after approval</p>
            }
          </div>

          <!-- Reason -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea
              [(ngModel)]="editedReason"
              (ngModelChange)="onFieldChange()"
              rows="3"
              class="w-full p-2 border rounded-md text-sm"
              [placeholder]="submission.statusId === 3 ? 'Rejection reason' : 'Notes'">
            </textarea>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
            <button
              (click)="onCancel()"
              class="w-full sm:w-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm">
              Cancel
            </button>
            <button
              (click)="onSave()"
              [disabled]="!hasChanges"
              [class]="hasChanges ?
                'w-full sm:w-auto px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm' :
                'w-full sm:w-auto px-4 py-2 bg-gray-400 cursor-not-allowed text-white rounded-md text-sm'">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SubmissionDetailsModalComponent {
  @Input() submission!: WishListSubmission;
  @Output() save = new EventEmitter<{shipmentDate: Date | null, reason: string}>();
  @Output() cancel = new EventEmitter<void>();

  editedShipmentDate: string | null = null;
  editedReason: string = '';

  private initialShipmentDate: string | null = null;
  private initialReason: string = '';
  hasChanges: boolean = false;

  ngOnInit() {
    this.editedShipmentDate = this.submission.shipmentDate ?
      new Date(this.submission.shipmentDate).toISOString().slice(0, 16) : null;
    this.editedReason = this.submission.reason || '';

    // Store initial values
    this.initialShipmentDate = this.editedShipmentDate;
    this.initialReason = this.editedReason;
  }

  onFieldChange() {
    this.hasChanges =
      this.editedShipmentDate !== this.initialShipmentDate ||
      this.editedReason !== this.initialReason;
  }

  onSave() {
    if (this.hasChanges) {
      this.save.emit({
        shipmentDate: this.editedShipmentDate ? new Date(this.editedShipmentDate) : null,
        reason: this.editedReason
      });
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}
