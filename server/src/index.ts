import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initDatabase } from './config/db';
import { setupDatabaseSchemaAndSeed } from './config/schema';
import apiRouter from './routes/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    platform: 'Finova Finance API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount API routes
app.use('/api', apiRouter);

// 404 handler for API routes
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API route ${req.method} ${req.baseUrl} not found.`
  });
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Application Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Something went wrong. Please try again.'
  });
});

// Initialize Database & Start Server
async function startServer() {
  try {
    console.log('Initializing SQLite database engine...');
    await initDatabase();
    console.log('Setting up database schema and seed data...');
    await setupDatabaseSchemaAndSeed();
    console.log('Database initialized successfully.');

    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` Finova Finance Backend REST API Running!`);
      console.log(` Port: ${PORT}`);
      console.log(` Base URL: http://localhost:${PORT}/api`);
      console.log(` Health:   http://localhost:${PORT}/api/health`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
}

startServer();
