import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shipment-date-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="relative -translate-y-12 sm:-translate-y-8 bg-white rounded-lg p-4 w-full max-w-sm mx-auto">
        <h2 class="text-lg sm:text-xl font-semibold mb-4">
          {{ currentDate ? 'Edit' : 'Add' }} Shipment Date
        </h2>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Shipment Date
          </label>
          <input
            type="date"
            [(ngModel)]="selectedDate"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
        </div>

        <div class="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            (click)="onCancel()"
            class="w-full sm:w-auto px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md">
            Cancel
          </button>
          <button
            (click)="onSave()"
            class="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Save
          </button>
        </div>
      </div>
    </div>
  `
})
export class ShipmentDateModalComponent {
  @Input() currentDate: Date | null = null;
  @Output() save = new EventEmitter<Date>();
  @Output() cancel = new EventEmitter<void>();

  selectedDate: string = '';

  ngOnInit() {
    if (this.currentDate) {
      this.selectedDate = this.formatDateForInput(this.currentDate);
    }
  }

  private formatDateForInput(date: Date): string {
    return new Date(date).toISOString().slice(0, 10);
  }

  onSave() {
    if (this.selectedDate) {
      const date = new Date(this.selectedDate + 'T12:00:00Z');
      this.save.emit(date);
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}
