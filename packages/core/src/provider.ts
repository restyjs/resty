export interface Provider {
  optional: boolean;
  build(): Promise<any>;
}
