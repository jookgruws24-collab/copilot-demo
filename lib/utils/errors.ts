/**
 * Custom error classes for the application
 */

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details?: { field: string; message: string }[]) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class InsufficientBalanceError extends AppError {
  constructor() {
    super('Insufficient diamond balance', 400, 'INSUFFICIENT_BALANCE');
    this.name = 'InsufficientBalanceError';
  }
}

export class OutOfStockError extends AppError {
  constructor() {
    super('Product is out of stock', 400, 'OUT_OF_STOCK');
    this.name = 'OutOfStockError';
  }
}

/**
 * Format error for API response
 */
export function formatErrorResponse(error: unknown): {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
} {
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      details: error instanceof ValidationError ? error.details : undefined,
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: false,
    error: 'An unknown error occurred',
  };
}

/**
 * Safe error handling for API routes
 */
export function handleApiError(error: unknown): Response {
  console.error('API Error:', error);

  if (error instanceof AppError) {
    return Response.json(formatErrorResponse(error), {
      status: error.statusCode,
    });
  }

  return Response.json(formatErrorResponse(error), { status: 500 });
}
