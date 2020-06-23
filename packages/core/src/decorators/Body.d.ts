import { ValidatorOptions } from "class-validator";
import { ClassTransformOptions } from "class-transformer";
export interface BodyOptions {
    required?: boolean;
    transform?: ClassTransformOptions;
    validate?: boolean;
    validatorOptions?: ValidatorOptions;
    type?: any;
    options?: any;
}
export declare function Body(options?: BodyOptions): (target: Object, propertyKey: string, index: number) => void;
