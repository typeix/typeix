import {Injectable, Inject, Injector} from "@typeix/di";
import {Logger} from "./logger";


describe("Logger Test", () => {

  @Injectable()
  class LoggerService {
    @Inject() logger: Logger;
  }

  it("Should create an instance of an logger", () => {
    let injector = Injector.createAndResolve(LoggerService, [Logger]);
    let logger = injector.get(Logger);
    expect(logger).toBeInstanceOf(Logger);
  });

  it("Should create an log errors in dev mode", () => {
    let injector = Injector.createAndResolve(LoggerService, [
      {
        provide: Logger,
        useFactory: () => new Logger({
          options: Logger.developmentConfig()
        })
      }
    ]);
    let logger = injector.get(Logger);
    expect(logger).toBeInstanceOf(Logger);
    logger.error("Logging a nice error", {a: 1, b: true, c: null});
    logger.fatal("Logging a nice error", {a: 1, b: true, c: null});
    logger.warn("Logging a nice error", {a: 1, b: true, c: null});
    logger.info("Logging a nice error", {a: 1, b: true, c: null});
    logger.debug("Logging a nice error", {a: 1, b: true, c: null});
    logger.trace("Logging a nice error", {a: 1, b: true, c: null});
    logger.silent("Logging a nice error", {a: 1, b: true, c: null});
  });

  it("Should create an log errors", () => {
    let injector = Injector.createAndResolve(LoggerService, [
      {
        provide: Logger,
        useFactory: () => new Logger({
          options: {
            level: "error"
          }
        })
      }
    ]);
    let logger = injector.get(Logger);
    expect(logger).toBeInstanceOf(Logger);
    logger.error("Logging a nice error", {a: 1, b: true, c: null});
  });

  it("Should create an writeStream", () => {
    let result;
    let writeStream = {
      write: (...args: any[]) => result = args
    }
    let injector = Injector.createAndResolve(LoggerService, [
      {
        provide: Logger,
        useFactory: () => new Logger({
          options: {
            level: "error"
          },
          stream: writeStream
        })
      }
    ]);
    let logger = injector.get(Logger);
    expect(logger).toBeInstanceOf(Logger);
    logger.error({msg: "Logging a nice error", a: 1, b: true, c: null});
    let log = JSON.parse(result);
    expect(log.msg).toEqual("Logging a nice error");
    expect(log.a).toBe(1);
    expect(log.b).toBeTruthy();
    expect(log.c).toBeNull();
  });
});
