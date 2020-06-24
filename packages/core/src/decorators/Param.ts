import { ValidatorOptions } from "class-validator";
import { ClassTransformOptions } from "class-transformer";
import { MetadataKeys } from "../metadataKeys";
import { BodyOptions } from "./Body";

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
  required?: boolean;
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

export function Param(paramName: string) {
  return function (target: Object, propertyKey: string, index: number) {
    let arrParamMetada: RequestParamMetadata[] =
      Reflect.getOwnMetadata(
        MetadataKeys.param,
        target.constructor,
        propertyKey
      ) || [];

    const metadata: RequestParamMetadata = {
      target,
      paramType: "param",
      name: paramName,
      propertyKey,
      index,
      type: Reflect.getMetadata("design:paramtypes", target, propertyKey)[
        index
      ],
      parse: false,
    };

    arrParamMetada.push(metadata);

    Reflect.defineMetadata(
      MetadataKeys.param,
      arrParamMetada,
      target.constructor,
      propertyKey
    );
  };
}
