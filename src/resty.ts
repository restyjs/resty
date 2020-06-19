import "reflect-metadata";
import express from "express";
import { Container } from "typedi";

interface Options {
  app: express.Application;
  controllers: any[];
}

class Application {
  constructor(
    private readonly app: express.Application,
    private readonly controllers: any[]
  ) {}
}

export function resty(options: Partial<Options>): express.Application {
  const expressApplication = options.app ?? express();
  const restyApplication = new Application(
    expressApplication,
    options.controllers ?? []
  );
  Container.set("resty:application", restyApplication);
  return expressApplication;
}
