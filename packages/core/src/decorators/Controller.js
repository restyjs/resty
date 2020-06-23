"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = void 0;
const metadataKeys_1 = require("../metadataKeys");
function Controller(path, middlewares = [], options) {
    return function (target) {
        const metadata = {
            path: path,
            middlewares: middlewares,
            options: options,
        };
        Reflect.defineMetadata(metadataKeys_1.MetadataKeys.controller, metadata, target);
    };
}
exports.Controller = Controller;
