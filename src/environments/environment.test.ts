export const environment = {
  production: false,
  environment: 'test',
  apiUrl: '#{TEST_API_URL}#',
  version: '#{BUILD_VERSION}#',
  applicationInsights: {
    connectionString: '#{TEST_APPINSIGHTS_CONNECTION_STRING}#',
    enableDebug: true
  }
};
