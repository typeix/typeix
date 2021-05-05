import {AppController} from "./app.controller";
import {AppService} from "./app.service";
import {Logger, RootModule} from "@typeix/resty/build";

@RootModule({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
  shared_providers: [
    {
      provide: Logger,
      useFactory: () => {
        return new Logger({
          options: {
            level: "info"
          }
        });
      }
    }
  ]
})
export class AppModule {
}
