import { Container } from "@restyjs/core";
import { AuthController } from "../src/controllers/AuthController";

import { JWTConfiguration } from "@restyjs/jwt";
import { Database } from "@restyjs/typeorm";
import { Connection } from "typeorm";
import { User } from "../src/models/User";

var connection: Connection;
export async function initProviders() {
  if (connection && connection.isConnected) {
    return;
  }
  await JWTConfiguration("secret").build();
  connection = await Database({
    type: "sqlite",
    database: "example.db",
    synchronize: true,
    entities: [User],
  }).build();
}

beforeAll(async () => {
  await initProviders();
});

afterAll(async () => {
  if (connection && connection.isConnected) {
    await connection.close();
  }
});

describe("/api/auth", () => {
  const email = `${Math.random()}@restyjs.com`;
  const password = `password`;
  it("/api/auth/register", async () => {
    const authController = Container.get(AuthController);
    const body = {
      firstName: "Jane",
      lastName: "Doe",
      email: email,
      password: password,
    };
    const response = await authController.register(body);
    expect(response.user.email).toBe(email);
  });

  it("/api/auth/login", async () => {
    const authController = Container.get(AuthController);
    const body = {
      email: email,
      password: password,
    };
    const response = await authController.login(body);
    expect(response.user.email).toBe(email);
  });
});
