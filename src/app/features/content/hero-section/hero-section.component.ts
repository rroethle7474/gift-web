import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss']
})
export class HeroSectionComponent {
  currentSlide = 0;
  totalSlides = 3;

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
    this.updateSlidePosition();
  }

  previousSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
    this.updateSlidePosition();
  }

  private updateSlidePosition(): void {
    const slideContainer = document.querySelector('.flex') as HTMLElement;
    if (slideContainer) {
      const offset = -(this.currentSlide * 100);
      slideContainer.style.transform = `translateX(${offset}%)`;
    }
  }
}
