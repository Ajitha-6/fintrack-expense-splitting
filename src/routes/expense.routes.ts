import { Router, Request, Response, NextFunction } from 'express';
import { ExpenseController } from '../controllers/ExpenseController';
import { errorHandler } from '../services/error.service';

const router = Router();
const controller = new ExpenseController();

// Middleware to extract user from token (simplified)
const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }
  (req as any).userId = userId;
  next();
};

router.use(authMiddleware);

// Expense routes
router.post('/expenses', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await controller.createExpense(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/expenses/participants', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await controller.addParticipant(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/expenses/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await controller.getExpense(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/expenses/user/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await controller.getUserExpenses(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/balances/calculate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await controller.calculateBalances(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/expenses/settle', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await controller.settleExpense(req, res);
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

export default router;
