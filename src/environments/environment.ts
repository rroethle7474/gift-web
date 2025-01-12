// Base environment template
export const environment = {
  production: false,
  environment: 'local',
  apiUrl: 'https://localhost:7205/api',
  version: '1.0.0',
  applicationInsights: {
    connectionString: '',
    enableDebug: true
  },
  caching: {
    defaultDuration: 24 * 60 * 60 * 1000,
  },
  features: {
    enableRecommendations: true,
    enableNotifications: true
  }
};
