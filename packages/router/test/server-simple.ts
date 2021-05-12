import {Injector} from "@typeix/di";
import {IResolvedRoute, Router, RouterError} from "../";
import {createServer, IncomingMessage, ServerResponse} from "http";

let router: Router = Injector.Sync.createAndResolve(Router, []).get(Router);
/**
 * Route handler example
 * @param injector
 */
function handler(injector: Injector, route: IResolvedRoute) {
  let request = injector.get(IncomingMessage);
  return {
    ...route,
    handler: "[Function handler]",
    request: {
      url: request.url,
      method: request.method,
      headers: request.headers
    }
  };
}

/**
 * Add routes
 */
router.get("/", handler);
router.get("/home", handler);
router.get("/home/<id:(\\d+)>", handler);
router.get("/home/<id:(\\d+)>/handler", handler);
router.get("/favicon.ico", () => Buffer.from("favicon.ico"));
/**
 * Add custom error route, internally if exception happens router forwards error to custom route if no error route is defined
 * router will display json output as error message
 */
router.onError("/home/(.*)", (injector: Injector, route: IResolvedRoute) => {
  let response = injector.get(ServerResponse);
  let error = injector.get(RouterError);
  return {...route, handler: "[Function handler]", statusCode: response.statusCode, error};
});
/**
 * Request handler example
 * @param {module:http.IncomingMessage} request
 * @param {module:http.ServerResponse} response
 * @returns {Promise<void>}
 */
let server = router.pipe(createServer());
server.listen(4000);
