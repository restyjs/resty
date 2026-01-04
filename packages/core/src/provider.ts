/**
 * Provider interface for framework extensions
 * Providers are initialized before the application starts
 *
 * @example
 * ```typescript
 * class DatabaseProvider implements Provider {
 *   optional = false;
 *
 *   async build() {
 *     await connectToDatabase();
 *   }
 * }
 * ```
 */
export interface Provider {
  /** If true, errors during build() won't crash the application */
  optional: boolean;

  /** Initialize the provider. Called during application startup */
  build(): void | Promise<void>;
}
