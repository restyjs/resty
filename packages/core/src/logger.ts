
/**
 * Log levels
 */
export enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error",
}

/**
 * Logger interface
 */
export interface ILogger {
    debug(message: string, ...args: unknown[]): void;
    info(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    error(message: string, ...args: unknown[]): void;
}

/**
 * Logger implementation
 */
export class Logger implements ILogger {
    constructor(public readonly debugMode: boolean = false) { }

    debug(message: string, ...args: unknown[]): void {
        if (this.debugMode) {
            console.debug(this.format("DEBUG", message), ...args);
        }
    }

    info(message: string, ...args: unknown[]): void {
        console.info(this.format("INFO", message), ...args);
    }

    warn(message: string, ...args: unknown[]): void {
        console.warn(this.format("WARN", message), ...args);
    }

    error(message: string, ...args: unknown[]): void {
        console.error(this.format("ERROR", message), ...args);
    }

    private format(level: string, message: string): string {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level}] [resty] ${message}`;
    }
}

/**
 * Default logger instance
 */
export const logger = new Logger(process.env.RESTY_DEBUG === "true");

/**
 * Context logger for request-scoped logs
 */
export class ContextLogger implements ILogger {
    constructor(private readonly requestId: string, private readonly baseLogger: ILogger = logger) { }

    debug(message: string, ...args: unknown[]): void {
        this.baseLogger.debug(this.enrich(message), ...args);
    }

    info(message: string, ...args: unknown[]): void {
        this.baseLogger.info(this.enrich(message), ...args);
    }

    warn(message: string, ...args: unknown[]): void {
        this.baseLogger.warn(this.enrich(message), ...args);
    }

    error(message: string, ...args: unknown[]): void {
        this.baseLogger.error(this.enrich(message), ...args);
    }

    private enrich(message: string): string {
        return `[${this.requestId}] ${message}`;
    }
}
