import {
  getProviderName,
  Injector,
  IProvider,
  SyncInjector,
  shiftLeft,
  verifyProvider,
  verifyProviders
} from "@typeix/di";
import {isArray} from "@typeix/utils";
import {IModuleMetadata} from "./imodule";
import {Module} from "./module";
import {getClassMetadata, IMetadata} from "@typeix/metadata";
import {AbstractModuleInjector} from "./abstract-module-injector";

/**
 * @since 1.0.0
 * @function
 * @name SyncModuleInjector
 *
 * @description
 * Dependency injector for modules
 *
 */
export class SyncModuleInjector extends AbstractModuleInjector {
  protected _sharedInjector: SyncInjector = new Injector.Sync();
  protected _sharedProviders: Array<IProvider> = [];
  /**
   * Initialize module
   * @param {Function | IProvider} Class
   * @param {Function | IProvider} sharedProviders shared providers
   * @param {Array<any>} mutableKeys keys that can be mutated
   * @returns {ModuleInjector}
   */
  static createAndResolve(Class: Function | IProvider, sharedProviders: Array<Function | IProvider>, mutableKeys: Array<any> = []) {
    let injector = new SyncModuleInjector();
    injector.createAndResolveSharedProviders(sharedProviders);
    injector.createAndResolve(Class, mutableKeys);
    return injector;
  }

  /**
   * Create and resolve shared providers
   * @param {Array<Function | IProvider>} providers
   */
  createAndResolveSharedProviders(providers: Array<Function | IProvider>): void {
    this._sharedProviders = shiftLeft(this._sharedProviders, verifyProviders(providers));
    this._sharedProviders.forEach(provider => {
      this._sharedInjector.createAndResolve(provider, []);
    });
  }

  /**
   * Initialize modules
   * @param {Function | IProvider} Class
   * @param {Array<any>} mutableKeys
   * @returns {Injector}
   */
  createAndResolve(Class: Function | IProvider, mutableKeys: Array<any> = []): void {
    let provider: IProvider = verifyProvider(Class);
    if (this.has(provider)) {
      throw new Error(`Module ${getProviderName(provider)} is already initialized`);
    }
    let metadata: IMetadata = getClassMetadata(Module, provider.provide);
    let config: IModuleMetadata = metadata.args;
    let moduleProviders: Array<IProvider> = verifyProviders(config.providers);
    let injector = new Injector.Sync(null, mutableKeys);
    moduleProviders = this.processImportsAndExports(moduleProviders, config);
    // shared must be after import & export is processed
    let sharedProviders = this._sharedProviders.map(sharedProvider => {
      return {
        provide: sharedProvider.provide,
        useValue: this._sharedInjector.get(sharedProvider.provide)
      };
    });
    injector.setName(provider);
    injector.createAndResolve(provider, shiftLeft(sharedProviders, moduleProviders));
    this._providers.set(provider.provide, injector);
    this._allModulesMetadata.set(provider.provide, config);
  }

  /**
   * Process Module imports
   * @param providers
   * @param config
   * @private
   */
  private processImportsAndExports(providers: Array<IProvider>, config: IModuleMetadata): Array<IProvider> {
    if (isArray(config.imports)) {
      for (let importModule of verifyProviders(config.imports)) {
        let importedProvider: IProvider = verifyProvider(importModule);
        let importedMetadata: IMetadata = getClassMetadata(Module, importedProvider.provide);
        let importedConfig: IModuleMetadata = importedMetadata.args;
        /**
         * Initialize modules recursive, deep traversal
         */
        if (!this.has(importedProvider)) {
          this.createAndResolve(importedProvider);
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
