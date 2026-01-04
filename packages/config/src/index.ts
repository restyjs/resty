import dotenv, { DotenvConfigOptions, DotenvConfigOutput } from "dotenv";
import type { Provider } from "@restyjs/core";

/**
 * Configuration provider options
 */
export interface ConfigProviderOptions extends DotenvConfigOptions {
  /** If true, errors won't crash the application */
  optional?: boolean;
}

/**
 * Configuration provider for loading environment variables
 */
class ConfigurationProvider implements Provider {
  public readonly optional: boolean;
  private readonly result: DotenvConfigOutput;

  constructor(options: ConfigProviderOptions = {}) {
    this.optional = options.optional ?? false;
    this.result = dotenv.config(options);
  }

  build(): void {
    if (this.result.error && !this.optional) {
      throw this.result.error;
    }
  }
}

/**
 * Get an environment variable with optional default value
 *
 * @example
 * ```typescript
 * const port = env("PORT", "3000");
 * const dbUrl = env("DATABASE_URL"); // throws if not set
 * ```
 */
export function env(key: string, defaultValue?: string): string {
  const value = process.env[key];

  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`[resty/config] Missing required environment variable: ${key}`);
  }

  return value;
}

/**
 * Get an environment variable as a number
 */
export function envNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];

  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`[resty/config] Missing required environment variable: ${key}`);
  }

  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`[resty/config] Environment variable ${key} is not a valid number`);
  }

  return num;
}

/**
 * Get an environment variable as a boolean
 */
export function envBoolean(key: string, defaultValue?: boolean): boolean {
  const value = process.env[key];

  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`[resty/config] Missing required environment variable: ${key}`);
  }

  return ["true", "1", "yes"].includes(value.toLowerCase());
}

/**
 * Create a configuration provider
 *
 * @example
 * ```typescript
 * import { Configuration, env } from "@restyjs/config";
 *
 * const app = resty({
 *   providers: [
 *     Configuration({ path: ".env.local" })
 *   ]
 * });
 *
 * // Later in your code
 * const dbUrl = env("DATABASE_URL");
 * ```
 */
export function Configuration(options?: ConfigProviderOptions): ConfigurationProvider {
  return new ConfigurationProvider(options);
}

export type { DotenvConfigOptions, DotenvConfigOutput };
