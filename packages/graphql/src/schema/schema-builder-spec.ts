import {SchemaBuilder} from "./schema-builder";
import {Injector} from "@typeix/di";
import {Resolver} from "../decorators/resolver.decorator";
import {ObjectType} from "../decorators/object-type.decorator";
import {Field} from "../decorators/field.decorator";
import {ID} from "../types";
import {Query} from "../decorators/query.decorator";

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
    }

    const schema = await builder.create([UserController]);
    expect(schema).toBeDefined();
  });
});
