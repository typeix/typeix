import {IProvider, verifyProvider} from "@typeix/di";
import {IModuleMetadata} from "./imodule";
import {Type} from "../../di/src/interfaces";

interface InjectorImpl {
  get(provider: string, Class?: IProvider): any;
  get<P>(provider: Type<P>, Class?: IProvider): P;
  destroy(): void;
}
/**
 * @since 1.0.0
 * @function
 * @name AbstractModuleInjector
 *
 * @description
 * Dependency injector for modules
 *
 */
export class AbstractModuleInjector<T extends InjectorImpl> {
  protected _allModulesMetadata: Map<any, IModuleMetadata> = new Map();
  protected _providers: Map<any, T> = new Map();
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
  getInjector(Class: Function | IProvider): T {
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
}
