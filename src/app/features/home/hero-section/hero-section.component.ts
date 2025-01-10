import { Component, OnInit, AfterViewInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { GoodbyeModalComponent } from '../../../shared/modals/goodbye-modal/goodbye-modal.component';

interface Point {
    x: number;
    y: number;
}

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, RouterModule, GoodbyeModalComponent],
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss']
})
export class HeroSectionComponent implements AfterViewInit {
    @ViewChildren('monkey') monkeys!: QueryList<ElementRef>;
    private animationIntervals: number[] = [];
    private readonly HEADER_HEIGHT = 80;
    private readonly FOOTER_HEIGHT = 60;
    private readonly RESPAWN_INTERVAL = 60000; // 60 seconds
    private monkeyPaths: Map<HTMLElement, { start: Point, control1: Point, control2: Point, end: Point }> = new Map();
    private monkeyCollisions: Set<HTMLElement> = new Set();
    private respawnTimeout: any;

    // Goodbye modal properties
    showGoodbyeModal = false;
    userName = '';

    constructor(
        public authService: AuthService,
        private elementRef: ElementRef,
        private router: Router
    ) {
        // Check if we should show the goodbye modal
        const navigation = this.router.getCurrentNavigation();
        const state = navigation?.extras.state as { showGoodbyeModal: boolean, userName: string };

        if (state?.showGoodbyeModal) {
            this.showGoodbyeModal = true;
            this.userName = state.userName || '';
        }
    }

    ngAfterViewInit() {
        setTimeout(() => this.startAnimation(), 100);
        this.setupPeriodicRespawn();
    }

    ngOnDestroy() {
        this.animationIntervals.forEach(interval => clearTimeout(interval));
        if (this.respawnTimeout) {
            clearInterval(this.respawnTimeout);
        }
    }

    onCloseGoodbyeModal(): void {
        this.showGoodbyeModal = false;
    }

    private setupPeriodicRespawn() {
        this.respawnTimeout = setInterval(() => {
            this.respawnAllMonkeys();
        }, this.RESPAWN_INTERVAL);
    }

    private respawnAllMonkeys() {
        // Clear any ongoing collisions
        this.monkeyCollisions.clear();

        // Remove collision classes
        this.monkeys.forEach(monkey => {
            monkey.nativeElement.classList.remove('collision');
        });

        // Fade out monkeys
        this.monkeys.forEach(monkey => {
            monkey.nativeElement.style.opacity = '0';
        });

        // After fade out, respawn in new positions
        setTimeout(() => {
            this.monkeys.forEach(monkey => {
                // Clear existing path
                this.monkeyPaths.delete(monkey.nativeElement);

                // Initialize new random path
                this.initializeMonkeyPath(monkey.nativeElement);

                // Fade back in
                monkey.nativeElement.style.opacity = '0.6';

                // Start new animation
                this.animateAlongPath(monkey.nativeElement);
            });
        }, 300); // Wait for fade out
    }

    private startAnimation() {
        this.monkeys.forEach((monkey, index) => {
            this.initializeMonkeyPath(monkey.nativeElement);
            setTimeout(() => {
                this.animateAlongPath(monkey.nativeElement);
            }, index * 1000);
        });

        // this.startCollisionDetection();
    }

    private initializeMonkeyPath(monkeyElement: HTMLElement, invertDirection: boolean = false) {
        const currentPath = this.monkeyPaths.get(monkeyElement);
        const start = currentPath ? currentPath.end : this.getRandomPosition();
        let end = this.getRandomPosition();

        if (invertDirection && currentPath) {
            // Create a bounce effect by inverting the direction
            end = {
                x: start.x + (start.x - currentPath.end.x),
                y: start.y + (start.y - currentPath.end.y)
            };

            // Keep within bounds
            end.x = Math.max(0, Math.min(end.x, window.innerWidth - 100));
            end.y = Math.max(this.HEADER_HEIGHT, Math.min(end.y, window.innerHeight - this.FOOTER_HEIGHT - 100));
        }

        // Create control points for the Bezier curve
        const control1 = {
            x: start.x + (Math.random() - 0.5) * window.innerWidth * 0.8,
            y: start.y + (Math.random() - 0.5) * window.innerHeight * 0.8
        };
        const control2 = {
            x: end.x + (Math.random() - 0.5) * window.innerWidth * 0.8,
            y: end.y + (Math.random() - 0.5) * window.innerHeight * 0.8
        };

        this.monkeyPaths.set(monkeyElement, { start, control1, control2, end });

        if (!currentPath) {
            monkeyElement.style.left = `${start.x}px`;
            monkeyElement.style.top = `${start.y}px`;
        }
    }

