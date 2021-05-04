import * as chalk from "chalk";
import { EMOJIS } from "./emojis";

/**
 * Prefixes
 */
export const PREFIXES = {
  ERROR: chalk.bgRgb(210, 0, 75).bold.rgb(0, 0, 0)(" Error "),
  INFO: chalk.bgRgb(60, 190, 100).bold.rgb(0, 0, 0)(" Info ")
};

/**
 * General info messages
 */
export const MESSAGES = {
  AVAILABLE_COMMANDS: `See ${chalk.red("--help")} for a list of available commands.\n`,
  PROJECT_SELECTION_QUESTION: "Which project would you like to generate to?",
  LIBRARY_PROJECT_SELECTION_QUESTION:
    "Which project would you like to add the library to?",
  DRY_RUN_MODE: "Command has been executed in dry run mode, nothing changed!",
  PROJECT_INFORMATION_START: `${EMOJIS.ZAP}  We will scaffold your app in a few seconds..`,
  RUNNER_EXECUTION_ERROR: (command: string) => `\nFailed to execute command: ${command}`,
  PACKAGE_MANAGER_QUESTION: `Which package manager would you ${EMOJIS.HEART}  to use?`,
  PACKAGE_MANAGER_INSTALLATION_IN_PROGRESS: `Installation in progress... ${EMOJIS.COFFEE}`,
  GIT_INITIALIZATION_ERROR: "Git repository has not been initialized",
  PACKAGE_MANAGER_INSTALLATION_SUCCEED: (name: string) =>
    name !== "."
      ? `${EMOJIS.ROCKET}  Successfully created project ${chalk.green(name)}`
      : `${EMOJIS.ROCKET}  Successfully created a new project`,
  GET_STARTED_INFORMATION: `${EMOJIS.POINT_RIGHT}  Get started with the following commands:`,
  CHANGE_DIR_COMMAND: (name: string) => `$ cd ${name}`,
  START_COMMAND: (name: string) => `$ ${name} run start`,
  PACKAGE_MANAGER_INSTALLATION_FAILED: `${EMOJIS.SCREAM}  Packages installation failed:`,
  // tslint:disable-next-line:max-line-length
  INFORMATION_PACKAGE_MANAGER_FAILED: `${EMOJIS.SMIRK}  cannot read your project package.json file, are you inside your project directory?`,
  INFORMATION_CLI_MANAGER_FAILED: `${EMOJIS.SMIRK}  cannot read your project "Typeix CLI" file, are you inside your project directory?`,
  LIBRARY_INSTALLATION_FAILED_BAD_PACKAGE: (name: string) =>
    `Unable to install package ${name}. Please check package name.`,
  MISSING_TYPESCRIPT_PATH: (path: string) =>
    [
      "Could not find TypeScript configuration file in path: " +
      path + "\n" +
      "Please, ensure that you are running this command " +
      "in the appropriate directory (inside Typeix workspace)."
    ].join(""),
  INVALID_COMMAND: `\n${PREFIXES.ERROR} Invalid command: ${chalk.red("%s")}`
};
