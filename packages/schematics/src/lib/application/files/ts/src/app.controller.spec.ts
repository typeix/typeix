import {Injector} from "@typeix/resty";
import {AppController} from "./app.controller";
import {AppService} from "./app.service";

describe("AppController", () => {
  let appController: AppController;

  beforeEach(async () => {
    const injector = await Injector.createAndResolve(AppController, [AppService]);
    appController = injector.get(AppController);
  });

  describe("root", () => {
    it("should return Hello World!", () => {
      expect(appController.getHello()).toBe("Hello World!");
    });
  });
});
