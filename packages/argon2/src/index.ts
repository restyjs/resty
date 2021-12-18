import argon2 from "argon2";
import { randomBytes } from "crypto";
/**
 * @param  {string} password
 * @returns  Promise
 */
export async function hash(password: string): Promise<{
  password: string;
  salt: string;
}> {
  const salt = randomBytes(32);
  const hashedPassword = await argon2.hash(password, { salt });
  return {
    password: hashedPassword,
    salt: salt.toString("hex"),
  };
}
/**
 * @param  {string} hashedPassword
 * @param  {string} password
 */
export function verify(
  hashedPassword: string,
  password: string
): Promise<boolean> {
  return argon2.verify(hashedPassword, password);
}
