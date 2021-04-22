import {createMethodInterceptor, Injectable, Interceptor, Method} from "@typeix/di";
import {getResponse} from "../helpers";

@Injectable()
class ProducesInterceptor implements Interceptor {
  invoke(method: Method): any {
    const request = getResponse(method.injector);
    request.setHeader("Content-Type", method.decoratorArgs.value);
  }
}
/**
 * Produces response type
 * @decorator
 * @function
 * @name Produces
 *
 * @param {String} value
 *
 * @description
 * Produces content type
 */
export function Produces(value: string) {
  return createMethodInterceptor(Produces, ProducesInterceptor, {value});
}
