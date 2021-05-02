import {AbstractRunner} from "./abstract-runner";
import {Inject, Injectable} from "@typeix/di";
import {CliTools} from "../cli-tools";
import * as ora from "ora";
import {MESSAGES} from "../../ui";
import {join} from "path";
import {dasherize} from "@angular-devkit/core/src/utils/strings";
import * as chalk from "chalk";

const frames = ["▹▹▹▹▹", "▸▹▹▹▹", "▹▸▹▹▹", "▹▹▸▹▹", "▹▹▹▸▹", "▹▹▹▹▸"];
const interval = 120;

export interface Dependency {
  name: string;
  version: string;
}

@Injectable()
export abstract class AbstractPackageRunner extends AbstractRunner {

  @Inject() cli: CliTools;

  protected async pkgInstall(command: string, directory: string): Promise<Buffer> {
    const spinner = ora({
      spinner: {
        interval,
        frames
      },
      text: MESSAGES.PACKAGE_MANAGER_INSTALLATION_IN_PROGRESS
    });
    spinner.start();
    try {
      const result = await this.run(
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
      console.info(chalk.gray(MESSAGES.START_COMMAND(this.binary)));
      console.info();
      return result;
    } catch (e) {
      spinner.fail();
      console.error(chalk.red(MESSAGES.PACKAGE_MANAGER_INSTALLATION_FAILED));
      return Promise.reject(e);
    }
  }

  protected async pkgProgress(command: string, dependencies: string): Promise<Buffer> {
    const spinner = ora({
      spinner: {
        interval,
        frames
      },
      text: MESSAGES.PACKAGE_MANAGER_INSTALLATION_IN_PROGRESS
    });
    spinner.start();
    try {
      const result = await this.run(`${command} ${dependencies}`, true);
      spinner.succeed();
      return result;
    } catch (e) {
      spinner.fail();
      return Promise.reject(e);
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

  protected async pkgVersion(): Promise<Buffer> {
    return await this.run("--version", true);
  }
}
