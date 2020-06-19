const metadataKey = "resty:controller";

interface ControllerMetadata {
  path: string;
}

export function Controller(path: string) {
  return function (target: any) {
    const metadata: ControllerMetadata = {
      path: path,
    };
    Reflect.defineMetadata(metadataKey, metadata, target);
  };
}
