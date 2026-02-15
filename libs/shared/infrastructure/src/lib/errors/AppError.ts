/**
 * Application Error with use case name for debugging
 * 
 * All errors from use cases should be wrapped in AppError
 * to provide context about where the error occurred
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly useCaseName: string,
    public readonly code: string = 'UNKNOWN_ERROR',
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'AppError';
    
    // Maintains proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Format error message with use case name
   */
  toString(): string {
    return `[${this.useCaseName}] ${this.code}: ${this.message}`;
  }
}
