import { Injectable } from '@angular/core';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private appInsights: ApplicationInsights;

  constructor() {
    this.appInsights = new ApplicationInsights({
      config: {
        connectionString: environment.applicationInsights.connectionString,
        enableDebug: environment.applicationInsights.enableDebug
      }
    });
    this.appInsights.loadAppInsights();
  }

  logError(error: Error, properties?: { [key: string]: string }): void {
    this.appInsights.trackException({ exception: error, properties });
    if (!environment.production) {
      console.error(error);
    }
  }

  logEvent(name: string, properties?: { [key: string]: string }): void {
    this.appInsights.trackEvent({ name, properties });
  }
}
