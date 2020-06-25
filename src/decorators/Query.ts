import { RequestParamMetadata } from "./Param";
import { MetadataKeys } from "../metadataKeys";

export function Query(paramName: string) {
  return function (target: Object, propertyKey: string, index: number) {
    let arrParamMetada: RequestParamMetadata[] =
      Reflect.getOwnMetadata(
        MetadataKeys.param,
        target.constructor,
        propertyKey
      ) || [];

    const metadata: RequestParamMetadata = {
      target,
      paramType: "query",
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
