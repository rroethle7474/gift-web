export const environment = {
  production: false,
  environment: 'development',
  apiUrl: '#{DEV_API_URL}#',
  version: '#{BUILD_VERSION}#',
  applicationInsights: {
    connectionString: '#{DEV_APPINSIGHTS_CONNECTION_STRING}#',
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
