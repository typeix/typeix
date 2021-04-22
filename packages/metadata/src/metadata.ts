import {
  inArray,
  isTruthy,
  isFalsy,
  uuid,
  isNumber,
  isFunction,
  isDefined,
  isString,
  isSymbol,
  isNull,
  isObject
} from "@typeix/utils";
import "reflect-metadata";

const TX_PREFIX = "@typeix";
const TX_NAME = `${TX_PREFIX}:name`;
const TX_UUID = `${TX_PREFIX}:uuid`;
const TX_ID = `${TX_PREFIX}:id`;
const TX_TYPE = `${TX_PREFIX}:type`;
export const TS_PARAMS = "design:paramtypes";
export const TS_TYPE = "design:type";
export const TS_RETURN = "design:returntype";

/**
 * @param name of decorator
 * @param key metadata key
 * @param args decorator args
 * @param paramIndex if decorator is parameter type
 */
export interface IMetadata {
  args: any;
  metadataKey: string;
  type?: string;
  decoratorType?: string;
  decorator?: Function;
  propertyKey?: string | symbol;
  paramIndex?: number;
  identifier?: string;
  designType?: any;
  designParam?: any;
  designReturn?: any;
}

/**
 * Define metadata
 * @param metadataKey
 * @param metadataValue
 * @param {Object} target
 * @param {string | symbol} targetKey
 */
export function defineMetadata(metadataKey: any, metadataValue: any, target: Object, targetKey?: string | symbol): void {
  if (inArray([ TS_TYPE, TS_PARAMS, TS_RETURN ], metadataKey)) {
    throw new Error(`You can't override typescript metadata: ${TS_TYPE}, ${TS_PARAMS}, ${TS_RETURN}`);
  }
  Reflect.defineMetadata(metadataKey, metadataValue, target, targetKey);
}

/**
 * Has metadata
 * @param metadataKey
 * @param {Object} target
 * @param {string | symbol} targetKey
 * @returns {boolean}
 */
export function hasMetadata(metadataKey: any, target: Object, targetKey?: string | symbol): boolean {
  try {
    return Reflect.hasMetadata(metadataKey, target, targetKey);
  } catch (e) {
    return false;
  }
}

/**
 * Has own metadata
 * @param metadataKey
 * @param {Object} target
 * @param {string | symbol} targetKey
 * @returns {boolean}
 */
export function hasOwnMetadata(metadataKey: any, target: Object, targetKey?: string | symbol): boolean {
  try {
    return Reflect.hasOwnMetadata(metadataKey, target, targetKey);
  } catch (e) {
    return false;
  }
}

/**
 * Get metadata key
 * @param metadataKey
 * @param {Object} target
 * @param {string | symbol} targetKey
 * @returns {any}
 */
export function getMetadata(metadataKey: any, target: Object, targetKey?: string | symbol): any {
  return Reflect.getMetadata(metadataKey, target, targetKey);
}

/**
 * Get own metadata
 * @param metadataKey
 * @param {Object} target
 * @param {string | symbol} targetKey
 * @returns {any}
 */
export function getOwnMetadata(metadataKey: any, target: Object, targetKey?: string | symbol): any {
  return Reflect.getOwnMetadata(metadataKey, target, targetKey);
}

/**
 * Get metadata keys
 * @param {Object} target
 * @param {string | symbol} targetKey
 * @returns {any[]}
 */
export function getMetadataKeys(target: Object, targetKey?: string | symbol): any[] {
  return Reflect.getMetadataKeys(target, targetKey);
}

/**
 * Get own metadata keys
 * @param {Object} target
 * @param {string | symbol} targetKey
 * @returns {any[]}
 */
export function getOwnMetadataKeys(target: Object, targetKey?: string | symbol): any[] {
  return Reflect.getOwnMetadataKeys(target, targetKey);
}

/**
 * Delete metadata
 * @param metadataKey
 * @param {Object} target
 * @param {string | symbol} targetKey
 * @returns {boolean}
 */
