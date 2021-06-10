import {GraphQLScalarType, GraphQLTypeResolver} from "graphql";
import {ComplexityEstimator} from "graphql-query-complexity";

/**
 * Constructor Type
 * @interface
 * @name Type
 *
 */
export interface Type<T = any> {
  new(...args: any[]): T;
}

export type NullableList = "items" | "itemsAndList";
/**
 * @interface
 * @name BaseTypeOptions
 */
export interface BaseTypeOptions {
  nullable?: boolean | NullableList;
  defaultValue?: any;
}
/**
 * @interface
 * @name ArgsOptions
 */
export interface ArgsOptions extends BaseTypeOptions {
  name?: string;
  description?: string;
  type?: () => any;
}

export type Complexity = ComplexityEstimator | number;
export type GqlTypeReference =
  | Type
  | GraphQLScalarType
  | Function
  | object
  | symbol;
export type ReturnTypeFnValue = GqlTypeReference | [GqlTypeReference];
export type ReturnTypeFn = (returns?: void) => ReturnTypeFnValue;

/**
 * @interface
 * @name InputTypeOptions
 */
export interface InputTypeOptions {
  description?: string;
  isAbstract?: boolean;
}

/**
 * @interface
 * @name TypeOptions
 */
export interface TypeOptions extends BaseTypeOptions {
  name?: string;
  description?: string;
  deprecationReason?: string;
  complexity?: Complexity;
}


export type ResolveTypeFn<TSource = any, TContext = any> = (
  ...args: Parameters<GraphQLTypeResolver<TSource, TContext>>
) => any;
/**
 * @interface
 * @name ObjectTypeOptions
 */
export interface ObjectTypeOptions {
  description?: string;
  isAbstract?: boolean;
  resolveType?: ResolveTypeFn;
  implements?: Function | Array<Function> | (() => Function | Array<Function>);
}

/**
 * @interface
 * @name SubscriptionOptions
 */
export interface SubscriptionOptions extends BaseTypeOptions {
  name?: string;
  description?: string;
  deprecationReason?: string;
  filter?: (
    payload: any,
    variables: any,
    context: any,
  ) => boolean | Promise<boolean>;
  resolve?: (
    payload: any,
    args: any,
    context: any,
    info: any,
  ) => any | Promise<any>;
}
