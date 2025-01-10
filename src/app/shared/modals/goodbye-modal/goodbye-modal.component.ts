import { Component, Input, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-goodbye-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './goodbye-modal.component.html',
  styleUrls: ['./goodbye-modal.component.scss'],
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
export class GoodbyeModalComponent implements OnInit {
  @Input() name: string = '';
  @Input() onClose: () => void = () => {};

  isVisible = true;
  timeMessage: string;

  constructor() {
    this.timeMessage = this.getTimeBasedMessage();
  }

  private getTimeBasedMessage(): string {
    const hour = new Date().getHours();

    if (hour >= 16 || hour < 3) { // After 4 PM or before 3 AM
      return "Have a good night";
    } else if (hour >= 3 && hour < 12) { // Between 3 AM and noon
      return "Have a good morning";
    } else { // Between noon and 4 PM
      return "Have a good afternoon";
    }
  }

  ngOnInit() {
    // Reduced to 2 seconds
    setTimeout(() => {
      this.closeModal();
    }, 2000);
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