export function deleteMetadata(metadataKey: any, target: Object, targetKey?: string | symbol): boolean {
  if (inArray([ TS_TYPE, TS_PARAMS, TS_RETURN ], metadataKey)) {
    throw new Error(`You can't delete typescript metadata: ${TS_TYPE}, ${TS_PARAMS}, ${TS_RETURN}`);
  }
  try {
    return Reflect.deleteMetadata(metadataKey, target, targetKey);
  } catch (e) {
    return false;
  }
}

/**
 * Check if decorator
 * @param decorator
 */
export function isDecorator(decorator: Function): boolean {
  return isTruthy(decorator[TX_ID]);
}
/**
 * Get Decorator id
 * @param decorator
 * @param index
 */
export function getDecoratorId(decorator: Function, index?: number): string {
  if (isFalsy(decorator[TX_ID])) {
    throw new TypeError(`Decorator must be created via @typeix decorator functions: ${decorator.toString()}`);
  }
  return decorator[TX_ID] + (isNumber(index) ? `:${index}` : "");
}

/**
 * Return decorator UUID
 * @param decorator
 */
export function getDecoratorUUID(decorator: Function): string {
  if (isFalsy(decorator[TX_UUID])) {
    throw new TypeError(`Decorator must be created via @typeix decorator functions: ${decorator.toString()}`);
  }
  return decorator[TX_UUID];
}


/**
 * Get decorator type
 * @param decorator
 */
export function getDecoratorType(decorator: Function): string {
  if (isFalsy(decorator[TX_TYPE])) {
    throw new TypeError(`Decorator must be created via @typeix decorator functions: ${decorator.toString()}`);
  }
  return decorator[TX_TYPE];
}

/**
 * Get decorator name
 * @param decorator
 */
export function getDecoratorName(decorator: Function): string {
  if (isFalsy(decorator[TX_NAME])) {
    throw new TypeError(`Decorator must be created via @typeix decorator functions: ${decorator.toString()}`);
  }
  return decorator[TX_NAME];
}

/**
 * Validate decorator lookup
 * @param decorator
 * @param name
 */
export function validateDecorator(decorator: Function, name: string): void {
  let type = getDecoratorType(decorator);
  if (type !== name) {
    switch (type) {
      case "constructor":
        throw new TypeError(`Invalid ${getDecoratorName(decorator)} decorator get lookup, use: getClassDecorator`);
      case "property":
        throw new TypeError(`Invalid ${getDecoratorName(decorator)} decorator get lookup, use: getPropertyDecorator`);
      case "parameter":
        throw new TypeError(`Invalid ${getDecoratorName(decorator)} decorator get lookup, use: getParameterDecorator`);
      case "method":
        throw new TypeError(`Invalid ${getDecoratorName(decorator)} decorator get lookup, use: getMethodDecorator`);
    }
  }
}


/**
 * Has property descriptor check
 * @param decorator
 * @param target
 * @param targetKey
 * @param index
 */
export function hasDecorator(decorator: Function, target: Function, targetKey?: string, index?: number): boolean;
export function hasDecorator(decorator: Function, target: object, targetKey?: string, index?: number): boolean;
export function hasDecorator(decorator: Function, target: Function, targetKey?: symbol, index?: number): boolean;
export function hasDecorator(decorator: Function, target: object, targetKey?: symbol, index?: number): boolean;
export function hasDecorator(decorator: any, target?: any, targetKey?: any, index?: number): boolean {
  return isDecorator(decorator) ? hasMetadata(getDecoratorId(decorator, index), target, targetKey) : false;
}


/**
 * Return decorator metadata
 * @param decorator
 * @param target
 */
export function getClassMetadata(decorator: Function, target: Function): IMetadata;
export function getClassMetadata(decorator: Function, target: Function): IMetadata;
export function getClassMetadata(decorator: any, target: Function): IMetadata {
  validateDecorator(decorator, "constructor");
  return <IMetadata>getMetadata(getDecoratorId(decorator), target);
}

/**
 * Return decorator metadata
 * @param decorator
 * @param target
 * @param targetKey
 */
export function getPropertyMetadata(decorator: Function, target: Function, targetKey: string): IMetadata;
export function getPropertyMetadata(decorator: Function, target: Function, targetKey: symbol): IMetadata;
export function getPropertyMetadata(decorator: any, target: Function, targetKey: any): IMetadata {
  validateDecorator(decorator, "property");
  return <IMetadata>getMetadata(getDecoratorId(decorator), target.prototype, targetKey);
}

