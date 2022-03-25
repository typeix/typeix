#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const pkgInfo = require(path.join("..", "package.json"));
const commander = require("commander");
const program = new commander.Command("typeix-cli")
const segments = ["dist", "commands"];
const npm_segments = ["node_modules", "@typeix", "cli"];

program
  .version(
    pkgInfo.version,
    "-v, --version",
    "Output the current version."
  )
  .usage("<command> [options]")
  .helpOption("-h, --help", "Output usage information.");

if (packageExists([...npm_segments, ...segments])) {
  loadPackage(program, [...npm_segments, ...segments])
} else if (packageExists(["..",  ...segments])) {
  loadPackage(program, ["..",  ...segments])
} else {
  loadPackage(program, [...segments])
}

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

function packageExists(segments) {
  const pathToLoad = path.normalize(path.join(module.path, ...segments));
  return fs.existsSync(pathToLoad);
}

function loadPackage(commander, segments) {
  const pathToLoad = path.join(module.path, ...segments);
  require(path.normalize(pathToLoad)).setup(commander);
}
