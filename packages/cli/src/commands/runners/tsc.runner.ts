import {AbstractRunner} from "./abstract-runner";
import {Injectable} from "@typeix/di";
import {join} from "path";

@Injectable()
export class TscRunner extends AbstractRunner {
  constructor(args: string[] = []) {
    super("tsc", args);
  }

  async exec(args = "", dir = ""): Promise<Buffer> {
    return super.run(args, true, join(process.cwd(), dir));
  }

}
