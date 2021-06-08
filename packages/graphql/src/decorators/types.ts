import {GraphQLScalarType, GraphQLTypeResolver} from "graphql";
import {ValidatorOptions} from "class-validator";
import {ComplexityEstimator} from "graphql-query-complexity";

/**
 * ClassType
 * @interface
 * @name ClassType
 *
 */
export interface ClassType<T = any> {
  new(...args: any[]): T;
}

/**
 * ArgOptions
 * @interface
 * @name ArgOptions
 *
 */
export interface ArgOptions {
  nullable?: boolean | "items" | "itemsAndList";
  defaultValue?: any;
  description?: string;
  validate?: boolean | ValidatorOptions | ValidatorFn<object>;
  complexity?: Complexity;
  deprecationReason?: string;
  name?: string;
  isAbstract?: boolean;
  implements?: Function | Array<Function>;
}

export interface ResolveTypeOptions<TSource = any, TContext = any> {
  resolveType?: TypeResolver<TSource, TContext>;
}

/**
 * TypeValue
 * @interface
 * @name TypeValue
 *
 */
export type TypeValue = ClassType | GraphQLScalarType | Function | object | symbol;

export type ReturnType = TypeValue | Array<TypeValue>;

export type ArgType = ReturnType | ArgOptions;

export type ReturnTypeFn = () => ReturnType;

export type Complexity = ComplexityEstimator | number;

export type TypeResolver<TSource, TContext> = (
  ...args: Parameters<GraphQLTypeResolver<TSource, TContext>>
) => Promise<string | ClassType>;
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
