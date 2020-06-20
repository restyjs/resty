import { ValidatorOptions } from "class-validator";
import { ClassTransformOptions } from "class-transformer";

export type RequestParamType =
  | "body"
  | "query"
  | "queries"
  | "header"
  | "headers"
  | "file"
  | "files"
  | "param"
  | "params"
  | "session"
  | "state"
  | "cookie"
  | "cookies"
  | "request"
  | "response"
  | "context";

export interface RequestParamMetadata {
  target: any;
  propertyKey: string;
  index: number;
  paramType: RequestParamType;
  type: any;
  name?: string;
  parse: boolean;
  required: boolean;
  transform?: (
    value?: any,
    request?: any,
    response?: any
  ) => Promise<any> | any;
  extraOptions?: any;
  classTransform?: ClassTransformOptions;
  validate?: boolean;
  validatorOptions?: ValidatorOptions;
  explicitType?: any;
}
