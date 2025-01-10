import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

export enum ScreenSize {
  Mobile = 'mobile',    // < 640px
  Tablet = 'tablet',    // 640px - 1024px
  Desktop = 'desktop'   // > 1024px
}

@Injectable({
  providedIn: 'root'
})
export class BreakpointService {
  private screenSizeSubject = new BehaviorSubject<ScreenSize>(this.getCurrentScreenSize());
  screenSize$ = this.screenSizeSubject.asObservable().pipe(distinctUntilChanged());

  constructor() {
    fromEvent(window, 'resize')
      .subscribe(() => {
        this.screenSizeSubject.next(this.getCurrentScreenSize());
      });
  }

  private getCurrentScreenSize(): ScreenSize {
    const width = window.innerWidth;
    if (width < 640) return ScreenSize.Mobile;
    if (width < 1024) return ScreenSize.Tablet;
    return ScreenSize.Desktop;
  }

  get isMobile(): boolean {
    return window.innerWidth < 640;
  }

  get isTablet(): boolean {
    return window.innerWidth >= 640 && window.innerWidth < 1024;
  }

  get isDesktop(): boolean {
    return window.innerWidth >= 1024;
  }
}
