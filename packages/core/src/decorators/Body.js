"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Body = void 0;
const metadataKeys_1 = require("../metadataKeys");
function Body(options) {
    return function (target, propertyKey, index) {
        var _a;
        let arrParamMetada = Reflect.getOwnMetadata(metadataKeys_1.MetadataKeys.param, target.constructor, propertyKey) || [];
        const metadata = {
            target,
            paramType: "body",
            propertyKey,
            index,
            type: Reflect.getMetadata("design:paramtypes", target, propertyKey)[index],
            parse: false,
            required: options ? (_a = options.required) !== null && _a !== void 0 ? _a : false : false,
            classTransform: options ? options.transform : undefined,
            validate: options ? options.validate : false,
            validatorOptions: options ? options.validatorOptions : undefined,
            explicitType: options ? options.type : undefined,
            extraOptions: options ? options.options : undefined,
        };
        arrParamMetada.push(metadata);
        Reflect.defineMetadata(metadataKeys_1.MetadataKeys.param, arrParamMetada, target.constructor, propertyKey);
    };
}
exports.Body = Body;
