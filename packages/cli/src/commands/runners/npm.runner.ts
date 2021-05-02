import {AbstractRunner} from "./abstract-runner";
import {Injectable} from "@typeix/di";

@Injectable()
export class NpmRunner extends AbstractRunner {
  constructor(args: string[] = []) {
    super("npm", args);
  }
}
