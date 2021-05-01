import { Controller } from "@typeix/resty";

@Controller({
  path: "/<%= dasherize(name) %>"
})
export class <%= classify(name) %>Controller {}
