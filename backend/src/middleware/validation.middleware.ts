import { Request, Response, NextFunction } from 'express';
import { body, query, validationResult, ValidationChain } from 'express-validator';

// Validation middleware for history endpoint
export const validateHistoryQuery = [
  query('startTime')
    .optional()
    .isISO8601()
    .withMessage('startTime must be a valid ISO date string'),
  
  query('endTime')
    .optional()
    .isISO8601()
    .withMessage('endTime must be a valid ISO date string')
    .custom((endTime, { req }) => {
      const request = req as Request;
      const startTime = request.query.startTime as string | undefined;
      if (endTime && startTime) {
        return new Date(endTime) > new Date(startTime);
      }
      return true;
    })
    .withMessage('endTime must be after startTime'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('limit must be a number between 1 and 1000'),

  // Validation result handler
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  }
]; 