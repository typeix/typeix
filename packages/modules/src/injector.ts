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

/**
 * @since 1.0.0
 * @function
 * @name ModuleInjector
 *
 * @description
 * Dependency injector for modules
 *
 */
export class ModuleInjector {
  private _allModulesMetadata: Map<any, IModuleMetadata> = new Map();
  private _providers: Map<any, Injector> = new Map();
  private _sharedInjector: Injector = new Injector();
  private _sharedProviders: Array<IProvider> = [];
  /**
   * Initialize module
   * @param {Function | IProvider} Class
   * @param {Function | IProvider} sharedProviders shared providers
   * @param {Array<any>} mutableKeys keys that can be mutated
   * @returns {ModuleInjector}
   */
  static createAndResolve(Class: Function | IProvider, sharedProviders: Array<Function | IProvider>, mutableKeys: Array<any> = []) {
    let injector = new ModuleInjector();
    injector.createAndResolveSharedProviders(sharedProviders);
    injector.createAndResolve(Class, mutableKeys);
    return injector;
  }
  /**
   * Get module instance
   * @param {Function | IProvider} Class
   * @returns {any}
   */
  get(Class: Function | IProvider): any {
    let provider: IProvider = verifyProvider(Class);
    return this.getInjector(provider).get(provider.provide);
  }

  /**
   * Return module injector
   * @param {IProvider | Function} Class
   * @returns {Injector}
   */
  getInjector(Class: Function | IProvider): Injector {
    let provider: IProvider = verifyProvider(Class);
    return this._providers.get(provider.provide);
  }

  /**
   * Check if it has module
   * @param {IProvider | Function} Class
   * @returns {boolean}
   */
  has(Class: IProvider | Function): boolean {
    let provider: IProvider = verifyProvider(Class);
    return this._providers.has(provider.provide);
  }

  /**
   * Remove module
   * @param {Function | IProvider} Class
   * @returns {boolean}
   */
  remove(Class: Function | IProvider): boolean {
    let provider: IProvider = verifyProvider(Class);
    this.getInjector(provider).destroy();
    return this._providers.delete(provider.provide);
  }


  /**
   * Return all metadata
   */
  getAllMetadata(): Map<any, IModuleMetadata>  {
    return this._allModulesMetadata;
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
    let injector: Injector = new Injector(null, mutableKeys);
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
