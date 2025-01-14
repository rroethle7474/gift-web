const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Define the static files directory - using absolute path for Azure Web Apps
const staticPath = process.env.WEBSITE_SITE_NAME ?
  '/home/site/wwwroot/dist/christmas-gift-app/browser' : // Azure path
  path.join(__dirname, 'dist/christmas-gift-app/browser'); // Local development path

// Serve static files
app.use(express.static(staticPath));

// Send all requests to index.html
app.get('/*', function(req, res) {
  res.sendFile(path.join(staticPath, 'index.html'));
});

// Start the app by listening on the default port
const server = app.listen(port, () => {
  console.log(`App listening on port ${port}`);
  console.log(`Serving static files from: ${staticPath}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
