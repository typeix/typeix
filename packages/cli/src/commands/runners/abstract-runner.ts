import {Injectable} from "@typeix/di";
import {ChildProcess, spawn, SpawnOptions} from "child_process";
import {MESSAGES} from "../../ui";
import * as chalk from "chalk";

@Injectable()
export abstract class AbstractRunner {
  protected constructor(protected binary: string, protected args: string[] = []) {
  }

  public async run(command: string, collect = false, cwd: string = process.cwd()): Promise<null | string> {
    const args: string[] = [command];
    const options: SpawnOptions = {
      cwd,
      stdio: collect ? "pipe" : "inherit",
      shell: true
    };
    const child: ChildProcess = spawn(
      this.binary,
      [...this.args, ...args],
      options
    );
    return await new Promise<null | string>((resolve, reject) => {
      if (collect) {
        child.stdout!.on("data", (data) =>
          resolve(data.toString().replace(/\r\n|\n/, ""))
        );
      }
      child.on("close", (code) => {
        if (code === 0) {
          resolve(null);
        } else {
          console.error(
            chalk.red(
              MESSAGES.RUNNER_EXECUTION_ERROR(`${this.binary} ${command}`)
            )
          );
          reject();
        }
      });
    });
  }
}
