import {
  Connection,
  useContainer,
  createConnection,
  ConnectionOptions,
  getConnection,
} from "typeorm";

import { Provider, Service, Container } from "@restyjs/core";

@Service()
export class DatabaseProvider implements Provider {
  optional: boolean;
  private readonly options: ConnectionOptions;

  constructor(options: ConnectionOptions, optional?: boolean) {
    this.optional = optional ?? false;
    this.options = options;

    // TypeORM to use TypeDI Container
    useContainer(Container);
  }

  async build(): Promise<Connection> {
    return this.connect(this.options);
  }

  connection(connectionName?: string): Connection {
    return getConnection(connectionName);
  }

  /**
   * Creates a new database connection.
   */
  async connect(options: ConnectionOptions): Promise<Connection> {
    return createConnection(options);
  }
}

export function Database(options: ConnectionOptions, optional?: boolean) {
  return new DatabaseProvider(options, optional);
}
