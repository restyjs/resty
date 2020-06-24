import {
  InjectConnection,
  InjectManager,
  InjectRepository,
} from "typeorm-typedi-extensions";

import { MysqlConnectionOptions } from "typeorm/driver/mysql/MysqlConnectionOptions";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import { CockroachConnectionOptions } from "typeorm/driver/cockroachdb/CockroachConnectionOptions";
import { SqliteConnectionOptions } from "typeorm/driver/sqlite/SqliteConnectionOptions";
import { SqlServerConnectionOptions } from "typeorm/driver/sqlserver/SqlServerConnectionOptions";
import { SapConnectionOptions } from "typeorm/driver/sap/SapConnectionOptions";
import { OracleConnectionOptions } from "typeorm/driver/oracle/OracleConnectionOptions";
import { CordovaConnectionOptions } from "typeorm/driver/cordova/CordovaConnectionOptions";
import { NativescriptConnectionOptions } from "typeorm/driver/nativescript/NativescriptConnectionOptions";
import { ReactNativeConnectionOptions } from "typeorm/driver/react-native/ReactNativeConnectionOptions";
import { SqljsConnectionOptions } from "typeorm/driver/sqljs/SqljsConnectionOptions";
import { MongoConnectionOptions } from "typeorm/driver/mongodb/MongoConnectionOptions";
import { AuroraDataApiConnectionOptions } from "typeorm/driver/aurora-data-api/AuroraDataApiConnectionOptions";
import { AuroraDataApiPostgresConnectionOptions } from "typeorm/driver/aurora-data-api-pg/AuroraDataApiPostgresConnectionOptions";
import { ExpoConnectionOptions } from "typeorm/driver/expo/ExpoConnectionOptions";

export {
  MysqlConnectionOptions,
  PostgresConnectionOptions,
  CockroachConnectionOptions,
  SqliteConnectionOptions,
  SqlServerConnectionOptions,
  SapConnectionOptions,
  OracleConnectionOptions,
  CordovaConnectionOptions,
  NativescriptConnectionOptions,
  ReactNativeConnectionOptions,
  SqljsConnectionOptions,
  MongoConnectionOptions,
  AuroraDataApiConnectionOptions,
  AuroraDataApiPostgresConnectionOptions,
  ExpoConnectionOptions,
};

export * from "typeorm";

export { InjectConnection, InjectRepository, InjectManager };
export { Database, DatabaseProvider } from "./connection";
