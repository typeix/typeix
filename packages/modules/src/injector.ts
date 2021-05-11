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
export class ModuleInjector extends AbstractModuleInjector{

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
    let injector = new ModuleInjector();
    await injector.createAndResolveSharedProviders(sharedProviders);
    await injector.createAndResolve(Class, mutableKeys);
    return injector;
  }

  /**
   * Create and resolve shared providers
   * @param {Array<Function | IProvider>} providers
   */
  async createAndResolveSharedProviders(providers: Array<Function | IProvider>): Promise<void> {
    this._sharedProviders = shiftLeft(this._sharedProviders, verifyProviders(providers));
    for (const provider of this._sharedProviders) {
      await this._sharedInjector.createAndResolve(provider, []);
    }
  }

  /**
   * Initialize modules
   * @param {Function | IProvider} Class
   * @param {Array<any>} mutableKeys
   * @returns {Injector}
   */
  async createAndResolve(Class: Function | IProvider, mutableKeys: Array<any> = []): Promise<void> {
    let provider: IProvider = verifyProvider(Class);
    if (this.has(provider)) {
      throw new Error(`Module ${getProviderName(provider)} is already initialized`);
    }
    let metadata: IMetadata = getClassMetadata(Module, provider.provide);
    let config: IModuleMetadata = metadata.args;
    let moduleProviders: Array<IProvider> = verifyProviders(config.providers);
    let injector: Injector = new Injector(null, mutableKeys);
    moduleProviders = await this.processImportsAndExports(moduleProviders, config);
    // shared must be after import & export is processed
    let sharedProviders = this._sharedProviders.map(sharedProvider => {
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
   * @private
   */
  private async processImportsAndExports(providers: Array<IProvider>, config: IModuleMetadata): Promise<Array<IProvider>> {
    if (isArray(config.imports)) {
      for (let importModule of verifyProviders(config.imports)) {
        let importedProvider: IProvider = verifyProvider(importModule);
        let importedMetadata: IMetadata = getClassMetadata(Module, importedProvider.provide);
        let importedConfig: IModuleMetadata = importedMetadata.args;
        /**
         * Initialize modules recursive, deep traversal
         */
        if (!this.has(importedProvider)) {
          await this.createAndResolve(importedProvider);
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
