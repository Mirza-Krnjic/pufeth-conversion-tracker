import { Request, Response, NextFunction } from 'express';

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Error handler middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack
  });

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      details: err.details
    });
  }

  // Handle unexpected errors
  return res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
};

// Not found handler
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
}; 