export const environment = {
  production: true,
  environment: 'production',
  apiUrl: '#{PROD_API_URL}#',
  version: '#{BUILD_VERSION}#',
  applicationInsights: {
    connectionString: '#{PROD_APPINSIGHTS_CONNECTION_STRING}#',
    enableDebug: false
  }
};
