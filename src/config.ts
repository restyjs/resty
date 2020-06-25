import dotenv, {
  DotenvConfigOptions,
  DotenvParseOutput,
  DotenvConfigOutput,
} from "dotenv";

export interface ConfigurationOptions {
  /**
   * You may specify a custom path if your file containing environment variables is located elsewhere.
   */
  path?: string;

  /**
   * You may specify the encoding of your file containing environment variables.
   */
  encoding?: string;

  /**
   * You may turn on logging to help debug why certain keys or values are not being set as you expect.
   */
  debug?: boolean;
}

export class Configuration {
  env?: DotenvConfigOutput;
  private options?: ConfigurationOptions;

  constructor(options?: ConfigurationOptions) {
    this.options = options;
  }

  initialize() {
    this.env = dotenv.config(this.options);
  }
}
