import dotenv, { DotenvConfigOptions, DotenvConfigOutput } from "dotenv";
import { Provider, Service } from "@restyjs/core";

@Service()
class ConfigurationProvider implements Provider {
  private env: DotenvConfigOutput;
  optional: boolean;

  constructor(options?: DotenvConfigOptions, optional?: boolean) {
    this.optional = optional ?? false;
    this.env = dotenv.config(options);
  }

  build() {
    if (this.env.error && !this.optional) {
      throw this.env.error;
    }
  }
}

function Configuration(
  options?: DotenvConfigOptions,
  optional?: boolean
): ConfigurationProvider {
  return new ConfigurationProvider(options, optional);
}

export { Configuration, DotenvConfigOptions, DotenvConfigOutput };
