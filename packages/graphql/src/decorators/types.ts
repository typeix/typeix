import {GraphQLScalarType, GraphQLTypeResolver} from "graphql";
import {ValidatorOptions} from "class-validator";
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
/**
 * @interface
 * @name FieldOptions
 */
export interface FieldOptions extends BaseTypeOptions {
  name?: string;
  description?: string;
  deprecationReason?: string;
  complexity?: Complexity;
}

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
 * @name MutationOptions
 */
export interface MutationOptions extends BaseTypeOptions {
  name?: string;
  description?: string;
  deprecationReason?: string;
  complexity?: Complexity;
}
