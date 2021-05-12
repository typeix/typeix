import {
  getProviderName,
  Injector,
  IProvider,
  shiftLeft,
  verifyProvider,
  verifyProviders
} from "@typeix/di";
import {isArray} from "@typeix/utils";
import {IModuleMetadata} from "./imodule";
import {Module} from "./module";
import {getClassMetadata, IMetadata} from "@typeix/metadata";
import {AbstractModuleInjector} from "./abstract-module-injector";
import {SyncModuleInjector} from "./sync-injector";

/**
 * @since 1.0.0
 * @function
 * @name ModuleInjector
 *
 * @description
 * Dependency injector for modules
 *
 */
export class ModuleInjector extends AbstractModuleInjector<Injector> {

  static Sync: typeof SyncModuleInjector = SyncModuleInjector;

  /**
   * Initialize module
   * @param {Function | IProvider} Class
   * @param {Function | IProvider} sharedProviders shared providers
   * @param {Array<any>} mutableKeys keys that can be mutated
   * @returns {ModuleInjector}
   */
  static async createAndResolve(
    Class: Function | IProvider,
    sharedProviders: Array<Function | IProvider>,
    mutableKeys: Array<any> = []
  ): Promise<ModuleInjector> {
    const injector = new ModuleInjector();
    const sharedInjector = await injector.createAndResolveSharedProviders(sharedProviders);
    await injector.createAndResolve(Class, sharedInjector, mutableKeys);
    return injector;
  }

  /**
   * Create and resolve shared providers
   * @param {Array<Function | IProvider>} providers
   */
  async createAndResolveSharedProviders(providers: Array<Function | IProvider>): Promise<Injector> {
    const injector: Injector = new Injector();
    injector.set(ModuleInjector, this);
    for (const provider of verifyProviders(providers)) {
      await injector.createAndResolve(provider, []);
    }
    return injector;
  }

  /**
   * Initialize modules
   * @param {Function | IProvider} Class
   * @param {Injector} sharedInjector
   * @param {Array<any>} mutableKeys
   * @returns {Injector}
   */
  async createAndResolve(Class: Function | IProvider, sharedInjector: Injector, mutableKeys: Array<any> = []): Promise<Injector> {
    const provider: IProvider = verifyProvider(Class);
    if (this.has(provider)) {
      throw new Error(`Module ${getProviderName(provider)} is already initialized`);
    }
    const metadata: IMetadata = getClassMetadata(Module, provider.provide);
    const config: IModuleMetadata = metadata.args;
    let moduleProviders: Array<IProvider> = verifyProviders(config.providers);
    const injector = new Injector(sharedInjector, mutableKeys);
    moduleProviders = await this.processImportsAndExports(moduleProviders, config, sharedInjector, mutableKeys);
    // shared must be after import & export is processed
    injector.setName(provider);
    await injector.createAndResolve(provider, moduleProviders);
    this._providers.set(provider.provide, injector);
    this._allModulesMetadata.set(provider.provide, config);
    return injector;
  }

  /**
   * Process Module imports
   * @param providers
   * @param config
   * @param sharedInjector
   * @param mutableKeys
   * @private
   */
  private async processImportsAndExports(
    providers: Array<IProvider>,
    config: IModuleMetadata,
    sharedInjector: Injector,
    mutableKeys: Array<any> = []
  ): Promise<Array<IProvider>> {
    if (isArray(config.imports)) {
      for (const importModule of verifyProviders(config.imports)) {
        const importedProvider: IProvider = verifyProvider(importModule);
        const importedMetadata: IMetadata = getClassMetadata(Module, importedProvider.provide);
        const importedConfig: IModuleMetadata = importedMetadata.args;
        /**
         * Initialize modules recursive, deep traversal
         */
        if (!this.has(importedProvider)) {
          await this.createAndResolve(importedProvider, sharedInjector, mutableKeys);
        }
        if (isArray(importedConfig.exports)) {
          providers = shiftLeft(
            providers,
            verifyProviders(importedConfig.exports).map((exportedProvider: IProvider) => {
              return {
                provide: exportedProvider.provide,
                useValue: this.getInjector(importedProvider).get(exportedProvider.provide)
              };
            })
          );
        }
      }
    }
    return providers;
  }
}
