import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import AppDataSource from './config/database';
import { logger, loggerMiddleware } from './services/logger.service';
import transactionRoutes from './routes/transaction.routes';
import expenseRoutes from './routes/expense.routes';
import { errorHandler } from './services/error.service';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

// Health check endpoint
app.get('/health', (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'FinTrack API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', transactionRoutes);
app.use('/api', expenseRoutes);

// 404 handler
app.use((req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    },
  });
});

// Error handler
app.use(errorHandler);

// Initialize database and start server
const startServer = async (): Promise<void> => {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    logger.info('Database connection established');

    // Start server
    app.listen(PORT, (): void => {
      logger.info(`FinTrack API server listening on port ${PORT}`);
      console.log(`✓ Server running at http://localhost:${PORT}`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error: (error as Error).message });
    process.exit(1);
  }
};

startServer();

export default app;