/**
 * Return decorator metadata
 * @param decorator
 * @param target
 * @param targetKey
 * @param isStatic
 */
export function getMethodMetadata(decorator: Function, target: Function, targetKey: string, isStatic?: boolean): IMetadata;
export function getMethodMetadata(decorator: Function, target: Function, targetKey: symbol, isStatic?: boolean): IMetadata;
export function getMethodMetadata(decorator: any, target: Function, targetKey: any, isStatic = false): IMetadata {
  validateDecorator(decorator, "method");
  return <IMetadata>getMetadata(getDecoratorId(decorator), !!isStatic ? target : target.prototype, targetKey);
}

/**
 * Return decorator metadata
 * @param decorator
 * @param target
 * @param index
 * @param targetKey
 */
export function getParameterMetadata(decorator: Function, target: Function, index: number, targetKey: string): IMetadata;
export function getParameterMetadata(decorator: Function, target: Function, index: number, targetKey: symbol): IMetadata;
export function getParameterMetadata(decorator: any, target: Function, index: number, targetKey: any): IMetadata {
  validateDecorator(decorator, "parameter");
  return <IMetadata>getMetadata(getDecoratorId(decorator, index), target.prototype, targetKey);
}

/**
 * Map to metadata
 * @param key
 */
function mapKeyToMetadata(key: IDecoratorMetadataKey): IMetadata {
  let metadata = getMetadata(key.metadataKey, key.target, key.propertyKey);
  if (key.metadataKey.includes(TX_PREFIX)) {
    return metadata;
  }
  return <IMetadata> {
    args: metadata,
    propertyKey: isDefined(key.propertyKey) ? key.propertyKey : "constructor",
    metadataKey: key.metadataKey
  };
}
/**
 * Merge two decorator keys
 * @param a
 * @param b
 */
function mergeKeys(a: Array<IDecoratorMetadataKey>, b: Array<IDecoratorMetadataKey>) {
  return a.concat(b.filter((bI: IDecoratorMetadataKey) =>
    isFalsy(a.find((aI: IDecoratorMetadataKey) => aI.metadataKey === bI.metadataKey && aI.propertyKey === bI.propertyKey))
  ));
}

/**
 * Low level decorator api
 */
interface IDecoratorMetadataKey {
  propertyKey: string | symbol;
  metadataKey: string;
  target: Object;
}

/**
 * Get decorator metadata keys
 * @param target
 * @param targetKey
 */
export function getMetadataKeysForTarget(target: Function, targetKey?: string | symbol): Array<IDecoratorMetadataKey> {
  let _target = isObject(target.prototype) && !!targetKey ? target.prototype : target;
  return getMetadataKeys(_target, targetKey)
    .map(key => {
      return {
        propertyKey: targetKey,
        target: _target,
        metadataKey: key
      };
    });
}

/**
 * Get decorator metadata
 * @param target
 * @param targetKey
 */
export function getMetadataForTarget(target: Function, targetKey?: string | symbol): Array<IMetadata> {
  let keys = getMetadataKeysForTarget(target, targetKey), proto = Object.getPrototypeOf(target);
  if (!isNull(proto)) {
    keys = mergeKeys(keys, getMetadataKeysForTarget(proto, targetKey));
  }
  return keys.map(item => mapKeyToMetadata(item));
}

/**
 * Get all decorator keys
 * @param target
 */
export function getAllKeysForTarget(target: Function): Array<{ key: string; target: Function }> {
  let keys = isObject(target.prototype) ? [ {target: target, key: undefined} ] : [],
    _target = isObject(target.prototype) ? target.prototype : target;
  return keys.concat(
    Reflect
      .ownKeys(_target)
      .filter(item => isSymbol(item) || isString(item))
      .map(key => {
        return {
          key,
          target: _target
        };
      })
  );
}

/**
 * Get decorator metadata keys
 * @param target
 */
