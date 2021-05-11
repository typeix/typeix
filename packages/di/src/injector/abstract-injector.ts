import {IProvider, Type} from "../interfaces";
import {
  getProviderName,
  ProviderList
} from "../helpers/provider";
import {isArray, isDefined, isTruthy, isUndefined} from "@typeix/utils";

interface InjectorImpl {
  getInjectorsByProvider(provider: IProvider): Array<InjectorImpl>;
  getChildren(): Array<InjectorImpl>;
  setParent(injector: InjectorImpl): void;
  get(provider: string, Class?: IProvider): any;
  get<P>(provider: Type<P>, Class?: IProvider): P;
}
/**
 * Main injector logic
 */
export abstract class AbstractInjector<T extends InjectorImpl> implements InjectorImpl {
  protected _name: string;
  protected _providers: ProviderList;
  protected _children: Array<InjectorImpl> = [];

  protected constructor(protected _parent?: T, keys: Array<any> = []) {
    this._providers = new ProviderList(keys);
  }

  /**
   * Get children
   */
  getChildren(): Array<InjectorImpl> {
    return this._children;
  }

  /**
   * Detach child from parent
   */
  detach(): void {
    if (isDefined(this._parent)) {
      const childIndex = this.getChildren().indexOf(this);
      this._parent.getChildren().splice(childIndex, 1);
    }
    this._parent = undefined;
  }

  /**
   * Destroy injector to clean up references internally
   */
  destroy(): void {
    this.detach();
    this._providers.clear();
    this._children = [];
  }

  /**
   * Check if provider exists in injector
   * @param key
   * @returns {boolean}
   */
  has(key: any): boolean {
    return this._providers.has(key);
  }

  /**
   * Get provider by key
   * @param provider
   * @param {IProvider} Class
   * @returns {any}
   */
  get(provider: any, Class?: IProvider): any {
    if (this.has(provider)) {
      return this._providers.get(provider);
    } else if (isDefined(this._parent)) {
      return this._parent.get(provider, Class);
    }
    if (isDefined(Class) && isDefined(provider)) {
      throw new Error([
        `No provider ${getProviderName(provider) ?? Class}`,
        `on class ${getProviderName(Class)}`,
        `on provider ${this._name}`
      ].join(" "));
    }
    throw new Error([
      `No provider ${getProviderName(provider) ?? Class}`,
      `on provider ${this._name}`
    ].join(" "));
  }

  /**
   * Set provider by key
   * @param key
   * @param {Object} value
   */
  set(key: any, value: Object): void {
    this._providers.set(key, value);
  }

  /**
   * Get parent injector
   * @returns {InjectorImpl}
   */
  getParent(): T {
    return this._parent;
  }

  /**
   * Check if injector has child
   * @param {InjectorImpl} injector
   * @returns {boolean}
   */
  hasChild(injector: T): boolean {
    return this._children.indexOf(injector) > -1;
  }

  /**
   * Check if injector has parent
   * @returns {boolean}
   */
  setParent(injector: T): void {
    if (isTruthy(this._parent) && this._parent !== injector) {
      throw new Error(`Cannot redefine parent for injector: ${this._name}`);
    }
    this._parent = injector;
  }

  /**
   * Check if name is provided
   */
  hasName() {
    return isDefined(this._name);
  }

  /**
   * Set provider name
   * @param {IProvider} provider
   */
  setName(provider: IProvider): void {
    if (isUndefined(this._name)) {
      this._name = getProviderName(provider);
    } else {
      throw new Error(
        [
          `Cannot redefine injector name: ${this._name},`,
          `provider: ${getProviderName(provider)}`
        ].join(" ")
      );
    }
  }

  /**
   * Set set injector child
   * @param {InjectorImpl} injector
   */
  addChild(injector: T): this {
    if (!this.hasChild(injector)) {
      injector.setParent(this);
      this._children.push(injector);
    }
    return this;
  }

  /**
   * Get all siblings and child siblings by provider
   * @returns {boolean}
   */
  getInjectorsByProvider(provider: IProvider): Array<InjectorImpl> {
    let injectors: Array<InjectorImpl> = [];
    if (this.has(provider.provide)) {
      injectors.push(this);
    }
    if (isArray(this._children)) {
      this._children.forEach(
        child => {
          injectors = injectors.concat(child.getInjectorsByProvider(provider));
        }
      );
    }
    return injectors;
  }

  /**
   * Internal create
   * @param {IProvider} provider
   * @param {Array<IProvider>} providers
   * @returns {any}
   */
  abstract createAndResolve(provider: IProvider, providers: Array<IProvider>): any;

}
