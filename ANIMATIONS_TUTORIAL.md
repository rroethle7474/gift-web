# Angular Animation Tutorial

This tutorial covers the implementation of animations in our Christmas Gift Registry application, including both modal animations and interactive element animations (dancing monkeys).

## Table of Contents
1. [Modal Animations](#modal-animations)
2. [Interactive Element Animations](#interactive-element-animations)
3. [Best Practices](#best-practices)

## Modal Animations

### Setting Up Angular Animations
First, ensure animations are enabled in your `app.config.ts`:
```typescript
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
    provideAnimations(),
  ]
};
```

### Creating an Animated Modal Component
1. **Basic Structure**
```typescript
@Component({
  selector: 'app-modal',
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
```

2. **Auto-Dismiss Logic**
```typescript
export class ModalComponent implements OnInit {
  @Input() name: string = '';
  @Input() onClose: () => void = () => {};
  isVisible = true;

  ngOnInit() {
    setTimeout(() => {
      this.isVisible = false;
      setTimeout(() => {
        this.onClose();
      }, 300); // Match animation duration
    }, 3000); // Display duration
  }
}
```

3. **Template Structure**
```html
<div class="fixed inset-0 flex items-center justify-center z-50"
     *ngIf="isVisible"
     [@fadeInOut]>
  <div class="bg-black bg-opacity-50 absolute inset-0"></div>
  <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
    <!-- Modal content -->
  </div>
</div>
```

### Implementing Time-Based Messages
```typescript
private getTimeBasedMessage(): string {
  const hour = new Date().getHours();
  
  if (hour >= 16 || hour < 3) {
    return "Have a good night";
  } else if (hour >= 3 && hour < 12) {
    return "Have a good morning";
  } else {
    return "Have a good afternoon";
  }
}
```

## Interactive Element Animations

### Setting Up Dancing Monkeys
1. **Component Properties**
```typescript
export class HeroSectionComponent implements AfterViewInit {
  @ViewChildren('monkey') monkeys!: QueryList<ElementRef>;
  private animationIntervals: number[] = [];
  private monkeyPaths: Map<HTMLElement, { start: Point, control1: Point, control2: Point, end: Point }>;
  private monkeyCollisions: Set<HTMLElement>;
}
```

2. **Animation Path Generation**
```typescript
private initializeMonkeyPath(monkeyElement: HTMLElement, invertDirection: boolean = false) {
  const start = this.getRandomPosition();
  const end = this.getRandomPosition();
  
  // Create Bezier curve control points
  const control1 = {
    x: start.x + (Math.random() - 0.5) * window.innerWidth * 0.8,
    y: start.y + (Math.random() - 0.5) * window.innerHeight * 0.8
  };
  const control2 = {
    x: end.x + (Math.random() - 0.5) * window.innerWidth * 0.8,
    y: end.y + (Math.random() - 0.5) * window.innerHeight * 0.8
  };

  this.monkeyPaths.set(monkeyElement, { start, control1, control2, end });
}
```

3. **Animation Loop**
```typescript
private animateAlongPath(monkeyElement: HTMLElement) {
  const duration = 3000;
  const startTime = performance.now();

  const animate = (currentTime: number) => {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    
    if (progress < 1) {
      const position = this.getBezierPoint(/* ... */);
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
```

### Collision Detection
1. **Setting Up Collision Detection**
```typescript
private startCollisionDetection() {
  setInterval(() => {
    const monkeyElements = Array.from(this.monkeys).map(m => m.nativeElement);
    
    for (let i = 0; i < monkeyElements.length; i++) {
      for (let j = i + 1; j < monkeyElements.length; j++) {
        if (this.areRectanglesOverlapping(
          monkeyElements[i].getBoundingClientRect(),
          monkeyElements[j].getBoundingClientRect()
        )) {
          this.handleCollision(monkeyElements[i], monkeyElements[j]);
        }
      }
    }
  }, 100);
}
```

2. **Handling Collisions**
```typescript
private handleCollision(monkey1: HTMLElement, monkey2: HTMLElement) {
  // Add collision animation classes
  monkey1.classList.add('collision');
  monkey2.classList.add('collision');

  // Create bounce effect
  this.initializeMonkeyPath(monkey1, true);
  this.initializeMonkeyPath(monkey2, true);

  // Reset after animation
  setTimeout(() => {
    monkey1.classList.remove('collision');
    monkey2.classList.remove('collision');
    this.animateAlongPath(monkey1);
    this.animateAlongPath(monkey2);
  }, 500);
}
```

## Best Practices

1. **Performance Optimization**
   - Use `requestAnimationFrame` for smooth animations
   - Implement cleanup in `ngOnDestroy`
   - Use CSS transforms instead of position properties when possible
   - Batch DOM updates

2. **Memory Management**
```typescript
ngOnDestroy() {
  this.animationIntervals.forEach(interval => clearTimeout(interval));
  if (this.respawnTimeout) {
    clearInterval(this.respawnTimeout);
  }
}
```

3. **Responsive Design**
   - Use viewport-relative measurements
   - Implement boundary checks
   - Handle window resize events

4. **Code Organization**
   - Separate animation logic into dedicated methods
   - Use interfaces for type safety
   - Implement proper cleanup
   - Use constants for configuration values

## Usage Examples

### Welcome Modal
```typescript
// In your component
this.router.navigate(['/wish-list'], {
  state: { showWelcomeModal: true, fromLogin: true }
});

// In target component
constructor(private router: Router) {
  const navigation = this.router.getCurrentNavigation();
  const state = navigation?.extras.state as { showWelcomeModal: boolean };
  
  if (state?.showWelcomeModal) {
    this.showWelcomeModal = true;
  }
}
```

### Goodbye Modal
```typescript
// In auth service
logout(): void {
  const currentUser = this.getCurrentUser();
  
  // Clear auth data
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Show goodbye modal
  this.router.navigate(['/'], {
    state: { showGoodbyeModal: true, userName: currentUser?.name }
  });
}
```

Remember to:
- Always clean up animations when components are destroyed
- Handle edge cases and errors gracefully
- Test animations on different devices and screen sizes
- Consider accessibility implications
- Use appropriate timing for different types of animations
  </rewritten_file> 
