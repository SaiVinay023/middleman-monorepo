/**
 * Error Tracking & Logging Utility
 * Provides centralized error logging with context for debugging
 * Can be integrated with services like Sentry, LogRocket, or DataDog
 */

export interface ErrorContext {
  userId?: string;
  action?: string;
  component?: string;
  metadata?: Record<string, any>;
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface LoggedError {
  message: string;
  stack?: string | undefined; 
  severity: ErrorSeverity;
  context?: ErrorContext | undefined;
  timestamp: string;
  environment: string;
}

class ErrorTracker {
  private errors: LoggedError[] = [];
  private maxStoredErrors = 100;

  /**
   * Log an error with context
   */
  logError(
    error: Error | string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: ErrorContext
  ): void {
    const loggedError: LoggedError = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'string' ? undefined : error.stack,
      severity,
      context,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };

    // Store in memory (limited)
    this.errors.push(loggedError);
    if (this.errors.length > this.maxStoredErrors) {
      this.errors.shift();
    }

    // Console logging with severity colors
    this.consoleLog(loggedError);

    // Send to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(loggedError);
    }
  }

  /**
   * Console log with color coding
   */
  private consoleLog(error: LoggedError): void {
    const styles = {
      [ErrorSeverity.LOW]: 'color: #6B7280',
      [ErrorSeverity.MEDIUM]: 'color: #F59E0B',
      [ErrorSeverity.HIGH]: 'color: #EF4444',
      [ErrorSeverity.CRITICAL]: 'color: #DC2626; font-weight: bold',
    };

    console.group(`%c[${error.severity.toUpperCase()}] ${error.message}`, styles[error.severity]);
    console.log('Timestamp:', error.timestamp);
    if (error.context) {
      console.log('Context:', error.context);
    }
    if (error.stack) {
      console.log('Stack:', error.stack);
    }
    console.groupEnd();
  }

  /**
   * Send to external monitoring service
   * Integrate with Sentry, LogRocket, DataDog, etc.
   */
  private sendToExternalService(error: LoggedError): void {
    // Example: Sentry integration
    // if (window.Sentry) {
    //   window.Sentry.captureException(new Error(error.message), {
    //     level: error.severity,
    //     contexts: { custom: error.context },
    //   });
    // }

    // For now, just track it would be sent
    if (typeof window !== 'undefined') {
      console.warn('[ErrorTracker] Would send to external service in production:', error.message);
    }
  }

  /**
   * Get all stored errors
   */
  getErrors(): LoggedError[] {
    return [...this.errors];
  }

  /**
   * Clear stored errors
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ErrorSeverity): LoggedError[] {
    return this.errors.filter((e) => e.severity === severity);
  }
}

// Singleton instance
const errorTracker = new ErrorTracker();

/**
 * Helper function for logging errors
 */
export const logError = (
  error: Error | string,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  context?: ErrorContext
): void => {
  errorTracker.logError(error, severity, context);
};

/**
 * Helper for authentication errors
 */
export const logAuthError = (error: Error | string, action: string, email?: string): void => {
  const emailHash = email ? 
    `hash_${email.split('@')[1]}` :  // Only log domain, not user
    undefined;
    
  logError(error, ErrorSeverity.HIGH, {
    action,
    component: 'Authentication',
    metadata: { emailDomain: emailHash },
  });
};


/**
 * Helper for data fetching errors
 */
export const logDataError = (error: Error | string, endpoint: string): void => {
  logError(error, ErrorSeverity.MEDIUM, {
    action: 'data_fetch',
    metadata: { endpoint },
  });
};

/**
 * Helper for critical system errors
 */
export const logCriticalError = (error: Error | string, context?: ErrorContext): void => {
  logError(error, ErrorSeverity.CRITICAL, context);
};

export { errorTracker, ErrorTracker };
