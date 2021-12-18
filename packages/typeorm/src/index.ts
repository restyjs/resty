import { TypeDIContainerProvider } from "./container-provider.class";
import { Container as TContainer } from "typedi";
import { ConnectionManager } from "typeorm";

/** This file registers all classes from TypeORM in the default TypeDI container. */

/**
 * We need to set imported TypeORM classes before requesting them, otherwise we
 * would receive a "ServiceNotFoundError" above TypeDI 0.9.1 from the decorators.
 */
TContainer.set({ id: ConnectionManager, type: ConnectionManager });

export * from "./decorators/inject-connection.decorator";
export * from "./decorators/inject-manager.decorator";
export * from "./decorators/inject-repository.decorator";

/**
 * We export the current container implementation what transforms function
 * calls between the TypeORM container format and TypeDI.
 */
export const Container = new TypeDIContainerProvider();

export { Database, DatabaseProvider } from "./connection";
