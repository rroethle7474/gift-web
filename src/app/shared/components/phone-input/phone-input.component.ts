import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

@Component({
  selector: 'app-phone-input',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxMaskDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true
    },
    provideNgxMask()
  ],
  template: `
    <div class="phone-input-container">
      <input
        type="text"
        mask="(000) 000-0000"
        [ngClass]="inputClass"
        [placeholder]="placeholder"
        [dropSpecialCharacters]="false"
        [(ngModel)]="value"
        (ngModelChange)="onChange($event)"
        (blur)="onTouched()"
        [disabled]="disabled"
      />
      @if (showError) {
        <div class="error-message">Please enter a valid phone number</div>
      }
    </div>
  `,
  styles: [`
    .phone-input-container {
      position: relative;
      width: 100%;
    }

    input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.375rem;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      font-size: 0.875rem;
    }

    input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
    }

    input.error {
      border-color: #dc2626;
    }

    .error-message {
      color: #dc2626;
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }

    input:disabled {
      background-color: #f3f4f6;
      cursor: not-allowed;
    }
  `]
})
export class PhoneInputComponent implements ControlValueAccessor {
  @Input() placeholder = 'Phone number';
  @Input() showError = false;
  @Input() inputClass = '';

  value = '';
  disabled = false;

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
