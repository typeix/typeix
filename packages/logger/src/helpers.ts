import {IProvider, verifyProvider, verifyProviders} from "@typeix/di";
import {Logger} from "./logger";

/**
 * @since 8.4.0
 * @function
 * @name verifyLoggerInProviders
 * @param {Array<Function | IProvider>} providers
 *
 * @description
 * Verify that logger exist in providers
 */
export function verifyLoggerInProviders(providers: Array<Function | IProvider>) {
  if (!verifyProviders(providers).find(item => item.provide === Logger)) {
    providers.push(verifyProvider({
      provide: Logger,
      useFactory: () => new Logger({
        options: {
          level: "info"
        }
      })
    }));
  }
}
