<% if (type == "method") { %>
import {createMethodInterceptor, Inject, Injectable, Interceptor, Method} from "@typeix/resty";

@Injectable()
export class <%= classify(name) %>Interceptor implements Interceptor {

  @Inject(Injector) injector;

  async invoke(method) {
    return await method.invoke();
  }
}
/**
 *
 * @function
 * @name <%= classify(name) %>
 *
 * @description
 * It's possible use method interceptor on any Class method as log is used with Injector it's going to be created and executed.
 */
export function <%= classify(name) %>(value: string) {
  return createMethodInterceptor(<%= classify(name) %>, <%= classify(name) %>Interceptor, {value});
}
<% } else { %>
import {Injectable, Inject, RequestInterceptor, InterceptedRequest} from "@typeix/resty";
/**
 * @constructor
 * @function
 * @name <%= classify(name) %>Interceptor
 *
 * @description
 * You need to assign request interceptor to controller:
 * ```
 * \@Controller({
 *   interceptors: [<%= classify(name) %>Interceptor]
 * })
 * class AppController {}
 * ```
 * or it can be done using \@addRequestInterceptor() decorator
 ```
 * \@Controller({
 *   path: "/"
 * })
 * class AppController {
 *
 *   \@GET()
 *   \@addRequestInterceptor(<%= classify(name) %>Interceptor, {})
 *   actionIndex() {
 *
 *   }
 * }
 * ```
 */
@Injectable()
export class <%= classify(name) %>Interceptor implements RequestInterceptor {

  async invoke(method) {
    return await method.handler();
  }
}
<% }  %>
