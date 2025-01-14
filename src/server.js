const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist/christmas-gift-app/browser')));

// Send all requests to index.html
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'dist/christmas-gift-app/browser/index.html'));
});

// Start the app by listening on the default port
const server = app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
