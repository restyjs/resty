"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Head = exports.Options = exports.Patch = exports.Delete = exports.Put = exports.Post = exports.Get = exports.HTTPMethod = void 0;
const metadataKeys_1 = require("../metadataKeys");
var HTTPMethod;
(function (HTTPMethod) {
    HTTPMethod["get"] = "get";
    HTTPMethod["post"] = "post";
    HTTPMethod["put"] = "put";
    HTTPMethod["delete"] = "delete";
    HTTPMethod["patch"] = "patch";
    HTTPMethod["options"] = "options";
    HTTPMethod["head"] = "head";
})(HTTPMethod = exports.HTTPMethod || (exports.HTTPMethod = {}));
function httpMethod(path, method, middlewares = []) {
    return function (target, propertyKey, descriptor) {
        var _a;
        var arrHttpMethodMetada = (_a = Reflect.getMetadata(metadataKeys_1.MetadataKeys.httpMethod, target.constructor)) !== null && _a !== void 0 ? _a : [];
        const metadata = {
            path,
            method,
            middlewares,
            propertyKey,
            arguments: Reflect.getMetadata("design:paramtypes", target, propertyKey),
        };
        arrHttpMethodMetada.push(metadata);
        Reflect.defineMetadata(metadataKeys_1.MetadataKeys.httpMethod, arrHttpMethodMetada, target.constructor);
    };
}
function Get(path, middlewares) {
    return httpMethod(path, HTTPMethod.get, middlewares);
}
exports.Get = Get;
function Post(path, middlewares) {
    return httpMethod(path, HTTPMethod.post, middlewares);
}
exports.Post = Post;
function Put(path, middlewares) {
    return httpMethod(path, HTTPMethod.put, middlewares);
}
exports.Put = Put;
function Delete(path, middlewares) {
    return httpMethod(path, HTTPMethod.delete, middlewares);
}
exports.Delete = Delete;
function Patch(path, middlewares) {
    return httpMethod(path, HTTPMethod.patch, middlewares);
}
exports.Patch = Patch;
function Options(path, middlewares) {
    return httpMethod(path, HTTPMethod.options, middlewares);
}
exports.Options = Options;
function Head(path, middlewares) {
    return httpMethod(path, HTTPMethod.head, middlewares);
}
exports.Head = Head;
