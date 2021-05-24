/**
 * Internal is number
 * @param value
 * @returns {boolean}
 * @private
 */
function _isNumber(value): boolean {
  return typeof value === "number";
}

/**
 * Create unique id
 *
 * @returns {string}
 */
const UUID_RGX = /[xy]/g;

export function uuid(): string {
  let d = new Date().getTime();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(UUID_RGX, function (c) {
    let r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == "x" ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

/**
 * @since 1.0.0
 * @author Igor Ivanovic
 * @function isNull
 *
 * @description
 * Check if value is funciton
 */
export function isNull(value): boolean {
  return value === null;
}

/**
 * @since 1.0.0
 * @author Igor Ivanovic
 * @function isBoolean
 *
 * @description
 * Check if value is boolean
 */
export function isBoolean(value): boolean {
  return typeof value === "boolean";
}

/**
 * @since 1.0.0
 * @author Igor Ivanovic
 * @function isUndefined
 *
 * @description
 * Check if value is un-defined
 */
export function isUndefined(value): boolean {
  return typeof value === "undefined";
}

/**
 * @since 1.0.0
 * @author Igor Ivanovic
 * @function isDefined
 *
 * @description
 * Check if value is object
 */
export function isDefined(value): boolean {
  return !isNull(value) && !isUndefined(value);
}

/**
 * @since 4.0.0
 * @author Igor Ivanovic
 * @function isSymbol
 *
 * @description
 * Check if value is string
 */
export function isSymbol(value): boolean {
  return typeof value === "symbol" || isObject(value) && Object.prototype.toString.call(value) === "[object Symbol]";
}

/**
 * @since 1.0.0
 * @author Igor Ivanovic
 * @function isString
 *
 * @description
 * Check if value is string
 */
export function isString(value): boolean {
  return typeof value === "string";
}

/**
 * @since 1.0.0
 * @author Igor Ivanovic
 * @function isNumber
 *
 * @description
 * Check if value is isNumber
 */
export function isNumber(value): boolean {
  return _isNumber(value) && !isNaN(value);
}

/**
 * @since 1.0.0
 * @author Igor Ivanovic
 * @function isArray
 *
 * @description
 * Check if value is array
 */
export function isArray(value): boolean {
  return Array.isArray(value);
}

/**
 * Check if token is in array
 * @param arr
 * @param token
 * @return {boolean}
 */
export function inArray(arr: Array<any>, token: any): boolean {
  return isArray(arr) && arr.indexOf(token) > -1;
}


/**
 * @since 1.0.0
 * @author Igor Ivanovic
 * @function isFunction
 *
 * @description
 * Check if value is funciton
 */
export function isFunction(value): boolean {
  return typeof value === "function";
}

/**
 * @since 1.0.0
 * @author Igor Ivanovic
 * @function isArray
 *
 * @description
 * Check if value is array
 */
export function isDate(value): boolean {
  return Object.prototype.toString.call(value) === "[object Date]";
}

/**
 * @since 1.0.0
 * @author Igor Ivanovic
 * @function isRegExp
 *
 * @description
 * Check if object is an regular expression
 */
export function isRegExp(value): boolean {
  return Object.prototype.toString.call(value) === "[object RegExp]";
}

/**
 * @since 1.0.0
 * @author Igor Ivanovic
 * @function isObject
 *
 * @description
 * Check if value is object
 */
export function isObject(value): boolean {
  return !isNull(value) && typeof value === "object";
}

/**
 * @since 1.0.0
 * @author Igor Ivanovic
 * @function isFalsy
 *
 * @description
 * we are doing data type conversion to see if value is considered false value
 */
export function isFalsy(value): boolean {
  return isNull(value) || isUndefined(value) || value === "" || value === false || value === 0 || (_isNumber(value) && isNaN(value));
}

/**
 * @since 1.0.0
 * @author Igor Ivanovic
 * @function isTruthy
 *
 * @description
 * we are doing data type conversion to see if value is considered true value
 */
export function isTruthy(value): boolean {
  return !isFalsy(value);
}

/**
 * @since 1.0.0
 * @author Igor Ivanovic
 * @function isClass
 *
 * @description
 * Check if type is class
 */
const CLASS_RGX = /^\s*class\s+/;

export function isClass(value): boolean {
  return isFunction(value) && CLASS_RGX.test(value.toString());
}

/**
 * @since 1.0.0
 * @author Igor Ivanovic
 * @function isEqual
 *
 * @description
 * Check if two objects are equal
 */
export function isEqual(a, b): boolean {
  if (isSymbol(a) || isSymbol(b)) {
    return false;
  } else if (_isNumber(a) || _isNumber(b)) {
    return (isNaN(a) || isNaN(b)) ? isNaN(a) === isNaN(b) : a === b;
  } else if (isDate(a) && isDate(b)) {
    return a.toISOString() === b.toISOString();
  } else if (isRegExp(a) && isRegExp(b)) {
    return a.source === b.source;
  }
  if (a === b) {
    return true;
  } else if (isArray(a) && isArray(b)) {
    return a.every((item, index) => {
      if (isDefined(b[index])) {
        return (a === item && b === b[index]) || isEqual(item, b[index]);
      }
      return false;
    });
  } else if (isObject(a) && !isArray(a) && isObject(b) && !isArray(b)) {
    return Object.keys(a).every(key => (a === a[key] && b === b[key]) || isEqual(a[key], b[key]));
  }
  return false;
}

/**
 * @since 8.1.0
 * @author Igor Ivanovic
 * @function flatten
 *
 * @description
 * flatten two dimensional array into single dimension
 */
export function flatten(value: Array<any>): Array<any> {
  return isArray(value) ? value.reduce((acc, cur) => acc.concat(isArray(cur) ? flatten(<Array<any>>cur) : cur), []) : [];
}