    private getRandomPosition(): Point {
        const viewportHeight = window.innerHeight;
        const availableTop = this.HEADER_HEIGHT;
        const availableBottom = viewportHeight - this.FOOTER_HEIGHT;
        const availableHeight = availableBottom - availableTop;
        const monkeyWidth = 100;
        const monkeyHeight = 100;

        return {
            x: Math.random() * (window.innerWidth - monkeyWidth),
            y: availableTop + (Math.random() * availableHeight)
        };
    }

    private animateAlongPath(monkeyElement: HTMLElement) {
        if (this.monkeyCollisions.has(monkeyElement)) return;

        const currentPath = this.monkeyPaths.get(monkeyElement);
        if (!currentPath) return;

        const duration = 2000;
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            if (this.monkeyCollisions.has(monkeyElement)) return;

            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            if (progress < 1) {
                const position = this.getBezierPoint(
                    progress,
                    currentPath.start,
                    currentPath.control1,
                    currentPath.control2,
                    currentPath.end
                );

                monkeyElement.style.left = `${position.x}px`;
                monkeyElement.style.top = `${position.y}px`;

                requestAnimationFrame(animate);
            } else {
                this.initializeMonkeyPath(monkeyElement);
                setTimeout(() => this.animateAlongPath(monkeyElement),
                    Math.random() * 1000 + 1000);
            }
        };

        requestAnimationFrame(animate);
    }

    private getBezierPoint(t: number, start: Point, control1: Point, control2: Point, end: Point): Point {
        const x = Math.pow(1 - t, 3) * start.x +
                 3 * Math.pow(1 - t, 2) * t * control1.x +
                 3 * (1 - t) * Math.pow(t, 2) * control2.x +
                 Math.pow(t, 3) * end.x;

        const y = Math.pow(1 - t, 3) * start.y +
                 3 * Math.pow(1 - t, 2) * t * control1.y +
                 3 * (1 - t) * Math.pow(t, 2) * control2.y +
                 Math.pow(t, 3) * end.y;

        return { x, y };
    }

    private startCollisionDetection() {
        const checkCollision = () => {
            const monkeyElements = Array.from(this.monkeys).map(m => m.nativeElement);
            const collisions = new Set<HTMLElement>();

            for (let i = 0; i < monkeyElements.length; i++) {
                for (let j = i + 1; j < monkeyElements.length; j++) {
                    if (this.areRectanglesOverlapping(
                        monkeyElements[i].getBoundingClientRect(),
                        monkeyElements[j].getBoundingClientRect()
                    )) {
                        this.handleCollision(monkeyElements[i], monkeyElements[j]);
                        collisions.add(monkeyElements[i]);
                        collisions.add(monkeyElements[j]);
                    }
                }
            }
        };

        setInterval(checkCollision, 100);
    }

    private handleCollision(monkey1: HTMLElement, monkey2: HTMLElement) {
        if (this.monkeyCollisions.has(monkey1) || this.monkeyCollisions.has(monkey2)) return;

        this.monkeyCollisions.add(monkey1);
        this.monkeyCollisions.add(monkey2);

        // Add spin animation
        monkey1.classList.add('collision');
        monkey2.classList.add('collision');

        // Create bounce effect
        this.initializeMonkeyPath(monkey1, true);
        this.initializeMonkeyPath(monkey2, true);

        // Reset after animation
        setTimeout(() => {
            monkey1.classList.remove('collision');
            monkey2.classList.remove('collision');
            this.monkeyCollisions.delete(monkey1);
            this.monkeyCollisions.delete(monkey2);
            this.animateAlongPath(monkey1);
            this.animateAlongPath(monkey2);
        }, 500);
    }

    private areRectanglesOverlapping(rect1: DOMRect, rect2: DOMRect): boolean {
        return !(rect1.right < rect2.left ||
                rect1.left > rect2.right ||
                rect1.bottom < rect2.top ||
                rect1.top > rect2.bottom);
    }
}

