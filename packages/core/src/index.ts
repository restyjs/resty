import "reflect-metadata";
import { resty, RestyOptions } from "./resty";
import type {
  Request,
  Response,
  NextFunction,
  RequestHandler,
  RequestParamHandler,
  Router,
  Application,
} from "express";
import { Service, Container, Inject } from "typedi";

// Core exports
export { resty };
export type { RestyOptions };
export default resty;

// Type inference and utilities
export type {
  TypedHandler,
  TypedRequest,
  TypedResponse,
  RouteHandler,
  ExtractParams,
  TypedMethod,
  InferResponse,
  InferParams,
  JSONValue,
  JSONSafe,
  ApiResponseType,
  ApiErrorType,
  ApiResult,
  PaginatedList,
  PaginationQuery,
  IdParam,
  SlugParam,
} from "./types";
export { defineHandler } from "./types";

// Controller and HTTP method decorators
export { Controller } from "./decorators/Controller";
export type { ControllerMetadata } from "./decorators/Controller";
export {
  Get,
  Post,
  Delete,
  Head,
  Options,
  Patch,
  Put,
  All,
  HTTPMethod,
} from "./decorators/HttpMethods";
export type { HTTPMethodMetadata } from "./decorators/HttpMethods";

// Parameter decorators
export { Body } from "./decorators/Body";
export { Query, Queries } from "./decorators/Query";
export { Param, Params, Req, Res } from "./decorators/Param";
export type { RequestParamMetadata, RequestParamType } from "./decorators/Param";
export { Header, Headers } from "./decorators/Header";
export { Cookie, Cookies } from "./decorators/Cookie";

// Response decorators
export { HttpCode, Redirect, SetHeader } from "./decorators/Response";

// Context and utilities
export { Context } from "./context";
export type { Provider } from "./provider";

// Lifecycle hooks and interceptors
export {
  createHooksManager,
  createInterceptorManager,
  createInterceptorMiddleware,
  requestTimingHook,
  errorLoggingHook,
} from "./hooks";
export type {
  HookContext,
  OnRequestHook,
  OnResponseHook,
  OnErrorHook,
  LifecycleHooks,
  RequestInterceptor,
  ResponseInterceptor,
  Interceptors,
} from "./hooks";

// Response serialization
export {
  jsonSerializer,
  dateSerializer,
  bigIntSerializer,
  wrapResponse,
  transformResponse,
  paginate,
  exclude,
  pick,
} from "./serialization";
export type {
  ResponseSerializer,
  TransformOptions,
  ApiResponse,
  PaginatedResponse,
} from "./serialization";

// Health checks and graceful shutdown
export {
  healthCheck,
  livenessProbe,
  readinessProbe,
  gracefulShutdown,
  shutdownMiddleware,
} from "./health";
export type {
  HealthStatus,
  HealthCheckResult,
  HealthCheck,
  HealthCheckConfig,
  GracefulShutdownOptions,
} from "./health";

// Error classes
export {
  Exception,
  HTTPError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  TooManyRequestsError,
  InternalServerError,
} from "./errors";

// Built-in handlers
export {
  DefaultErrorHandler,
  NotFoundErrorHandler,
  RequestLogger,
} from "./handlers";

// Re-export from Express for convenience
export type {
  Request,
  Response,
  NextFunction,
  RequestHandler,
  RequestParamHandler,
  Router,
  Application,
};

// Re-export from TypeDI for dependency injection
export { Service, Container, Inject };
