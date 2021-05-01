import {Controller, Inject, GET} from "@typeix/resty";
import {AppService} from './app.service';

@Controller({
  path: "/",
  providers: [],
  interceptors: []
})
export class AppController {

  @Inject(AppService) appService;

  @GET()
  getHello() {
    return this.appService.getHello();
  }
}
