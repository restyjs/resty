import argon2, { Options } from "argon2";
import { randomBytes } from "crypto";

/**
 * Result of password hashing
 */
export interface HashResult {
  /** The hashed password */
  hash: string;
  /** The salt used (hex encoded) */
  salt: string;
}

/**
 * Hashing options
 */
export interface HashOptions extends Partial<Options> {
  /** Salt length in bytes (default: 32) */
  saltLength?: number;
}

/**
 * Hash a password using Argon2id (recommended variant)
 *
 * @example
 * ```typescript
 * const { hash, salt } = await hashPassword("userPassword123");
 * // Store hash and salt in database
 * ```
 */
export async function hashPassword(
  password: string,
  options: HashOptions = {}
): Promise<HashResult> {
  const { saltLength = 32, ...argonOptions } = options;
  const salt = randomBytes(saltLength);

  const hash = await argon2.hash(password, {
    type: argon2.argon2id,
    salt,
    ...argonOptions,
  });

  return {
    hash,
    salt: salt.toString("hex"),
  };
}

/**
 * Verify a password against a hash
 *
 * @example
 * ```typescript
 * const isValid = await verifyPassword(storedHash, "userPassword123");
 * if (!isValid) {
 *   throw new UnauthorizedError("Invalid password");
 * }
 * ```
 */
export async function verifyPassword(
  hash: string,
  password: string
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

/**
 * Check if a hash needs to be rehashed (e.g., after security parameters change)
 */
export function needsRehash(hash: string, options?: Options): boolean {
  return argon2.needsRehash(hash, options);
}

// Legacy exports for backwards compatibility
export { hashPassword as hash, verifyPassword as verify };

// Re-export argon2 types
export { argon2 };
