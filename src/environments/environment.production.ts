export const environment = {
  production: true,
  environment: 'production',
  apiUrl: '#{PROD_API_URL}#',
  version: '#{BUILD_VERSION}#',
  applicationInsights: {
    connectionString: '#{PROD_APPINSIGHTS_CONNECTION_STRING}#',
    enableDebug: false
  },
  caching: {
    defaultDuration: 24 * 60 * 60 * 1000,
  },
  features: {
    enableRecommendations: true,
    enableNotifications: true
  }
};
