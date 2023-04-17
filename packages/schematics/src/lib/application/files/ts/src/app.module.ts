import {Logger, RootModule} from "@typeix/resty";
import {AppController} from "./app.controller";
import {AppService} from "./app.service";

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
            transport: {
              target: "pino-pretty",
              options: {
                colorize: true
              }
            }
          }
        });
      }
    }
  ]
})
export class AppModule {
}
