import { DataSource, Repository, EntityTarget, ObjectLiteral } from "typeorm";
import { Container } from "typedi";

/**
 * Inject a TypeORM repository for an entity
 *
 * @example
 * ```typescript
 * @Controller("/users")
 * class UserController {
 *   @InjectRepository(User)
 *   private readonly userRepository: Repository<User>;
 *
 *   @Get("/")
 *   async list() {
 *     return this.userRepository.find();
 *   }
 * }
 * ```
 */
export function InjectRepository<Entity extends ObjectLiteral>(
    entity: EntityTarget<Entity>
): PropertyDecorator {
    return function (target: object, propertyKey: string | symbol) {
        // Define getter that lazily retrieves the repository
        Object.defineProperty(target, propertyKey, {
            get() {
                const dataSource = Container.get(DataSource) as DataSource;
                if (!dataSource) {
                    throw new Error(
                        "[resty/typeorm] DataSource not found. Make sure Database provider is configured."
                    );
                }
                return dataSource.getRepository(entity);
            },
            enumerable: true,
            configurable: true,
        });
    };
}

/**
 * Inject the TypeORM DataSource
 *
 * @example
 * ```typescript
 * @Controller("/admin")
 * class AdminController {
 *   @InjectDataSource()
 *   private readonly dataSource: DataSource;
 *
 *   @Get("/stats")
 *   async stats() {
 *     const result = await this.dataSource.query("SELECT COUNT(*) FROM users");
 *     return result;
 *   }
 * }
 * ```
 */
export function InjectDataSource(): PropertyDecorator {
    return function (target: object, propertyKey: string | symbol) {
        Object.defineProperty(target, propertyKey, {
            get() {
                const dataSource = Container.get(DataSource) as DataSource;
                if (!dataSource) {
                    throw new Error(
                        "[resty/typeorm] DataSource not found. Make sure Database provider is configured."
                    );
                }
                return dataSource;
            },
            enumerable: true,
            configurable: true,
        });
    };
}

/**
 * Inject the EntityManager from the default DataSource
 *
 * @example
 * ```typescript
 * @Controller("/users")
 * class UserController {
 *   @InjectManager()
 *   private readonly manager: EntityManager;
 *
 *   @Post("/")
 *   async create(@Body() data: CreateUserDto) {
 *     return this.manager.transaction(async (em) => {
 *       const user = em.create(User, data);
 *       return em.save(user);
 *     });
 *   }
 * }
 * ```
 */
export function InjectManager(): PropertyDecorator {
    return function (target: object, propertyKey: string | symbol) {
        Object.defineProperty(target, propertyKey, {
            get() {
                const dataSource = Container.get(DataSource) as DataSource;
                if (!dataSource) {
                    throw new Error(
                        "[resty/typeorm] DataSource not found. Make sure Database provider is configured."
                    );
                }
                return dataSource.manager;
            },
            enumerable: true,
            configurable: true,
        });
    };
}

export type { Repository, EntityTarget };
