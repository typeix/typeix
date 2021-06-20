import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLNamedType,
  GraphQLFieldConfigMap,
  GraphQLOutputType,
  GraphQLInputObjectType,
  GraphQLFieldConfigArgumentMap,
  GraphQLInputType,
  GraphQLInputFieldConfigMap,
  GraphQLInterfaceType,
  graphql,
  getIntrospectionQuery,
  GraphQLEnumType,
  GraphQLEnumValueConfigMap,
  GraphQLUnionType,
  GraphQLTypeResolver,
  GraphQLDirective,
  GraphQLFieldResolver,
} from "graphql";
import {withFilter, ResolverFn} from "graphql-subscriptions";
import {Injectable} from "@typeix/di";
import {BuildSchemaOptions} from "../types";
import {RouterError} from "@typeix/router";
import {isFunction} from "@typeix/utils";


@Injectable()
export class SchemaBuilder {


  async create(resolvers: Array<Function>): Promise<GraphQLSchema>;
  async create(resolvers: Array<Function>, scalarClasses: Array<Function>): Promise<GraphQLSchema>;
  async create(resolvers: Array<Function>, options: BuildSchemaOptions): Promise<GraphQLSchema>;
  async create(resolvers: Array<Function>, scalarClasses: Array<Function>, options: BuildSchemaOptions): Promise<GraphQLSchema>;
  async create(
    resolvers: Array<Function>,
    scalarsOrOptions: Array<Function> | BuildSchemaOptions = [],
    options: BuildSchemaOptions = {}
  ): Promise<GraphQLSchema> {
    if (Array.isArray(scalarsOrOptions)) {
      // this.assignScalarObjects(scalarsOrOptions, options);
    } else {
      options = scalarsOrOptions;
    }

    const schema = new GraphQLSchema({
      mutation: this.createObjectType([], "Mutation", options),
      query: this.createObjectType([], "Query", options),
      subscription: this.createObjectType([], "Subscription", options),
      types: this.createOrphanType(options.orphanedTypes),
      directives: options.directives
    });

    if (!options.skipCheck) {
      const introspectionQuery = getIntrospectionQuery();
      const {errors} = await graphql(schema, introspectionQuery);
      if (errors) {
        throw new RouterError("GraphQL schema error", 500, errors);
      }
    }

    return schema;
  }

  createOrphanType(orphanedTypes: Array<Function>): Array<GraphQLNamedType> {
    return [];
  }

  /**
   * createObjectType
   * @param handlers
   * @param objectTypeName
   * @param options
   */
  createObjectType(
    handlers: Array<Function>,
    objectTypeName: "Subscription" | "Mutation" | "Query",
    options: BuildSchemaOptions
  ): GraphQLObjectType {
    if (handlers.length > 0) {
      return new GraphQLObjectType({
        name: objectTypeName,
        fields: this.fieldsFactory(handlers, options)
      });
    }
  }

  /**
   * fieldsFactory
   * @param handlers Array<Function>
   * @param options BuildSchemaOptions
   * @private
   */
  private fieldsFactory<T = any, U = any>(
    handlers: Array<Function>,
    options: BuildSchemaOptions
  ): GraphQLFieldConfigMap<T, U> {
    const fieldConfigMap: GraphQLFieldConfigMap<T, U> = {};
    return fieldConfigMap;
  }
}
