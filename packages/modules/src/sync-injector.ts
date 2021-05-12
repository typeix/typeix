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
  /**
   * Initialize module
   * @param {Function | IProvider} Class
   * @param {Function | IProvider} sharedProviders shared providers
   * @param {Array<any>} mutableKeys keys that can be mutated
   * @returns {ModuleInjector}
   */
  static createAndResolve(Class: Function | IProvider, sharedProviders: Array<Function | IProvider>, mutableKeys: Array<any> = []) {
    const injector = new SyncModuleInjector();
    const sharedInjector = injector.createAndResolveSharedProviders(sharedProviders);
    injector.createAndResolve(Class, sharedInjector, mutableKeys);
    return injector;
  }

  /**
   * Create and resolve shared providers
   * @param {Array<Function | IProvider>} providers
   */
  createAndResolveSharedProviders(providers: Array<Function | IProvider>): SyncInjector {
    const injector: SyncInjector = new Injector.Sync();
    injector.set(ModuleInjector, this);
    for (const provider of verifyProviders(providers)) {
      injector.createAndResolve(provider, []);
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
  createAndResolve(Class: Function | IProvider, sharedInjector: SyncInjector, mutableKeys: Array<any> = []): void {
    const provider: IProvider = verifyProvider(Class);
    if (this.has(provider)) {
      throw new Error(`Module ${getProviderName(provider)} is already initialized`);
    }
    const metadata: IMetadata = getClassMetadata(Module, provider.provide);
    const config: IModuleMetadata = metadata.args;
    let moduleProviders: Array<IProvider> = verifyProviders(config.providers);
    const injector = new Injector.Sync(sharedInjector, mutableKeys);
    moduleProviders = this.processImportsAndExports(moduleProviders, config, sharedInjector, mutableKeys);
    // create local module injector
    injector.setName(provider);
    injector.createAndResolve(provider, moduleProviders);
    this._providers.set(provider.provide, injector);
    this._allModulesMetadata.set(provider.provide, config);
  }

  /**
   * Process Module imports
   * @param providers
   * @param config
   * @param sharedInjector
   * @param mutableKeys
   * @private
   */
  private processImportsAndExports(
    providers: Array<IProvider>,
    config: IModuleMetadata,
    sharedInjector: SyncInjector,
    mutableKeys: Array<any> = []
  ): Array<IProvider> {
    if (isArray(config.imports)) {
      for (const importModule of verifyProviders(config.imports)) {
        const importedProvider: IProvider = verifyProvider(importModule);
        const importedMetadata: IMetadata = getClassMetadata(Module, importedProvider.provide);
        const importedConfig: IModuleMetadata = importedMetadata.args;
        /**
         * Initialize modules recursive, deep traversal
         */
        if (!this.has(importedProvider)) {
          this.createAndResolve(importedProvider, sharedInjector, mutableKeys);
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
