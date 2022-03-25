import {Injectable} from "@typeix/di";
import {ChildProcess, spawn, SpawnOptions} from "child_process";
import {MESSAGES, chalk} from "../../ui";

@Injectable()
export abstract class AbstractRunner {

  protected constructor(protected binary: string, protected args: string[] = []) {}

  public async run(command: string, collect = false, cwd: string = process.cwd()): Promise<Buffer> {
    const args: string[] = [command];
    const options: SpawnOptions = {
      cwd,
      stdio: collect ? "pipe" : "inherit",
      shell: true
    };
    const child: ChildProcess = spawn(
      `${this.binary}`,
      [...this.args, ...args],
      options
    );
    return new Promise<Buffer>((resolve, reject) => {
      const data = [], error = [];
      if (collect) {
        child.stdout.on("data", chunk => data.push(chunk));
        child.stderr.on("data", chunk => error.push(chunk));
      }
      child.on("close", code => {
        if (code === 0) {
          resolve(Buffer.concat(data));
        } else {
          console.error(
            chalk.red(
              MESSAGES.RUNNER_EXECUTION_ERROR(`${this.binary} ${command}`)
            )
          );
          reject(Buffer.concat(error));
        }
      });
    });
  }
}
