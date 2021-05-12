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
import {ModuleInjector} from "./injector";

/**
 * @since 1.0.0
 * @function
 * @name SyncModuleInjector
 *
 * @description
 * Dependency injector for modules
 *
 */
export class SyncModuleInjector extends AbstractModuleInjector<SyncInjector> {
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
    const moduleInjector = new SyncModuleInjector();
    const injector = new Injector.Sync(null, mutableKeys);
    injector.set(ModuleInjector, moduleInjector);
    moduleInjector.createAndResolveSharedProviders(sharedProviders, injector);
    moduleInjector.createAndResolve(Class, injector, mutableKeys);
    return moduleInjector;
  }

  /**
   * Create and resolve shared providers
   * @param {Array<Function | IProvider>} providers
   * @param {SyncInjector} injector
   */
  createAndResolveSharedProviders(providers: Array<Function | IProvider>, injector: SyncInjector): void {
    this._sharedProviders = shiftLeft(this._sharedProviders, verifyProviders(providers));
    this._sharedProviders.forEach(provider => {
      this._sharedInjector.createAndResolve(provider, [{
        provide: Injector,
        useValue: injector
      }]);
    });
  }

  /**
   * Initialize modules
   * @param {Function | IProvider} Class
   * @param {Injector} parent
   * @param {Array<any>} mutableKeys
   * @returns {Injector}
   */
  createAndResolve(Class: Function | IProvider, parent: SyncInjector, mutableKeys: Array<any> = []): void {
    const provider: IProvider = verifyProvider(Class);
    if (this.has(provider)) {
      throw new Error(`Module ${getProviderName(provider)} is already initialized`);
    }
    const metadata: IMetadata = getClassMetadata(Module, provider.provide);
    const config: IModuleMetadata = metadata.args;
    let moduleProviders: Array<IProvider> = verifyProviders(config.providers);
    const injector = new Injector.Sync(parent, mutableKeys);
    // create local module injector
    moduleProviders = this.processImportsAndExports(moduleProviders, config, injector);
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
   * @param injector
   * @private
   */
  private processImportsAndExports(providers: Array<IProvider>, config: IModuleMetadata, injector: SyncInjector): Array<IProvider> {
    if (isArray(config.imports)) {
      for (const importModule of verifyProviders(config.imports)) {
        const importedProvider: IProvider = verifyProvider(importModule);
        const importedMetadata: IMetadata = getClassMetadata(Module, importedProvider.provide);
        const importedConfig: IModuleMetadata = importedMetadata.args;
        /**
         * Initialize modules recursive, deep traversal
         */
        if (!this.has(importedProvider)) {
          this.createAndResolve(importedProvider, injector);
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
