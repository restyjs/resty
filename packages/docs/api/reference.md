# API Reference

## Decorators

### Class Decorators

- `@Controller(path: string)`: Registers a class as a controller.
- `@Service()`: Registers a class as a service (via TypeDI).

### Method Decorators

- `@Get(path: string)`
- `@Post(path: string)`
- `@Put(path: string)`
- `@Delete(path: string)`
- `@Patch(path: string)`

### Parameter Decorators

- `@Body()`: Injects `req.body`.
- `@Param(name?: string)`: Injects `req.params` or specific param.
- `@Query(name?: string)`: Injects `req.query` or specific query.
- `@Header(name?: string)`: Injects header(s).
- `@Ctx()`: Injects request context.

## RestyOptions

The main configuration object passed to `resty()`.

| Property | Type | Description |
|Data | Type | Description |
|---|---|---|
| `controllers` | `Class[]` | List of controller classes. |
| `providers` | `Provider[]` | (Optional) List of providers. |
| `debug` | `boolean` | Enable debug logging. |
| `cors` | `boolean \| CorsOptions` | Enable CORS. |
| `helmet` | `boolean \| HelmetOptions` | Enable Helmet security headers. |
