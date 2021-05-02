import {Injectable} from "@typeix/di";
import {AbstractPackageRunner, Dependency} from "./abstract-package-runner";


@Injectable()
export class YarnRunner extends AbstractPackageRunner {
  constructor(args: string[] = []) {
    super("yarn", args);
  }

  public async install(directory: string,  args = "--silent"): Promise<boolean> {
    return await super.pkgInstall("install " + args, directory);
  }

  public async add(dependencies: Array<string>, args = "", tag?: string): Promise<boolean> {
    return await super.pkgProgress("add " + args, dependencies, tag);
  }

  public async update(dependencies: Array<string>, args = "", tag?: string): Promise<boolean> {
    return await super.pkgProgress("upgrade " + args, dependencies, tag);
  }

  public async delete(dependencies: Array<string>, args = "", tag?: string): Promise<boolean> {
    return await super.pkgProgress("remove " + args, dependencies, tag);
  }

  public async list(isDevelopment: false): Promise<Array<Dependency>> {
    return await super.pkgList(isDevelopment);
  }

  public async version(): Promise<string> {
    return await super.pkgVersion();
  }
}
