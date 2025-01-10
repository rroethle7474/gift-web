import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => {
    if (!environment.production) {
      console.error('Application failed to start:', err);
    }
    // In production, you might want to:
    // 1. Log to a proper error tracking service
    // 2. Show a user-friendly error page
    document.body.innerHTML = '<div style="padding: 20px;">Sorry, the application failed to load. Please try refreshing the page.</div>';
  });
