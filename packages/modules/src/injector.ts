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
  protected _sharedInjector: Injector = new Injector();
  protected _sharedProviders: Array<IProvider> = [];

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
    const moduleInjector = new ModuleInjector();
    const injector = new Injector(null, mutableKeys);
    injector.set(ModuleInjector, moduleInjector);
    await moduleInjector.createAndResolveSharedProviders(sharedProviders, injector);
    await moduleInjector.createAndResolve(Class, injector, mutableKeys);
    return moduleInjector;
  }

  /**
   * Create and resolve shared providers
   * @param {Array<Function | IProvider>} providers
   * @param {Injector} injector
   */
  async createAndResolveSharedProviders(providers: Array<Function | IProvider>, injector: Injector): Promise<void> {
    this._sharedProviders = shiftLeft(this._sharedProviders, verifyProviders(providers));
    for (const provider of this._sharedProviders) {
      await this._sharedInjector.createAndResolve(provider, [{
        provide: Injector,
        useValue: injector
      }]);
    }
  }

  /**
   * Initialize modules
   * @param {Function | IProvider} Class
   * @param {Injector} parent
   * @param {Array<any>} mutableKeys
   * @returns {Injector}
   */
  async createAndResolve(Class: Function | IProvider, parent: Injector, mutableKeys: Array<any> = []): Promise<void> {
    const provider: IProvider = verifyProvider(Class);
    if (this.has(provider)) {
      throw new Error(`Module ${getProviderName(provider)} is already initialized`);
    }
    const metadata: IMetadata = getClassMetadata(Module, provider.provide);
    const config: IModuleMetadata = metadata.args;
    let moduleProviders: Array<IProvider> = verifyProviders(config.providers);
    const injector = new Injector(parent, mutableKeys);
    moduleProviders = await this.processImportsAndExports(moduleProviders, config, injector);
    // shared must be after import & export is processed
    const sharedProviders = this._sharedProviders.map(sharedProvider => {
      return {
        provide: sharedProvider.provide,
        useValue: this._sharedInjector.get(sharedProvider.provide)
      };
    });
    injector.setName(provider);
    await injector.createAndResolve(provider, shiftLeft(sharedProviders, moduleProviders));
    this._providers.set(provider.provide, injector);
    this._allModulesMetadata.set(provider.provide, config);
  }

  /**
   * Process Module imports
   * @param providers
   * @param config
   * @param injector
   * @private
   */
  private async processImportsAndExports(
    providers: Array<IProvider>,
    config: IModuleMetadata,
    injector: Injector
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
          await this.createAndResolve(importedProvider, injector);
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
