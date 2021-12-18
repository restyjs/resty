import { MetadataKeys } from "../metadataKeys";

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
