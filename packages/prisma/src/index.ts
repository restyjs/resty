import { PrismaClient } from "@prisma/client";
import { Service, Provider } from "@restyjs/core";

/**
 * Prisma Service for Resty.js
 * Extends PrismaClient and handles connection lifecycle
 *
 * @example
 * ```typescript
 * import { PrismaService } from "@restyjs/prisma";
 * import { Service, Inject } from "@restyjs/core";
 *
 * @Service()
 * class UserService {
 *   @Inject() private prisma: PrismaService;
 *
 *   async findAll() {
 *     return this.prisma.user.findMany();
 *   }
 * }
 * ```
 */
@Service()
export class PrismaService extends PrismaClient implements Provider {
    public readonly optional = false;

    /**
     * Initialize connection
     */
    async build(): Promise<void> {
        await this.$connect();
    }

    /**
     * Close connection
     * Should be called during graceful shutdown
     */
    async close(): Promise<void> {
        await this.$disconnect();
    }
}

/**
 * Helper to cleanup Prisma on shutdown
 */
export function prismaCleanup(prisma: PrismaService): () => Promise<void> {
    return async () => {
        await prisma.close();
    };
}

export * from "@prisma/client";
