import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rejection-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-4 sm:p-5 border w-[95%] sm:w-96 shadow-lg rounded-md bg-white">
        <div class="flex flex-col">
          <h3 class="text-lg font-semibold mb-4">Reject Submission</h3>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Reason for Rejection <span class="text-red-500">*</span>
            </label>
            <textarea
              [(ngModel)]="rejectionReason"
              (ngModelChange)="onReasonChange()"
              rows="3"
              class="w-full p-2 border rounded-md"
              placeholder="Please provide a reason for rejection">
            </textarea>
            @if (showError) {
              <p class="text-red-500 text-sm mt-1">Please provide a reason for rejection</p>
            }
          </div>

          <div class="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
            <button
              (click)="onCancel()"
              class="w-full sm:w-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md order-2 sm:order-1">
              Cancel
            </button>
            <button
              (click)="onConfirm()"
              [disabled]="!isValid"
              [class]="isValid ?
                'w-full sm:w-auto px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md order-1 sm:order-2' :
                'w-full sm:w-auto px-4 py-2 bg-gray-400 cursor-not-allowed text-white rounded-md order-1 sm:order-2'">
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RejectionModalComponent {
  @Output() confirm = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  rejectionReason: string = '';
  showError: boolean = false;
  isValid: boolean = false;

  onReasonChange(): void {
    this.isValid = this.rejectionReason.trim().length > 0;
    if (this.isValid) {
      this.showError = false;
    }
  }

  onConfirm(): void {
    if (!this.rejectionReason.trim()) {
      this.showError = true;
      this.isValid = false;
      return;
    }
    this.confirm.emit(this.rejectionReason.trim());
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
