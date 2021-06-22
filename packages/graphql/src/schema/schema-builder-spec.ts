import {SchemaBuilder} from "./schema-builder";
import {Injector} from "@typeix/di";
import {Resolver} from "../decorators/resolver.decorator";
import {ObjectType} from "../decorators/object-type.decorator";
import {Field, FieldResolver} from "../decorators/field.decorator";
import {ID} from "../types";
import {Query} from "../decorators/query.decorator";
import {Mutation} from "../decorators/mutation.decorator";
import {Arg} from "../decorators/arg.decorator";
import {Ctx} from "../decorators/ctx.decorator";
import {Root} from "../decorators/root.decorator";

describe("schema builder", () => {

  let builder: SchemaBuilder;

  beforeEach(() => {
    builder = Injector.Sync.createAndResolve(SchemaBuilder, []).get(SchemaBuilder);
  });

  test("create", async () => {

    @ObjectType()
    class User {
      @Field(() => ID)
      id: number;

      @Field()
      firstName: string;

      @Field()
      lastName: string;

      @Field()
      age: number;
    }

    @Resolver(User)
    class UserController {

      @Query(() => [User])
      async users(): Promise<Array<User>> {
        return [];
      }

      @Mutation()
      async addUser(@Arg("user") userArg, @Ctx() user): Promise<User> {
        return null;
      }

      @FieldResolver()
      getUsers(@Root() user: User): Array<User> {
        return [];
      }

      @FieldResolver()
      getUser(@Root() user: User): User {
        return null;
      }
    }

    const schema = await builder.create([UserController]);
    expect(schema).toBeDefined();
  });
});
