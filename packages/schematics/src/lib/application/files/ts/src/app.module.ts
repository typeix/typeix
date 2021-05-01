import {Module} from "@typeix/resty";
import {AppController} from "./app.controller";
import {AppService} from "./app.service";

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
