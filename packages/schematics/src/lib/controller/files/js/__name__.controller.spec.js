import {Injector} from "@typeix/resty";
import { <%= classify(name) %>Controller } from "./<%= name %>.controller";

describe("<%= classify(name) %>Controller", () => {

  let controller;

  beforeEach(async () => {
    const injector = Injector.createAndResolve(<%= classify(name) %>Controller, []);
    controller = injector.get(<%= classify(name) %>Controller);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
