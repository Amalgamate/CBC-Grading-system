import 'dotenv/config';
import app from './server';
import prisma from './config/database';
import http from 'http';
import { initializeSocket } from './services/socket.service';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Create HTTP server
    const httpServer = http.createServer(app);

    // Initialize Socket.io
    const io = initializeSocket(httpServer);

    // Store io instance in app for access in controllers (optional, but good practice)
    app.set('io', io);

    // Start server
    httpServer.listen(PORT, () => {
      console.log('🚀 Server started successfully!');
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API: http://localhost:${PORT}/api`);
      console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
      console.log('');
      console.log('Available endpoints:');
      console.log('  GET  /api/health');
      console.log('  POST /api/auth/register');
      console.log('  POST /api/auth/login');
      console.log('  POST /api/auth/send-whatsapp-verification');
      if (process.env.NODE_ENV === 'development') {
        console.log('  GET  /api/auth/seeded-users (dev only)');
      }
      console.log('  GET  /api/auth/me (protected)');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
