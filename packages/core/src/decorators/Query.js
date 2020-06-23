"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Query = void 0;
const metadataKeys_1 = require("../metadataKeys");
function Query(paramName) {
    return function (target, propertyKey, index) {
        let arrParamMetada = Reflect.getOwnMetadata(metadataKeys_1.MetadataKeys.param, target.constructor, propertyKey) || [];
        const metadata = {
            target,
            paramType: "query",
            name: paramName,
            propertyKey,
            index,
            type: Reflect.getMetadata("design:paramtypes", target, propertyKey)[index],
            parse: false,
        };
        arrParamMetada.push(metadata);
        Reflect.defineMetadata(metadataKeys_1.MetadataKeys.param, arrParamMetada, target.constructor, propertyKey);
    };
}
exports.Query = Query;
