export const environment = {
  production: false,
  environment: 'test',
  apiUrl: '#{TEST_API_URL}#',
  version: '#{BUILD_VERSION}#',
  demoMode: '#{TEST_DEMO_MODE}#'.toLowerCase() === 'true' || false,
  applicationInsights: {
    connectionString: '#{TEST_APPINSIGHTS_CONNECTION_STRING}#',
    enableDebug: true
  }
};
