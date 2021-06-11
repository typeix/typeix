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
import {BuildSchemaOptions, FieldsFactory, ResolverTypeMetadata} from "../types";
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
      mutation: this.createObjectType([], [], "Mutation", options),
      query: this.createObjectType([], [], "Query", options),
      subscription: this.createObjectType([], [], "Subscription", options),
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
   * @param typeRefs
   * @param resolversMetadata
   * @param objectTypeName
   * @param options
   * @param fieldsFactory
   */
  createObjectType(
    typeRefs: Array<Function>,
    resolversMetadata: Array<ResolverTypeMetadata>,
    objectTypeName: "Subscription" | "Mutation" | "Query",
    options: BuildSchemaOptions,
    fieldsFactory?: FieldsFactory
  ): GraphQLObjectType {
    const handlers = typeRefs
      ? resolversMetadata.filter((query) => typeRefs.includes(query.target))
      : resolversMetadata;
    if (handlers.length > 0) {
      return new GraphQLObjectType({
        name: objectTypeName,
        fields: isFunction(fieldsFactory) ? fieldsFactory(handlers, options) : this.fieldsFactory(handlers, options)
      });
    }
  }

  /**
   * fieldsFactory
   * @param handlers Array<ResolverTypeMetadata>
   * @param options BuildSchemaOptions
   * @private
   */
  private fieldsFactory<T = any, U = any>(
    handlers: Array<ResolverTypeMetadata>,
    options: BuildSchemaOptions
  ): GraphQLFieldConfigMap<T, U> {
    const fieldConfigMap: GraphQLFieldConfigMap<T, U> = {};
    return fieldConfigMap;
  }
}
