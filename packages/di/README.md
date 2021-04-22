<p align="center">
  <a href="https://typeix.com" target="blank">
    <img src="https://avatars.githubusercontent.com/u/38910665?s=200&v=4" width="120" alt="Typeix Logo" />
  </a>
</p>
<p align="center">
A progressive <a href="https://nodejs.org" target="_blank">Node.js</a>
tools for building efficient and scalable applications.
</p>

# @typeix/di

[![Build Status][travis-url]][travis-img]
[![Coverage Status][coverage-img]][coverage-url]
![npm][npm-version-img]

Typescript Dependency Injection with Interceptors

Installing:

```bash
npm i @typeix/di --save
```

Basic usage:

```typescript
import {Injectable, Injector, Inject} from "@typeix/di";

@Injectable()
class AService {
}

@Injectable()
class BService {
}

@Injectable()
class ParentService {
  @Inject() bService: BService;
}

@Injectable()
class ChildService extends ParentService {
  @Inject() aService: AService;
  constructor(@Inject("name") private name: string) {
    super();
  }
  getName(): string {
    return this.name;
  }
}

let injector = Injector.createAndResolve(ChildService, [
  AService,
  BService,
  {provide: "name", useValue: "Igor"}
]);
let service: ChildService = injector.get(ChildService);
service.getName(); /// Igor
```

Method Interceptors:
```ts
import {Injectable, Injector, Inject, createMethodInterceptor} from "@typeix/di";

@Injectable()
class Logger {
  
  error(...args: []) {
      console.error(...args);
  }

  info(...args: []) {
    console.error(...args);
  }
}

@Injectable()
class LoggerInterceptor implements Interceptor {

  @Inject() logger: Logger;

  async invoke(method: Method): Promise<any> {
    const result = method.invoke();
    if (method.args.level.toLowerCase() === "error") {
        this.logger.error("Magic is here", result);
    } else {
        this.logger.info("Magic is here", result);
    }
  }
}

export function Logger(level) {
    return createMethodInterceptor(Logger, LoggerInterceptor, {level});
};


@Injectable()
class ChildService {
  @Inject() aService: AService;
  constructor(@Inject("name") private name: string) {}
  
  @Logger("error")
  getName(): string {
    return this.name;
  }
}

let service: ChildService = injector.get(ChildService);
service.getName(); /// will console error and return Igor
```
[travis-url]: https://travis-ci.com/typeix/typeix.svg?branch=master
[travis-img]: https://travis-ci.com/typeix/typeix
[npm-version-img]: https://img.shields.io/npm/v/@typeix/di
[coverage-img]: https://coveralls.io/repos/github/typeix/typeix/badge.svg?branch=master
[coverage-url]: https://coveralls.io/github/typeix/typeix?branch=master
