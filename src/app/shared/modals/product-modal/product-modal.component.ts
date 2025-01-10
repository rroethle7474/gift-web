import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-modal.component.html',
  styleUrls: ['./product-modal.component.scss']
})
export class ProductModalComponent {
  @Input() url: string = '';
  @Output() close = new EventEmitter<void>();

  openInNewTab(): void {
    window.open(this.url, '_blank');
    this.close.emit();
  }
}
