import app from './app';
import { config } from './config';

const PORT = typeof config.port === 'string' ? parseInt(config.port, 10) : config.port;

const server = app.listen(PORT, () => {
  console.log(`\n✅ PayPal Webhook Server running on port ${PORT}`);
  console.log(`📍 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Webhook endpoint: ${config.webhook.path}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health\n`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export { server };
