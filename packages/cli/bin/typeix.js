"use strict";

const fs = require("fs");
const path = require("path");
const pkgInfo = require("../package.json");
const program = require("commander");

const segments = ["build", "commands"];
const npm_segments = ["node_modules", "@typeix", "cli"];

program
  .version(
    pkgInfo.version,
    "-v, --version",
    "Output the current version."
  )
  .usage("<command> [options]")
  .helpOption("-h, --help", "Output usage information.");

if (fs.existsSync(path.join(process.cwd(), ...npm_segments, ...segments))) {
  const pkg = require(path.posix.join(process.cwd(), ...npm_segments, ...segments));
  pkg.setup(program);
} else {
  const pkg = require(path.posix.join(process.cwd(), ...segments));
  pkg.setup(program);
}

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
