import {GraphQLScalarType} from "graphql";

/**
 * ClassType
 * @interface
 * @name ClassType
 *
 */
export interface ClassType<T = any> {
  new (...args: any[]): T;
}

/**
 * TypeValue
 * @interface
 * @name TypeValue
 *
 */
export type TypeValue = ClassType | GraphQLScalarType | Function | object | symbol;

export type ReturnType = TypeValue | Array<TypeValue>;
/**
 * ValidatorFn
 * @interface
 * @name ValidatorFn
 *
 */
export type ValidatorFn<T extends object> = (
  argValue: T | undefined,
  argType: TypeValue,
) => void | Promise<void>;
