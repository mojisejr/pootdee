/**
 * Centralized Logging Utility for pootdee Application
 * 
 * Provides structured logging with three levels:
 * - INFO: General information messages (production + development)
 * - ERROR: Error messages (production + development)  
 * - DEBUG: Debug messages (development only)
 */

export type LogLevel = 'INFO' | 'ERROR' | 'DEBUG';

export interface LogContext {
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: Error;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  /**
   * Get current timestamp in ISO format
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Format log entry for console output
   */
  private formatLogEntry(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry;
    
    let formattedMessage = `[${timestamp}] ${level}: ${message}`;
    
    if (context) {
      const contextStr = Object.entries(context)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
        .join(' ');
      
      if (contextStr) {
        formattedMessage += ` | ${contextStr}`;
      }
    }
    
    if (error) {
      formattedMessage += ` | Error: ${error.message}`;
      if (this.isDevelopment && error.stack) {
        formattedMessage += `\nStack: ${error.stack}`;
      }
    }
    
    return formattedMessage;
  }

  /**
   * Log INFO level messages (production + development)
   */
  info(message: string, context?: LogContext): void {
    const entry: LogEntry = {
      level: 'INFO',
      message,
      timestamp: this.getTimestamp(),
      context
    };

    console.log(this.formatLogEntry(entry));
  }

  /**
   * Log ERROR level messages (production + development)
   */
  error(message: string, error?: Error, context?: LogContext): void {
    const entry: LogEntry = {
      level: 'ERROR',
      message,
      timestamp: this.getTimestamp(),
      context,
      error
    };

    console.error(this.formatLogEntry(entry));
  }

  /**
   * Log DEBUG level messages (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (!this.isDevelopment) {
      return; // Skip debug logs in production
    }

    const entry: LogEntry = {
      level: 'DEBUG',
      message,
      timestamp: this.getTimestamp(),
      context
    };

    console.debug(this.formatLogEntry(entry));
  }

  /**
   * Create a scoped logger with default context
   */
  createScopedLogger(defaultContext: LogContext): ScopedLogger {
    return new ScopedLogger(this, defaultContext);
  }
}

/**
 * Scoped logger that includes default context in all log entries
 */
class ScopedLogger {
  constructor(
    private logger: Logger,
    private defaultContext: LogContext
  ) {}

  private mergeContext(context?: LogContext): LogContext {
    return { ...this.defaultContext, ...context };
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(message, this.mergeContext(context));
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.logger.error(message, error, this.mergeContext(context));
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(message, this.mergeContext(context));
  }
}

// Export singleton logger instance
export const logger = new Logger();

// Export convenience functions for direct usage
export const logInfo = (message: string, context?: LogContext): void => {
  logger.info(message, context);
};

export const logError = (message: string, error?: Error, context?: LogContext): void => {
  logger.error(message, error, context);
};

export const logDebug = (message: string, context?: LogContext): void => {
  logger.debug(message, context);
};

// Export scoped logger creator
export const createLogger = (component: string, additionalContext?: Omit<LogContext, 'component'>): ScopedLogger => {
  return logger.createScopedLogger({
    component,
    ...additionalContext
  });
};