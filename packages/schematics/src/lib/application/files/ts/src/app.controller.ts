import {Controller, Inject, GET} from "@typeix/resty";
import {AppService} from "./app.service";

@Controller({
  path: "/",
  providers: [],
  interceptors: []
})
export class AppController {

  @Inject() appService: AppService;

  @GET()
  getHello(): string {
    return this.appService.getHello();
  }
}
