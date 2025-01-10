import { Component, Input, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-welcome-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome-modal.component.html',
  styleUrls: ['./welcome-modal.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('void', style({
        opacity: 0
      })),
      state('*', style({
        opacity: 1
      })),
      transition('void <=> *', animate('300ms ease-in-out'))
    ])
  ]
})
export class WelcomeModalComponent implements OnInit {
  @Input() name: string = '';
  @Input() sillyDescription: string = '';
  @Input() onClose: () => void = () => {};

  isVisible = true;

  ngOnInit() {
    // Reduced to 3 seconds
    setTimeout(() => {
      this.closeModal();
    }, 3000);
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeModal();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('backdrop')) {
      this.closeModal();
    }
  }

  closeModal(): void {
    if (!this.isVisible) return;
    this.isVisible = false;
    setTimeout(() => {
      this.onClose();
    }, 300);
  }
}
