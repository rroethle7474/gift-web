// Base environment template
export const environment = {
  production: false,
  environment: 'local',
  apiUrl: 'https://localhost:7205/api',
  version: '1.0.0',
  demoMode: false,
  initialSetup: false,
  applicationInsights: {
    connectionString: '',
    enableDebug: true
  }
};
