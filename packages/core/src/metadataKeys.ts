/**
 * Metadata keys used for decorator reflection
 */
export const MetadataKeys = {
  controller: Symbol("resty:controller"),
  httpMethod: Symbol("resty:httpMethod"),
  param: Symbol("resty:param"),
  httpCode: Symbol("resty:httpCode"),
  headers: Symbol("resty:headers"),
  redirect: Symbol("resty:redirect"),
  render: Symbol("resty:render"),
  validation: Symbol("resty:validation"),
} as const;
