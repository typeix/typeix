/**
 * @license
 * Copyright nestjs. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/nestjs/schematics/blob/master/LICENSE
 */

import { MetadataManager } from "./metadata.manager";
import { DeclarationOptions } from "./module.declarator";

export class ModuleMetadataDeclarator {
  public declare(content: string, options: DeclarationOptions): string {
    const manager = new MetadataManager(content);
    const inserted = manager.insert(
      options.metadata,
      options.symbol,
      options.staticOptions
    );
    return inserted ?? content;
  }
}
