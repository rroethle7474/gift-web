import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Particle {
  x: number; // center
  y: number; // center
  vx: number;
  vy: number;
  hue: number;
  alpha: number;
}

@Component({
  selector: 'app-shipment-announcement',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative overflow-hidden h-64">
      <!-- Fireworks Canvas -->
      <canvas #fireworksCanvas
              class="absolute inset-0 w-full h-full pointer-events-none bg-gray-900"
              [style.opacity]="0.9">
      </canvas>

      <!-- Announcement Content -->
      <div class="relative z-10 py-16 text-center bg-gradient-to-r from-purple-600/60 to-pink-600/60 h-full flex items-center justify-center">
        <div class="max-w-3xl mx-auto px-4">
          <h2 class="text-3xl font-bold mb-4 animate-bounce text-white">
            🎉 Your Gifts Are Coming! 🎉
          </h2>
          <p class="text-xl text-white">
            Your gifts will be delivered to you on
            <span class="font-bold">
              {{ shipmentDate | date:'longDate' }}
            </span>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      margin-bottom: 2rem;
    }

    canvas {
      image-rendering: pixelated;
    }
  `]
})
export class ShipmentAnnouncementComponent implements AfterViewInit, OnDestroy {
  @Input() shipmentDate!: Date;
  @ViewChild('fireworksCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private fireworks: Array<{
    x: number;
    y: number;
    targetY: number;
    velocity: number;
    particles: Particle[];
    exploded: boolean;
    update: () => void;
    draw: (ctx: CanvasRenderingContext2D) => void;
    explode: () => void;
  }> = [];
  private ctx!: CanvasRenderingContext2D;
  private animationFrameId: number = 0;

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    this.animate();
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private animate() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    if (Math.random() < 0.1) {
      this.fireworks.push(this.createFirework());
    }

    this.fireworks.forEach((firework, index) => {
      firework.update();
      firework.draw(this.ctx);

      if (firework.particles.every((p: any) => p.alpha <= 0)) {
        this.fireworks.splice(index, 1);
      }
    });

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  private createFirework() {
    const x = Math.random() * this.ctx.canvas.width;
    const y = this.ctx.canvas.height;
    const targetY = Math.random() * (this.ctx.canvas.height * 0.5);

    return {
      x,
      y,
      targetY,
      velocity: -12,
      particles: [],
      exploded: false,

      update() {
        if (!this.exploded) {
          this.y += this.velocity;

          if (this.y <= targetY) {
            this.explode();
          }
        }

        this.particles.forEach((particle: Particle) => {
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.vy += 0.1;
          particle.alpha -= 0.01;
        });
      },

      draw(ctx: CanvasRenderingContext2D) {
        if (!this.exploded) {
          ctx.fillStyle = 'white';
          ctx.fillRect(this.x, this.y, 2, 2);
        }

        this.particles.forEach((particle: Particle) => {
          ctx.fillStyle = `hsla(${particle.hue}, 100%, 50%, ${particle.alpha})`;
          ctx.fillRect(particle.x, particle.y, 2, 2);
        });
      },

      explode() {
        this.exploded = true;
        const particleCount = 80;
        const hue = Math.random() * 360;

        for (let i = 0; i < particleCount; i++) {
          const angle = (Math.PI * 2 / particleCount) * i;
          const velocity = 4 + Math.random() * 4;

          (this.particles as Particle[]).push({
            x: this.x,
            y: this.y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            hue: hue + Math.random() * 30 - 15,
            alpha: 1
          });
        }
      }
    };
  }
}
