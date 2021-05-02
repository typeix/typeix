import {AbstractRunner} from "./abstract-runner";
import {Injectable} from "@typeix/di";
import {join} from "path";
import * as chalk from "chalk";
import {MESSAGES} from "../../ui";
import {promisify} from "util";
import * as fs from "fs";

@Injectable()
export class GitRunner extends AbstractRunner {
  constructor(args: string[] = []) {
    super("git", args);
  }

  async init(dir: string): Promise<string> {
    return this.run("init", true, join(process.cwd(), dir)).catch(() => {
      console.error(chalk.red(MESSAGES.GIT_INITIALIZATION_ERROR));
      return null;
    });
  }

  async createGitIgnoreFile(dir: string, content?: string) {
    const fileContent = content ?? fs.readFileSync(join(process.cwd(), "gitignore.txt"));
    const filePath = join(process.cwd(), dir, ".gitignore");
    return promisify(fs.writeFile)(filePath, fileContent);
  }
}
