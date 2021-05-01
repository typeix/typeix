/**
 * @license
 * Copyright nestjs. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/nestjs/schematics/blob/master/LICENSE
 */

import { basename, dirname, Path, relative } from "@angular-devkit/core";

export class PathSolver {
  public relative(from: Path, to: Path): string {
    const placeholder = "/placeholder";
    const relativeDir = relative(
      dirname((placeholder + from) as Path),
      dirname((placeholder + to) as Path)
    );
    return (relativeDir.startsWith(".")
      ? relativeDir
      : "./" + relativeDir
    ).concat(relativeDir.length === 0 ? basename(to) : "/" + basename(to));
  }
}
