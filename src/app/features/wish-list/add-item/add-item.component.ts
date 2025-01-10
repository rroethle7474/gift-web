import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { WishListItem } from '../../../core/models/wish-list-item';
import { RxwebValidators } from '@rxweb/reactive-form-validators';

@Component({
  selector: 'app-add-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-item.component.html',
  styleUrl: './add-item.component.scss'
})
export class AddItemComponent implements OnInit {
  itemForm!: FormGroup;
  urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.itemForm = this.fb.group({
      itemName: ['', Validators.required],
      description: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
      productUrl: ['', [RxwebValidators.url()]],
      estimatedCost: [null]
    });
  }

  // Helper method to check URL validity
  isValidUrl(url: string): boolean {
    return !url || this.urlPattern.test(url);
  }

  onSubmit() {
    if (this.itemForm.valid) {
      const newItem: WishListItem = this.itemForm.value;
      // TODO: Handle form submission
      console.log('New item:', newItem);
    }
  }
}
