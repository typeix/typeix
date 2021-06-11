import {Module} from "@typeix/modules";
import {SchemaBuilder} from "./schema-builder";


@Module({
  providers: [SchemaBuilder]
})
export class GraphqlModule {

}
