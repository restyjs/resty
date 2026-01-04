import type { DataSourceOptions } from "typeorm";
import { DataSource } from "typeorm";

import type { Provider } from "@restyjs/core";
import { Service, Container } from "typedi";

/**
 * Database provider for TypeORM integration
 *
 * @example
 * ```typescript
 * import { Database } from "@restyjs/typeorm";
 *
 * const app = resty({
 *   providers: [
 *     Database({
 *       type: "postgres",
 *       host: "localhost",
 *       database: "mydb",
 *       entities: [User, Post],
 *       synchronize: process.env.NODE_ENV !== "production"
 *     })
 *   ]
 * });
 * ```
 */
@Service()
export class DatabaseProvider implements Provider {
  public readonly optional: boolean;
  private readonly options: DataSourceOptions;
  private dataSource: DataSource | null = null;

  constructor(options: DataSourceOptions, optional?: boolean) {
    this.optional = optional ?? false;
    this.options = options;
  }

  async build(): Promise<void> {
    this.dataSource = new DataSource(this.options);
    await this.dataSource.initialize();

    // Store in DI container
    Container.set(DataSource, this.dataSource);
    Container.set("resty:datasource", this.dataSource);
  }

  /**
   * Get the DataSource instance
   */
  getDataSource(): DataSource {
    if (!this.dataSource) {
      throw new Error("[resty/typeorm] DataSource not initialized. Did you forget to add Database to providers?");
    }
    return this.dataSource;
  }

  /**
   * Close the database connection
   */
  async destroy(): Promise<void> {
    if (this.dataSource?.isInitialized) {
      await this.dataSource.destroy();
    }
  }
}

/**
 * Create a database provider
 *
 * @example
 * ```typescript
 * const app = resty({
 *   providers: [
 *     Database({
 *       type: "sqlite",
 *       database: "app.db",
 *       entities: [User],
 *       synchronize: true
 *     })
 *   ]
 * });
 * ```
 */
export function Database(options: DataSourceOptions, optional?: boolean): DatabaseProvider {
  const provider = new DatabaseProvider(options, optional);
  Container.set(DatabaseProvider, provider);
  return provider;
}

export { DataSource };
export type { DataSourceOptions };
