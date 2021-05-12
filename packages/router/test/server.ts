import {Injector} from "@typeix/di";
import {IResolvedRoute, Router, RouterError} from "../";
import {createServer, IncomingMessage, ServerResponse} from "http";

let router: Router = Injector.Sync.createAndResolve(Router, []).get(Router);
/**
 * Route handler example
 * @param injector
 * @param route
 */
function handler(injector: Injector, route: IResolvedRoute) {
  let request = injector.get(IncomingMessage);
  let response = injector.get(ServerResponse);
  let body = JSON.stringify({
    ...route,
    handler: "[Function handler]",
    request: {
      url: request.url,
      method: request.method,
      headers: request.headers
    }
  }, null, " ");
  response.end(body);
}

/**
 * Add routes
 */
router.get("/", handler);
router.get("/home", handler);
router.get("/home/<id:(\\d+)>", handler);
router.get("/home/<id:(\\d+)>/handler", handler);
router.get("/favicon.ico",
  (injector: Injector) => {
    let response = injector.get(ServerResponse);
    response.end(Buffer.from("favicon.ico"));
  }
);
/**
 * Add custom error route, internally if exception happens router forwards error to custom route if no error route is defined
 * router will display json output as error message
 */
router.onError("/home/(.*)", (injector: Injector, route: IResolvedRoute) => {
  let response = injector.get(ServerResponse);
  let error = injector.get(RouterError);
  let body = JSON.stringify({...route, handler: "[Function handler]", statusCode: response.statusCode, error}, null, " ");
  response.end(body);
});
/**
 * Request handler example
 */
let server = router.pipe(createServer());
server.listen(4000);
