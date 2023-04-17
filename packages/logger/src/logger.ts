import {Injectable} from "@typeix/di";
import {pino} from "pino";

export interface LoggerOptions {
  options: pino.LoggerOptions;
  stream?: pino.DestinationStream;
}

/**
 * @since 4.0.0
 * @class
 * @name Logger
 * @constructor
 * @description
 * Logger wrapper for winston
 *
 */
@Injectable()
export class Logger {


  private readonly logger: pino.Logger;

  /**
   * Pino Logger options
   * @param {LoggerOptions} config
   */
  constructor(private config: LoggerOptions) {
    if (!!config && config.stream && config.options) {
      this.logger = pino(Object.assign({level: "info"}, config.options), config.stream);
    } else {
      this.logger = pino(Object.assign({level: "info"}, config.options ?? {}));
    }
  }

  /**
   * Development config
   */
  static developmentConfig(): pino.LoggerOptions {
    return {
      level: "debug",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true
        }
      }
    };
  }

  /**
   * Fatal error
   */
  fatal(...args: any[]): this {
    this.logger.fatal.apply(this.logger, args);
    return this;
  };

  /**
   * Warn level
   */
  error(...args: any[]): this {
    this.logger.error.apply(this.logger, args);
    return this;
  };

  /**
   * Warn level
   */
  warn(...args: any[]): this {
    this.logger.warn.apply(this.logger, args);
    return this;
  };

  /**
   * Info level
   */
  info(...args: any[]): this {
    this.logger.info.apply(this.logger, args);
    return this;
  };

  /**
   * Debug level
   */
  debug(...args: any[]): this {
    this.logger.debug.apply(this.logger, args);
    return this;
  };

  /**
   * Trace level
   */
  trace(...args: any[]): this {
    this.logger.trace.apply(this.logger, args);
    return this;
  };

  /**
   * Silent level
   */
  silent(...args: any[]): this {
    this.logger.silent.apply(this.logger, args);
    return this;
  };
}
