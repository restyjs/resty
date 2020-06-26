import express from "express";

export interface Provider {
  optional: boolean;
  build(app?: express.Application): void | Promise<any>;
}
