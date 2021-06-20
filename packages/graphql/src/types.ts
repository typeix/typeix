import {GraphQLDirective, GraphQLInt, GraphQLFloat, GraphQLID, GraphQLScalarType, GraphQLTypeResolver} from "graphql";
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

/**
 * @interface
 * @name EnumOptions
 */
export interface EnumMetadataValuesMapOptions {
  deprecationReason?: string;
  description?: string;
}
export type EnumMetadataValuesMap<T extends object> = Partial<Record<keyof T, EnumMetadataValuesMapOptions>>;
export interface EnumOptions<T extends object = any> {
  type: any;
  name: string;
  description?: string;
  valuesMap?: EnumMetadataValuesMap<T>;
}


/**
 * @interface
 * @name EnumOptions
 */
export type DateScalarMode = "isoDate" | "timestamp";
export type NumberScalarMode = "float" | "integer";
export interface ScalarsTypeMap {
  type: Function;
  scalar: GraphQLScalarType;
}
export interface BuildSchemaOptions {
  dateScalarMode?: DateScalarMode;
  numberScalarMode?: NumberScalarMode;
  scalarsMap?: ScalarsTypeMap[];
  orphanedTypes?: Function[];
  skipCheck?: boolean;
  directives?: GraphQLDirective[];
  schemaDirectives?: Record<string, any>;
}

export const Int = GraphQLInt;
export const Float = GraphQLFloat;
export const ID = GraphQLID;
