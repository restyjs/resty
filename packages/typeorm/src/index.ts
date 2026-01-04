// TypeORM integration for Resty.js

// Export database provider
export { Database, DatabaseProvider } from "./connection";
export type { DataSource, DataSourceOptions } from "typeorm";

// Export decorators
export {
    InjectRepository,
    InjectDataSource,
    InjectManager,
} from "./decorators";
export type { Repository, EntityTarget } from "./decorators";

// Re-export common TypeORM types for convenience
export type {
    EntityManager,
    ObjectLiteral,
    FindOptionsWhere,
    FindManyOptions,
    FindOneOptions,
    DeepPartial,
    QueryRunner,
} from "typeorm";
