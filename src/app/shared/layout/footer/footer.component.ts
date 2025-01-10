import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Snowflake {
  x: number;
  y: number;
  size: number;
  speed: number;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit, OnDestroy {
  snowflakes: Snowflake[] = [];
  private animationFrameId: number | null = null;
  showMessage = false;
  messageStyle = {};

  ngOnInit() {
    // Initialize snowflakes
    for (let i = 0; i < 50; i++) {
      this.snowflakes.push(this.createSnowflake());
    }
    this.animateSnow();
    this.startMessageAnimation();
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private createSnowflake(): Snowflake {
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * 100 - 100, // Adjusted for new footer height
      size: Math.random() * 4 + 2,
      speed: Math.random() * 1 + 0.5
    };
  }

  private animateSnow() {
    this.snowflakes.forEach(flake => {
      flake.y += flake.speed;
      if (flake.y > 100) { // Adjusted for new footer height
        Object.assign(flake, this.createSnowflake());
        flake.y = -10;
      }
    });

    this.animationFrameId = requestAnimationFrame(() => this.animateSnow());
  }

  private startMessageAnimation() {
    setInterval(() => {
      this.showMessage = true;
      this.messageStyle = {
        left: `${Math.random() * 60 + 20}%`,
        top: '50%' // Center vertically
      };

      setTimeout(() => {
        this.showMessage = false;
      }, 2000);
    }, 10000);
  }
}
