import {isArray, isDefined, isFunction, isTruthy, isUndefined} from "@typeix/utils";
import {
  getProviderName,
  isClassProvider,
  isFactoryProvider,
  isValueProvider,
  ProviderList,
  verifyProvider,
  verifyProviders
} from "./provider";
import {
  IProvider,
  MixedProvider,
  Type,
} from "./interfaces";
import {getAllMetadataForTarget, IMetadata} from "@typeix/metadata";
import {AfterConstruct} from "./after-construct";
import {createInterceptors} from "./method-interceptor";
import {Inject} from "./inject";
import {CreateProvider} from "./create-provider";


function getProviders(provider: IProvider, propertyKey: string): Array<IProvider> {
  const metadata = Injector.getAllMetadataForTarget(provider);
  let paramTypes = metadata.find(item => Injector.designParamComparator(item, propertyKey))?.args ?? [];
  metadata.filter(item => Injector.parameterComparator(item, propertyKey)).forEach(
    item => paramTypes.splice(item.paramIndex, 1, isDefined(item.args.token) ? item.args.token : item.designType)
  );
  return verifyProviders(paramTypes);
}

/**
 * Main injector logic
 */
export class Injector {

  static readonly __actionParams__ = new Map<any, Map<string, Array<IProvider>>>();
  static readonly __metadataCache__ = new Map();
  static readonly __interceptors__: Set<Function> = new Set<Function>();
  private _name: string;
  private _providers: ProviderList;
  private _children: Array<Injector> = [];

  /**
   * Create instance of Injector
   * @param {Injector} _parent
   * @param {Array<any>} keys
   */
  constructor(private _parent?: Injector, keys: Array<any> = []) {
    this._providers = new ProviderList(keys);
    this.set(Injector, this);
  }

  /**
   * designParamComparator
   * @param item
   * @param propertyKey
   */
  static designParamComparator(item, propertyKey = "constructor") {
    return item.metadataKey === "design:paramtypes" && item.propertyKey === propertyKey;
  }

  /**
   * parameterComparator
   * @param item
   * @param propertyKey
   */
  static parameterComparator(item, propertyKey = "constructor") {
    return item.type === "parameter" && item.propertyKey === propertyKey
  }

  /**
   * Return constructor providers
   * @param {IProvider} provider
   * @param {string} propertyKey
   * @returns {Array<IProvider>}
   */
  static getProviders(provider: IProvider, propertyKey = "constructor"): Array<IProvider> {
    if (!isClassProvider(provider)) {
      return [];
    }
    const provide = provider.provide;
    let map = Injector.__actionParams__.has(provide) ? Injector.__actionParams__.get(provide) : new Map();
    if (!map.has(propertyKey)) {
      let providers = getProviders(provider, propertyKey);
      map.set(propertyKey, providers);
      Injector.__actionParams__.set(provide, map);
      return providers;
    }
    return map.get(propertyKey);
  }

  /**
   * Get Metadata for class provider
   * @param provider
   */
  static getAllMetadataForTarget(provider: IProvider): Array<IMetadata> {
    if (Injector.__metadataCache__.has(provider.provide)) {
      return Injector.__metadataCache__.get(provider.provide);
    }
    let providers = getAllMetadataForTarget(provider.useClass);
    Injector.__metadataCache__.set(provider.provide, providers);
    return providers;
  }

  /**
   * Create and resolve child
   * @param {Injector} parent
   * @param {MixedProvider} Class
   * @param {Array<MixedProvider>} providers
   * @returns {Injector}
   */
  static createAndResolveChild(parent: Injector, Class: MixedProvider, providers: Array<MixedProvider>): Injector {
    let child = new Injector(parent);
    let provider = verifyProvider(Class);
    child.setName(provider);
    parent.addChild(child);
    child.createAndResolve(provider, verifyProviders(providers));
    return child;
  }

  /**
   * Create and resolve provider
   * @param {MixedProvider} Class
   * @param {Array<MixedProvider>} providers
   * @returns {Injector}
   */
  static createAndResolve(Class: MixedProvider, providers: Array<MixedProvider>): Injector {
    let injector = new Injector();
    let provider = verifyProvider(Class);
    injector.setName(provider);
    injector.createAndResolve(provider, verifyProviders(providers));
    return injector;
  }

