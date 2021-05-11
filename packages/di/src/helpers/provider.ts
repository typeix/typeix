import {
  isArray,
  isDefined,
  isFalsy,
  isFunction,
  isObject,
  isString
} from "@typeix/utils";
import {IProvider, MixedProvider} from "../interfaces";

/**
 * Get name of provider or class
 * @param Class
 * @returns {string}
 */
export function getProviderName(Class: any): string {
  if (isObject(Class) && (isFactoryProvider(Class) || isClassProvider(Class) || isValueProvider(Class))) {
    return getProviderName(Class.provide);
  } if (isFunction(Class)) {
    return !!Class.name ? Class.name : "Function";
  }
  return isString(Class) ? Class : null;
}


/**
 * Merge providers, source will be shifted right, and target copied into source if element does not exist in source
 * @param {Array<IProvider>} source
 * @param {Array<IProvider>} target
 * @returns {IProvider[]}
 */
export function shiftRight(source: Array<IProvider>, target: Array<IProvider>) {
  return target.filter((bI: IProvider) => isFalsy(source.find((aI: IProvider) => aI.provide === bI.provide))).concat(source);
}

/**
 * Merge providers, source will be shifted left, and target copied into source if element does not exist in source
 * @param {Array<IProvider>} source
 * @param {Array<IProvider>} target
 * @returns {IProvider[]}
 */
export function shiftLeft(source: Array<IProvider>, target: Array<IProvider>) {
  return source.concat(target.filter((bI: IProvider) =>
    isFalsy(source.find((aI: IProvider) => aI.provide === bI.provide))
  ));
}

/**
 * Verify provider
 * @param value
 * @returns {IProvider}
 */

// eslint-disable-next-line no-redeclare
export function verifyProvider(value: MixedProvider): IProvider {
  if (isFunction(value)) {
    return <IProvider>{
      provide: value,
      useClass: value
    };
  }
  return <IProvider>value;
}

/**
 * Verify providers
 * @param {Array<any>} providers
 * @returns {Array<IProvider>}
 */
export function verifyProviders(providers: Array<MixedProvider>): Array<IProvider> {
  return isArray(providers) ? providers.map(ProviderClass => verifyProvider(ProviderClass)) : [];
}

/**
 * Is factory provider
 * @param provider
 */
export function isFactoryProvider(provider: IProvider): boolean {
  return isFunction(provider.useFactory);
}

/**
 * Is factory provider
 * @param provider
 */
export function isValueProvider(provider: IProvider): boolean {
  return isDefined(provider.useValue);
}

/**
 * Is factory provider
 * @param provider
 */
export function isClassProvider(provider: IProvider): boolean {
  return isFunction(provider.useClass);
}

/**
 * @since 1.0.0
 * @function
 * @name ProviderList
 *
 * @description
 * Provider list holder for easier debugging
 */
export class ProviderList {
  private providers = new Map();

  constructor(private keys: Array<any> = []) {
  }

  /**
   * Check if provider key is mutable
   * @param key
   * @returns {boolean}
   */
  isMutable(key: any): boolean {
    return this.keys.indexOf(key) > -1;
  }

  /**
   * Set provider by key
   * @param key
   * @param {Object} value
   */
  set(key: any, value: Object): void {
    if (!this.has(key) || this.isMutable(key)) {
      this.providers.set(key, value);
    } else {
      throw new TypeError(
        `${getProviderName(key)} is already defined in injector, value: ${value}`
      );
    }
  }

  /**
   * Get provider
   * @param key
   * @returns {any}
   */
  get(key: any): any {
    return this.providers.get(key);
  }

  /**
   * Clear provider list
   */
  clear() {
    this.providers.clear();
  }

  /**
   * Check if provider exist in list
   * @param key
   * @returns {boolean}
   */
  has(key: any): boolean {
    return this.providers.has(key);
  }
}