export function getAllMetadataKeysForTarget(target: Function): Array<IDecoratorMetadataKey> {
  let keys = getAllKeysForTarget(target), metadata = [], proto = Object.getPrototypeOf(target);
  keys.forEach(item => metadata = metadata.concat(getMetadataKeysForTarget(item.target, item.key)));
  if (!isNull(proto)) {
    metadata = mergeKeys(metadata, getAllMetadataKeysForTarget(proto));
  }
  return metadata;
}

/**
 * Return decorator metadata
 * @param target
 */
export function getAllMetadataForTarget(target: Function): Array<IMetadata> {
  return getAllMetadataKeysForTarget(target).map(item => mapKeyToMetadata(item));
}

/**
 * Internal decorator type validator
 * @param target
 * @param parameterOrDescriptor
 * @param propertyKey
 * @param type
 */
function getType(target: any, parameterOrDescriptor: any, propertyKey: any, type: string) {
  type = type === "mixed" ? isNumber(parameterOrDescriptor) ? "parameter" : "property" : type;
  if (inArray([ "property", "parameter" ], type) && isFunction(target) && isDefined(propertyKey)) {
    throw new TypeError(`Decorator can´t be declared on static method/property: ${propertyKey}`);
  }
  return type === "method" && isFunction(target) ? "static" : type;
}

/**
 * Main Decorator
 * @param decorator
 * @param type
 * @param args
 */
function decorate(decorator: Function, type: string, args: object): any {
  if (isFalsy(decorator.name)) {
    throw new TypeError([
      "Decorator can't be anonymous function",
      `you need to pass function declaration or function expression: ${decorator.toString()}`
    ].join());
  }
  if (isFalsy(decorator[TX_ID])) {
    decorator[TX_UUID] = uuid();
    decorator[TX_ID] = `${TX_PREFIX}:${type}:${decorator.name}:${decorator[TX_UUID]}`;
    decorator[TX_NAME] = decorator.name;
    decorator[TX_TYPE] = type;
  }
  return (target: any, propertyKey?: any, parameterOrDescriptor?: any) => {
    let metadata: IMetadata = {
      args: isTruthy(args) ? {...args} : {},
      decorator: decorator,
      decoratorType: type,
      type: getType(target, parameterOrDescriptor, propertyKey, type),
      metadataKey: ""
    };

    if (isNumber(parameterOrDescriptor)) {
      metadata.paramIndex = parameterOrDescriptor;
    }

    metadata.propertyKey = isTruthy(propertyKey) ? propertyKey : "constructor";

    if (hasMetadata(TS_TYPE, target, propertyKey)) {
      metadata.designType = getMetadata(TS_TYPE, target, propertyKey);
    }

    if (hasMetadata(TS_PARAMS, target, propertyKey)) {
      metadata.designParam = getMetadata(TS_PARAMS, target, propertyKey);
    }

    if (hasMetadata(TS_RETURN, target, propertyKey)) {
      metadata.designReturn = getMetadata(TS_RETURN, target, propertyKey);
    }

    metadata.metadataKey = getDecoratorId(decorator, metadata.paramIndex);

    defineMetadata(metadata.metadataKey, metadata, target, propertyKey);

    return target;
  };
}


/**
 * Create class decorator
 * @param decorator
 * @param args
 */
export function createClassDecorator(decorator: Function, args?: object): ClassDecorator {
  return decorate(decorator, "constructor", args);
}

/**
 * Create property decorator
 * @param decorator
 * @param args
 */
export function createPropertyDecorator(decorator: Function, args?: object): PropertyDecorator {
  return decorate(decorator, "property", args);
}

/**
 * Create parameter decorator
 * @param decorator
 * @param args
 */
export function createParameterDecorator(decorator: Function, args?: object): ParameterDecorator {
  return decorate(decorator, "parameter", args);
}

/**
 * Mixed decoratory
 */
declare type MixedDecorator = (target: Object, propertyKey: string | symbol, parameterIndex?: number) => void;

/**
 * Create parameter and property decoratory
 * @param decorator
 * @param args
 */
export function createParameterAndPropertyDecorator(decorator: Function, args?: object): MixedDecorator {
  return decorate(decorator, "mixed", args);
}

/**
 * Create method decorator
 * @param decorator
 * @param args
 */
export function createMethodDecorator(decorator: Function, args?: object): MethodDecorator {
  return decorate(decorator, "method", args);
}
