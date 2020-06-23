"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resty = void 0;
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const typedi_1 = require("typedi");
const process_1 = require("process");
const metadataKeys_1 = require("./metadataKeys");
const HttpMethods_1 = require("./decorators/HttpMethods");
const context_1 = require("./context");
const transformAndValidate_1 = require("./helpers/transformAndValidate");
const errors_1 = require("./errors");
class Application {
    constructor(app, controllers, middlewares, postMiddlewares, bodyParser, handleErrors) {
        this.app = app;
        this.controllers = controllers;
        this.middlewares = middlewares;
        this.postMiddlewares = postMiddlewares;
        this.bodyParser = bodyParser;
        this.handleErrors = handleErrors;
        try {
            this.initBodyParser(bodyParser);
            this.initPreMiddlewares();
            this.initControllers();
            this.initPostMiddlewares();
            this.initErrorHandlers();
        }
        catch (error) {
            console.error(error);
            process_1.exit(1);
        }
    }
    initBodyParser(enabled = true) {
        if (enabled) {
            this.app.use(body_parser_1.default.urlencoded({ extended: false }));
            this.app.use(body_parser_1.default.json());
        }
    }
    initPreMiddlewares() {
        if (this.middlewares) {
            this.middlewares.forEach((middleware) => this.app.use(middleware));
        }
    }
    initPostMiddlewares() {
        if (this.postMiddlewares) {
            this.postMiddlewares.forEach((middleware) => this.app.use(middleware));
        }
    }
    initControllers() {
        this.controllers.map((controller) => {
            const metadata = Reflect.getMetadata(metadataKeys_1.MetadataKeys.controller, controller);
            if (metadata == null) {
                // Make more useful error message like you've forgot to add @Controller or something ...
                throw Error(`${controller.name} metadata not found`);
            }
            this.initRoutes(controller, metadata);
        });
    }
    initRoutes(controller, metadata) {
        var _a;
        const router = express_1.default.Router(metadata.options);
        const arrHttpMethodMetada = (_a = Reflect.getMetadata(metadataKeys_1.MetadataKeys.httpMethod, controller)) !== null && _a !== void 0 ? _a : [];
        typedi_1.Container.set(controller, new controller());
        arrHttpMethodMetada.map((mehtodMetadata) => {
            const handler = this.initRequestHandler(controller, mehtodMetadata);
            const middlewares = [
                ...metadata.middlewares,
                ...mehtodMetadata.middlewares,
            ];
            switch (mehtodMetadata.method) {
                case HttpMethods_1.HTTPMethod.get:
                    router.get(mehtodMetadata.path, middlewares, handler);
                    break;
                case HttpMethods_1.HTTPMethod.post:
                    router.post(mehtodMetadata.path, middlewares, handler);
                    break;
                case HttpMethods_1.HTTPMethod.put:
                    router.put(mehtodMetadata.path, middlewares, handler);
                    break;
                case HttpMethods_1.HTTPMethod.delete:
                    router.delete(mehtodMetadata.path, middlewares, handler);
                    break;
                case HttpMethods_1.HTTPMethod.patch:
                    router.patch(mehtodMetadata.path, middlewares, handler);
                    break;
                case HttpMethods_1.HTTPMethod.options:
                    router.options(mehtodMetadata.path, middlewares, handler);
                    break;
                case HttpMethods_1.HTTPMethod.head:
                    router.head(mehtodMetadata.path, middlewares, handler);
                    break;
                default:
                    throw Error(`${mehtodMetadata.method} method not valid`);
                    break;
            }
        });
        this.app.use(metadata.path, router);
    }
    initRequestHandler(controller, metadata) {
        return async (req, res, next) => {
            try {
                const _controller = typedi_1.Container.get(controller);
                const _method = _controller[metadata.propertyKey];
                let arrParamMetada = Reflect.getOwnMetadata(metadataKeys_1.MetadataKeys.param, controller, metadata.propertyKey) || [];
                let args = [];
                await Promise.all(arrParamMetada.map(async (paramMetadata) => {
                    switch (paramMetadata.paramType) {
                        case "body":
                            try {
                                args[paramMetadata.index] = await transformAndValidate_1.transformAndValidate(paramMetadata.type, req.body, {
                                    transformer: paramMetadata.classTransform
                                        ? paramMetadata.classTransform
                                        : void 0,
                                    validator: paramMetadata.validatorOptions,
                                });
                            }
                            catch (error) {
                                throw new errors_1.ValidationError(error);
                            }
                            break;
                        case "param":
                            if (paramMetadata.name) {
                                args[paramMetadata.index] = req.params[paramMetadata.name];
                            }
                            break;
                        case "query":
                            if (paramMetadata.name) {
                                args[paramMetadata.index] = req.query[paramMetadata.name];
                            }
                            break;
                    }
                }));
                metadata.arguments.map((arg, index) => {
                    if (arg.name == "Context") {
                        const ctx = new context_1.Context(req, res, next);
                        args[index] = ctx;
                    }
                });
                const result = await _method(...args);
                if (result && result.finished) {
                    return result;
                }
                return res.send(result);
            }
            catch (error) {
                next(error);
                return;
            }
        };
    }
    initErrorHandlers() {
        if (this.handleErrors) {
            this.app.use((req, res, next) => {
                const error = new errors_1.HTTPError("Not Found", 404);
                next(error);
            });
            this.app.use((err, req, res, next) => {
                if (err instanceof errors_1.ValidationError) {
                    res.status(400);
                    res.json({
                        error: err,
                    });
                    return;
                }
                else if (err instanceof errors_1.HTTPError) {
                    res.status(err.statusCode);
                    res.json(err);
                    return;
                }
                res.status(500);
                res.json(err);
            });
        }
    }
}
function resty(options) {
    var _a, _b, _c;
    const expressApplication = (_a = options.app) !== null && _a !== void 0 ? _a : express_1.default();
    const restyApplication = new Application(expressApplication, (_b = options.controllers) !== null && _b !== void 0 ? _b : [], options.middlewares, options.postMiddlewares, options.bodyParser, (_c = options.handleErrors) !== null && _c !== void 0 ? _c : true);
    typedi_1.Container.set("resty:application", restyApplication);
    return expressApplication;
}
exports.resty = resty;
