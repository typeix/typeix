import {AbstractRunner} from "./abstract-runner";
import {Injectable} from "@typeix/di";

@Injectable()
export class YarnRunner extends AbstractRunner {
  constructor(args: string[] = []) {
    super("yarn", args);
  }
}
