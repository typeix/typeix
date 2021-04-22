<p align="center">
  <a href="https://typeix.com" target="blank">
    <img src="https://avatars.githubusercontent.com/u/38910665?s=200&v=4" width="120" alt="Typeix Logo" />
  </a>
</p>
<p align="center">
A progressive <a href="https://nodejs.org" target="_blank">Node.js</a>
tools for building efficient and scalable applications.
</p>

# @typeix/logger wrapper around [pino logger](https://github.com/pinojs/pino) 

[![Build Status][travis-url]][travis-img]
[![Coverage Status][coverage-img]][coverage-url]
![npm][npm-version-img]

Logging framework for @typeix/resty server

### Default:
```typescript
import {Logger} from "@typeix/logger";

@RootModule({
    providers: [Logger]
})
class ApplicationModule {
    
    @Inject() private logger: Logger;
    
    afterConstruct() {
       this.logger.log("Hello World");
    }      

}
```

### Config Usage:
```typescript
import {Logger} from "@typeix/logger";

@RootModule({
    shared_providers: [
       {
          provide: Logger,
          useFactory: () => new Logger({
             options: {
               level: "error"
             }
          })
       }
    ]
})
class ApplicationModule {
    
    @Inject() private logger: Logger;
    
    afterConstruct() {
       this.logger.log("Hello World");
    }      

}
```
[travis-url]: https://travis-ci.com/typeix/typeix.svg?branch=master
[travis-img]: https://travis-ci.com/typeix/typeix
[npm-version-img]: https://img.shields.io/npm/v/@typeix/logger
[coverage-img]: https://coveralls.io/repos/github/typeix/typeix/badge.svg?branch=master
[coverage-url]: https://coveralls.io/github/typeix/typeix?branch=master
