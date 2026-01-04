import jwt, { SignOptions, JwtPayload, VerifyOptions } from "jsonwebtoken";
import {
  Service,
  Provider,
  Container,
  UnauthorizedError,
} from "@restyjs/core";
import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Configuration options for JWT provider
 */
export interface JWTConfig {
  /** Secret key for signing tokens */
  secret: string;
  /** Default sign options */
  signOptions?: SignOptions;
  /** Default verify options */
  verifyOptions?: VerifyOptions;
}

/**
 * Extract JWT token from Authorization header
 */
export function getTokenFromHeader(req: Request): string | null {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.split(" ");

  if (!token || !["Bearer", "Token"].includes(scheme)) {
    return null;
  }

  return token;
}

/**
 * JWT authentication provider
 *
 * @example
 * ```typescript
 * const app = resty({
 *   providers: [
 *     JWTConfiguration({ secret: process.env.JWT_SECRET! })
 *   ]
 * });
 * ```
 */
@Service()
export class JWTProvider implements Provider {
  public readonly optional = false;
  private readonly config: JWTConfig;

  constructor(config: JWTConfig) {
    this.config = config;
  }

  build(): void {
    // Validate configuration
    if (!this.config.secret) {
      throw new Error("[resty/jwt] Secret is required");
    }
  }

  /**
   * Verify a JWT token
   */
  verify<T = JwtPayload>(token: string, options?: VerifyOptions): Promise<T> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        this.config.secret,
        { ...this.config.verifyOptions, ...options },
        (err, decoded) => {
          if (err) {
            reject(err);
          } else {
            resolve(decoded as T);
          }
        }
      );
    });
  }

  /**
   * Generate a JWT token
   */
  sign(
    payload: string | Buffer | object,
    options?: SignOptions
  ): string {
    return jwt.sign(payload, this.config.secret, {
      ...this.config.signOptions,
      ...options,
    });
  }

  /**
   * Decode a token without verification
   */
  decode<T = JwtPayload>(token: string): T | null {
    return jwt.decode(token) as T | null;
  }
}

/**
 * Middleware to validate JWT tokens
 * Adds decoded token to req.token
 *
 * @example
 * ```typescript
 * @Controller("/protected", [ValidateJWT])
 * class ProtectedController {
 *   @Get("/")
 *   secure(@Req() req: Request) {
 *     return { userId: req.token.id };
 *   }
 * }
 * ```
 */
export const ValidateJWT: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = getTokenFromHeader(req);

    if (!token) {
      throw new UnauthorizedError("No token provided");
    }

    const provider = Container.get(JWTProvider);
    const decoded = await provider.verify(token);

    (req as Request & { token: JwtPayload }).token = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError("Token expired"));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError("Invalid token"));
    } else {
      next(error);
    }
  }
};

/**
 * Create and configure JWT provider
 *
 * @example
 * ```typescript
 * import { JWTConfiguration, JWTProvider, ValidateJWT } from "@restyjs/jwt";
 *
 * const app = resty({
 *   providers: [
 *     JWTConfiguration({
 *       secret: process.env.JWT_SECRET!,
 *       signOptions: { expiresIn: "1d" }
 *     })
 *   ]
 * });
 *
 * // Access in controller
 * @Controller("/auth")
 * class AuthController {
 *   @Inject() jwt: JWTProvider;
 *
 *   @Post("/login")
 *   async login(@Body() body: LoginDto) {
 *     const user = await this.validateUser(body);
 *     const token = this.jwt.sign({ id: user.id });
 *     return { token };
 *   }
 * }
 * ```
 */
export function JWTConfiguration(config: JWTConfig): JWTProvider {
  const provider = new JWTProvider(config);
  Container.set(JWTProvider, provider);
  return provider;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      token?: JwtPayload;
    }
  }
}
