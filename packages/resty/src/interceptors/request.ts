import {createMethodDecorator} from "@typeix/metadata";
import {InterceptedRequest, RequestInterceptor, RequestInterceptorConstructor} from "../interfaces";
import {Injectable} from "@typeix/di";
import {getRequestBody} from "../helpers";

export const REQUEST_INTERCEPTORS = new Set<Function>();

@Injectable()
export class BodyAsBufferInterceptor implements RequestInterceptor  {
  async invoke(method: InterceptedRequest): Promise<any> {
    const data = await getRequestBody(method.request);
    method.injector.set(Buffer, data);
  }
}
/**
 * Request interceptor
 * @decorator
 * @function
 * @name addRequestInterceptor
 *
 * @param {Function} Class
 * @param {object} args
 *
 * @description
 * Request interceptor
 */
export function addRequestInterceptor(Class: RequestInterceptorConstructor, args?: object) {
  REQUEST_INTERCEPTORS.add(Class);
  return createMethodDecorator(Class, {Class, args});
}
