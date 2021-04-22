import {createMethodDecorator} from "@typeix/metadata";
import {isRegExp} from "@typeix/utils";


function getPath(path: string | RegExp): string {
  return isRegExp(path) ? (<RegExp>path).source : <string>path;
}

/**
 * Rest Method Decorator
 * @decorator
 * @function
 * @name GET
 *
 */
export function GET(path?: string | RegExp) {
  return createMethodDecorator(GET, {path: getPath(path)});
}

/**
 * Rest Method Decorator
 * @decorator
 * @function
 * @name HEAD
 *
 */
export function HEAD(path?: string | RegExp) {
  return createMethodDecorator(HEAD, {path: getPath(path)});
}


/**
 * Rest Method Decorator
 * @decorator
 * @function
 * @name POST
 *
 */
export function POST(path?: string | RegExp) {
  return createMethodDecorator(POST, {path: getPath(path)});
}

/**
 * Rest Method Decorator
 * @decorator
 * @function
 * @name PUT
 *
 */
export function PUT(path?: string | RegExp) {
  return createMethodDecorator(PUT, {path: getPath(path)});
}


/**
 * Rest Method Decorator
 * @decorator
 * @function
 * @name DELETE
 *
 */
export function DELETE(path?: string | RegExp) {
  return createMethodDecorator(DELETE, {path: getPath(path)});
}

/**
 * Rest Method Decorator
 * @decorator
 * @function
 * @name CONNECT
 *
 */
export function CONNECT(path?: string | RegExp) {
  return createMethodDecorator(CONNECT, {path: getPath(path)});
}

/**
 * Rest Method Decorator
 * @decorator
 * @function
 * @name OPTIONS
 *
 */
export function OPTIONS(path?: string | RegExp) {
  return createMethodDecorator(OPTIONS, {path: getPath(path)});
}

/**
 * Rest Method Decorator
 * @decorator
 * @function
 * @name TRACE
 *
 */
export function TRACE(path?: string | RegExp) {
  return createMethodDecorator(TRACE, {path: getPath(path)});
}

/**
 * Rest Method Decorator
 * @decorator
 * @function
 * @name PATCH
 *
 */
export function PATCH(path?: string | RegExp) {
  return createMethodDecorator(PATCH, {path: getPath(path)});
}

/**
 * OnError Method Decorator
 * @decorator
 * @function
 * @name OnError
 *
 */
export function OnError(path?: string | RegExp) {
  return createMethodDecorator(OnError, {path: getPath(path)});
}
