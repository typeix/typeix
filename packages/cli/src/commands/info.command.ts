import {IAfterConstruct, Inject, Injectable} from "@typeix/di";
import * as chalk from "chalk";
import {BANNER} from "../ui";
import osName = require("os-name");
import {platform, release} from "os";
import {CliTools} from "./cli-tools";

@Injectable()
export class InfoCommand implements IAfterConstruct {

  @Inject() cli: CliTools;

  afterConstruct() {
    this.cli.commander()
      .command("info")
      .alias("i")
      .description("Display Typeix project details.")
      .action(() => this.handler());
  }

  private handler() {
    const pkg = require("../../package.json");
    // banner
    console.info(chalk.red(BANNER), "\n");
    // os
    console.info(chalk.green("[System Information]"));
    console.info("OS Version     :", chalk.blue(osName(platform(), release())));
    console.info("NodeJS Version :", chalk.blue(process.version), "\n");
    // version
    console.info(chalk.green("[Typeix CLI]"));
    console.info("Typeix CLI Version :", chalk.blue(pkg.version), "\n");
  }
}
