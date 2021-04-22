<p align="center">
  <a href="https://typeix.com" target="blank">
    <img src="https://avatars.githubusercontent.com/u/38910665?s=200&v=4" width="120" alt="Typeix Logo" />
  </a>
</p>
<p align="center">
A progressive <a href="https://nodejs.org" target="_blank">Node.js</a>
tools for building efficient and scalable applications.
</p>

# @typeix/modules

[![Build Status][travis-url]][travis-img]
[![Coverage Status][coverage-img]][coverage-url]
![npm][npm-version-img]

Modular system for typescript projects

Installing:
```bash
npm i @typeix/modules @typeix/di --save
npm i @types/node typescript --save-dev
```


## Example of usage:
```typescript
import {Module, ModuleInjector} from "@typeix/modules";
import {Injector, Injectable, Inject} from "@typeix/di";

@Injectable
class AService {
}

@Injectable
class BService {
  @Inject(AService) aService: AService;
}

@Module({
  providers: [AService, BService],
  exports: [AService, BService]
})
class ApplicationModuleD {
  @Inject(BService) bService: BService;
  @Inject(AService) aService: AService;
}

@Module({
  imports: [ApplicationModuleD],
  exports: [AService, BService],
  providers: []
})
class ApplicationModuleC {
  @Inject(BService) bService: BService;
  @Inject(AService) aService: AService;
}

@Module({
  imports: [ApplicationModuleC],
  providers: [AService]
})
class ApplicationModuleB {
  @Inject(BService) bService: BService;
  @Inject(AService) aService: AService;
}

@Module({
  imports: [ApplicationModuleB, ApplicationModuleD],
  providers: [AService, BService]
})
class ApplicationModuleA {
  @Inject(BService) bService: BService;
  @Inject(AService) aService: AService;
}

let injector: ModuleInjector = ModuleInjector.createAndResolve(ApplicationModuleA);
let moduleD: ApplicationModuleD = injector.get(ApplicationModuleD);
let moduleC: ApplicationModuleC = injector.get(ApplicationModuleC);
let moduleB: ApplicationModuleB = injector.get(ApplicationModuleB);
let moduleA: ApplicationModuleA = injector.get(ApplicationModuleA);
let moduleDInjector: Injector = injector.getInjector(ApplicationModuleD);
let moduleCInjector: Injector = injector.getInjector(ApplicationModuleC);
let moduleBInjector: Injector = injector.getInjector(ApplicationModuleB);
let moduleAInjector: Injector = injector.getInjector(ApplicationModuleA);

```

[travis-url]: https://travis-ci.com/typeix/typeix.svg?branch=master
[travis-img]: https://travis-ci.com/typeix/typeix
[npm-version-img]: https://img.shields.io/npm/v/@typeix/modules
[coverage-img]: https://coveralls.io/repos/github/typeix/typeix/badge.svg?branch=master
[coverage-url]: https://coveralls.io/github/typeix/typeix?branch=master