  /**
   * Internal create
   * @param {IProvider} provider
   * @param {Array<IProvider>} providers
   * @returns {any}
   */
  createAndResolve(provider: IProvider, providers: Array<IProvider>): any {
    // create providers passed directly to injector first
    for (let item of providers) {
      this.createAndResolve(item, Injector.getProviders(item));
    }
    // If provider is already resolved return resolved one
    if (this.has(provider.provide)) {
      return this.get(provider.provide, provider.useValue || provider.useClass || provider.useFactory);
    } else if (isValueProvider(provider)) { // check if is use value type
      this.set(provider.provide, provider.useValue);
      return this.get(provider.provide);
      // if it's factory invoke it and set invoked factory as value
    } else if (isFactoryProvider(provider)) {
      return this.createFactory(provider);
    }
    return this.createInstance(provider);
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
  get(provider: string, Class?: IProvider): any;
  get<T>(provider: Type<T>, Class?: IProvider): T;
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
   * @returns {Injector}
   */
  getParent(): Injector {
    return this._parent;
  }

  /**
   * Detach child from parent
   */
  detach(): void {
    if (isDefined(this._parent)) {
      this._parent._children.splice(this._children.indexOf(this), 1);
    }
    this._parent = undefined;
  }

  /**
   * Get all siblings and child siblings by provider
   * @returns {boolean}
   */
  getInjectorsByProvider(provider: IProvider): Injector[] {
    let injectors: Injector[] = [];
    if (this.has(provider.provide)) {
      injectors.push(this);
    }
    if (isArray(this._children)) {
      this._children.forEach(
        child => injectors = injectors.concat(child.getInjectorsByProvider(provider))
      );
    }
    return injectors;
  }

  /**
   * Check if injector has child
   * @param {Injector} injector
   * @returns {boolean}
   */
  hasChild(injector: Injector): boolean {
    return this._children.indexOf(injector) > -1;
  }

  /**
   * Check if injector has parent
   * @returns {boolean}
   */
  setParent(injector: Injector): void {
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
   * @param {Injector} injector
   */
  addChild(injector: Injector): this {
    if (!this.hasChild(injector)) {
      injector.setParent(this);
      this._children.push(injector);
    }
    return this;
  }

  /**
   * Create Factory Provider
   * @param provider
   * @private
   */
  private createFactory(provider: IProvider): any {
    // providers on provider
    if (isArray(provider.providers)) {
      for (let item of verifyProviders(provider.providers)) {
        this.createAndResolve(item, Injector.getProviders(item));
      }
    }
    this.set(
      provider.provide,
      (<IProvider>provider).useFactory.apply(
        null,
        isArray(provider.providers) ? verifyProviders(provider.providers).map(item => this.get(item.provide)) : []
      )
    );
    return this.get(provider.provide);
  }

  /**
   * Create instance from class provider
   * @param provider
   * @private any
   */
  private createInstance(provider: IProvider): any {
    // special case when object needs to be created by injector and inject providers at the same time
    if (isArray(provider.providers)) {
      for (let item of verifyProviders(provider.providers)) {
        this.createAndResolve(item, Injector.getProviders(item));
      }
    }
    // get providers for constructor
    let args = Injector.getProviders(provider);
    // create instance
    let instance = Reflect.construct(
      provider.useClass,
      isArray(args) ? args.map(item => this.get(isDefined(item.provide) ? item.provide : item, item)) : []
    );
    // set inject providers on instance
    const metadata = Injector.getAllMetadataForTarget(provider);
    const decorators: Array<Function> = [Inject, CreateProvider];
    const properties = metadata.filter(item => item.type === "property" && decorators.includes(item.decorator));
    for (const item of properties) {
      const token = isUndefined(item.args.token) ? item.designType : item.args.token;
      const isMutable = item.args.isMutable;
      const propertyKey = item.propertyKey;
      const value = item.decorator === CreateProvider && !this.has(token) ? this.createAndResolve(token, []) : this.get(token, provider);
      Reflect.defineProperty(instance, propertyKey, {
        value,
        writable: isMutable
      });
    }
    // set provider and value
    this.set(provider.provide, instance);
    // prepare interceptors
    createInterceptors(provider, this);
    // create interceptors
    // invoke after construct
    let key = metadata.find(item => item.decorator === AfterConstruct)?.propertyKey ?? "afterConstruct";
    if (isFunction(instance[key])) {
      instance[key].call(instance);
    }
    return instance;
  }
}
