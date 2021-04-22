"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const di_1 = require("@typeix/di");
const __1 = require("../");
const http_1 = require("http");
let router = di_1.Injector.createAndResolve(__1.Router, []).get(__1.Router);
function handler(injector, route) {
    let request = injector.get(http_1.IncomingMessage);
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
router.get("/", handler);
router.get("/home", handler);
router.get("/home/<id:(\\d+)>", handler);
router.get("/home/<id:(\\d+)>/handler", handler);
router.get("/favicon.ico", () => Buffer.from("favicon.ico"));
router.onError("/home/(.*)", (injector, route) => {
    let response = injector.get(http_1.ServerResponse);
    let error = injector.get(__1.RouterError);
    return { ...route, handler: "[Function handler]", statusCode: response.statusCode, error };
});
let server = router.pipe(http_1.createServer());
server.listen(4000);
//# sourceMappingURL=server-simple.js.map