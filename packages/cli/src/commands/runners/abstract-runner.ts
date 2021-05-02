import {Inject, Injectable} from "@typeix/di";
import {ChildProcess, spawn, SpawnOptions} from "child_process";
import {MESSAGES} from "../../ui";
import * as chalk from "chalk";
import * as ora from "ora";
import {join} from "path";
import {dasherize} from "@angular-devkit/core/src/utils/strings";
import {CliTools} from "../cli-tools";
import {isDefined} from "@typeix/utils";

export interface Dependency {
  name: string;
  version: string;
}

const frames = ["▹▹▹▹▹", "▸▹▹▹▹", "▹▸▹▹▹", "▹▹▸▹▹", "▹▹▹▸▹", "▹▹▹▹▸"];
const interval = 120;

@Injectable()
export abstract class AbstractRunner {

  @Inject() cli: CliTools;

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
    return new Promise<null | string>((resolve, reject) => {
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

  protected async pkgInstall(command: string, directory: string, packageManager: string): Promise<boolean> {
    const spinner = ora({
      spinner: {
        interval,
        frames
      },
      text: MESSAGES.PACKAGE_MANAGER_INSTALLATION_IN_PROGRESS
    });
    spinner.start();
    try {
      await this.run(
        command,
        true,
        join(process.cwd(), dasherize(directory))
      );
      spinner.succeed();
      console.info();
      console.info(MESSAGES.PACKAGE_MANAGER_INSTALLATION_SUCCEED(directory));
      console.info(MESSAGES.GET_STARTED_INFORMATION);
      console.info();
      console.info(chalk.gray(MESSAGES.CHANGE_DIR_COMMAND(directory)));
      console.info(chalk.gray(MESSAGES.START_COMMAND(packageManager)));
      console.info();
      return true;
    } catch {
      spinner.fail();
      console.error(chalk.red(MESSAGES.PACKAGE_MANAGER_INSTALLATION_FAILED));
      return false;
    }
  }

  protected async pkgProgress(command: string, dependencies: Array<string>, tag?: string): Promise<boolean> {
    const spinner = ora({
      spinner: {
        interval,
        frames
      },
      text: MESSAGES.PACKAGE_MANAGER_INSTALLATION_IN_PROGRESS
    });
    spinner.start();
    try {
      const args: string = isDefined(tag) ? dependencies.map(dependency => `${dependency}@${tag}`).join(" ") : dependencies.join(" ");
      await this.run(`${command} ${args}`, true);
      spinner.succeed();
      return true;
    } catch {
      spinner.fail();
      return false;
    }
  }

  protected async pkgList(isDevelopment = false): Promise<Array<Dependency>> {
    const packageJsonContent = await this.cli.getProjectPackage();
    const packageJsonDependencies: any = isDevelopment ? packageJsonContent.devDependencies : packageJsonContent.dependencies;
    const dependencies = [];
    for (const [name, version] of Object.entries(packageJsonDependencies)) {
      dependencies.push({name, version});
    }
    return dependencies;
  }

  protected async pkgVersion(): Promise<string> {
    return await this.run("--version", true);
  }
}
