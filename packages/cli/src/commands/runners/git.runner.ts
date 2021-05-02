import {AbstractRunner} from "./abstract-runner";
import {Injectable} from "@typeix/di";


@Injectable()
export class GitRunner extends AbstractRunner {
  constructor(args: string[] = []) {
    super("git", args);
  }
}
