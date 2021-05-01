import {pipeServer} from "@typeix/resty";
import {AppModule} from "./app.module";
import {createServer} from "http";

/**
 * Bootstraps server
 *
 * @function
 * @name pipeServer
 *
 */
const server = createServer();
pipeServer(server, AppModule);
server.listen(3000);
