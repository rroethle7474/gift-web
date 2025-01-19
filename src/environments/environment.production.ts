export const environment = {
  production: true,
  environment: 'production',
  apiUrl: '#{PROD_API_URL}#',
  version: '#{BUILD_VERSION}#',
  demoMode: '#{PROD_DEMO_MODE}#'.toLowerCase() === 'true' || false,
  initialSetup: '#{PROD_INITIAL_SETUP}#'.toLowerCase() === 'true' || false,
  applicationInsights: {
    connectionString: '#{PROD_APPINSIGHTS_CONNECTION_STRING}#',
    enableDebug: false
  }
};
