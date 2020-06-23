import { ValidatorOptions } from "class-validator";
import { ClassTransformOptions } from "class-transformer";
export declare type ClassType<T> = new (...args: any[]) => T;
export interface TransformValidationOptions {
    validator?: ValidatorOptions;
    transformer?: ClassTransformOptions;
}
export declare function transformAndValidate<T extends object>(classType: ClassType<T>, somethingToTransform: string | object | object[], options?: TransformValidationOptions): Promise<T>;
