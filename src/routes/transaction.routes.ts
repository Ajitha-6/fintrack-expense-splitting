import { Router, Request, Response, NextFunction } from 'express';
import { TransactionController } from '../controllers/TransactionController';
import { errorHandler } from '../services/error.service';

const router = Router();
const controller = new TransactionController();

// Middleware to extract user from token (simplified)
const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // In production, verify JWT token
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }
  (req as any).userId = userId;
  next();
};

router.use(authMiddleware);

// Transaction routes
router.post('/transactions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await controller.createTransaction(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/transactions/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await controller.getTransaction(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/transactions/user/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await controller.getUserTransactions(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete('/transactions/user/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await controller.deleteUserTransactions(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/balance', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await controller.getUserBalance(req, res);
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

export default router;
