export interface Provider {
  optional: boolean;
  build(): void | Promise<any>;
}
