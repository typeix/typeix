import {Injectable} from "@typeix/di";
import {AbstractPackageRunner, Dependency} from "./abstract-package-runner";

@Injectable()
export class NpmRunner extends AbstractPackageRunner {
  constructor(args: string[] = []) {
    super("npm", args);
  }

  public async install(directory: string,  args = ""): Promise<Buffer> {
    return await super.pkgInstall("install " + args, directory);
  }

  public async add(dependencies: string, args = "--save"): Promise<Buffer> {
    return await super.pkgProgress("install " + args, dependencies);
  }

  public async update(dependencies: string, args = "--save"): Promise<Buffer> {
    return await super.pkgProgress("update " + args, dependencies);
  }

  public async delete(dependencies: string, args = "--save"): Promise<Buffer> {
    return await super.pkgProgress("uninstall " + args, dependencies);
  }

  public async upgrade(dependencies: string, args = ""): Promise<Buffer> {
    const deletedResult = await this.delete(dependencies, args);
    const installedResult = await this.add(dependencies, args);
    return Buffer.concat([deletedResult, installedResult]);
  }

  public async list(isDevelopment = false): Promise<Array<Dependency>> {
    return await super.pkgList(isDevelopment);
  }

  public async version(): Promise<Buffer> {
    return await super.pkgVersion();
  }
}
