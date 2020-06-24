import { ValidatorOptions } from "class-validator";
import { ClassTransformOptions } from "class-transformer";

import { MetadataKeys } from "../metadataKeys";
import { RequestParamMetadata } from "./Param";

export interface BodyOptions {
  required?: boolean;
  transform?: ClassTransformOptions;
  validate?: boolean;
  validatorOptions?: ValidatorOptions;
  type?: any;
  options?: any;
}

export function Body(options?: BodyOptions) {
  return function (target: Object, propertyKey: string, index: number) {
    let arrParamMetada: RequestParamMetadata[] =
      Reflect.getOwnMetadata(
        MetadataKeys.param,
        target.constructor,
        propertyKey
      ) || [];

    const metadata: RequestParamMetadata = {
      target,
      paramType: "body",
      propertyKey,
      index,
      type: Reflect.getMetadata("design:paramtypes", target, propertyKey)[
        index
      ],
      parse: false,
      required: options ? options.required ?? false : false,
      classTransform: options ? options.transform : undefined,
      validate: options ? options.validate : false,
      validatorOptions: options ? options.validatorOptions : undefined,
      explicitType: options ? options.type : undefined,
      extraOptions: options ? options.options : undefined,
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
