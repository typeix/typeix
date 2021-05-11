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

[![Build Status][travis-img]][travis-url]
[![Coverage Status][coverage-img]][coverage-url]
![npm][npm-version-img]

# Modules
Package provides Modules API with Dependency Injection, A module is a class annotated with a `@Module()` decorator.
The `@Module()` decorator provides metadata information to ModuleInjector, that makes use of to organize application
module dependency graph.

![Tree Traversal](https://typeix.com/assets/module-object-tree.png)
Injector uses deep-tree left traversal algorithm to create application module instances,
that means that deepest three objects are created first.

Objects would be created in order  <br />
A -> C -> E -> D -> B -> H -> I -> G -> F <br />
if we illustrate that would look like:
```text
       A       H
     /   \     |
    C     E    I
     \   /     |
       D       G
       |      /
       B     /
        \   /
          F
```
You can easily extend application module decorator to provide custom metadata API in own projects,
due to large application graph application modules should be initialized once on application start or bootstrap time.

Installing:
```bash
npm i @typeix/modules @typeix/di --save
npm i @types/node typescript --save-dev
```
## Decorators
`@Module()` decorator contains metadata information of import modules, export providers and providers to be created. <br />
`imports` - can only contain modules or module imports <br />
`exports` - providers to be exported which are created or imported at module creation <br />
`providers` - list of providers that are created at module creation
```ts
export interface IModuleMetadata {
  imports?: Array<Function | IProvider>;
  exports?: Array<Function | IProvider>;
  providers: Array<Function | IProvider>;
}
```
Extending module decorator in custom projects can be done as following:
```ts
import {Module as AModule, IModuleMetadata as AIModuleMetadata} from "@typeix/modules";

export interface IModuleMetadata extends AIModuleMetadata {
    controllers?: Array<Function | IProvider>;
    path?: string;
}

export function Module(config: IModuleMetadata): ClassDecorator {
    if (!isArray(config.exports)) {
        config.exports = [];
    }
    return AModule(config);
}
```

## Usage
Once created asynchronously modules can be accessed via ModuleInjector , in example we can see that `ApplicationModuleD`
create providers AService and BService and exports them to other modules, what that means is
that same object reference will be provided to `ApplicationModuleC` or module with imports `ApplicationModuleD`,
however `ApplicationModuleB` will receive same instance of service `BService` but `AService` will be newly created object
since is defined as provider in `providers: [AService]`

```ts
import {Module, ModuleInjector} from "@typeix/modules";
import {Injector, Injectable, Inject} from "@typeix/di";

@Injectable
class AService {
}

@Injectable
class BService {
  @Inject() aService: AService;
  doWhatever() {}
}

@Module({
  providers: [AService, BService],
  exports: [AService, BService]
})
class ApplicationModuleD {
  @Inject() bService: BService;
  @Inject() aService: AService;
}
```
ApplicationModuleC implements ApplicationModuleD and BService, AService are same references exported from ApplicationModuleD.
```ts
@Module({
  imports: [ApplicationModuleD],
  exports: [AService, BService],
  providers: []
})
class ApplicationModuleC {
  @Inject() bService: BService;
  @Inject() aService: AService;
}
```
ApplicationModuleB implements ApplicationModuleC and BService is same reference however AService is new instance
of AService class, because it's provided as new provider on ApplicationModuleB.
```ts
@Module({
  imports: [ApplicationModuleC],
  providers: [AService]
})
class ApplicationModuleB {
  @Inject() bService: BService;
  @Inject() aService: AService;
}

```


## ModuleInjector
**NOTE:** <br/> By default all providers are immutable, however you can define mutable provider keys. <br />
If provider is not mutable, and you are trying to create new instance of same provider on current ModuleInjector instance,
injector will throw error.

`ModuleInjector.createAndResolve(Class, sharedProviders)` special sharedProviders property will create all providers
which are provided and visible to all modules, however if module have same provider provided in `providers` module metadata,
new instance will be delivered to that module.
```ts
class ModuleInjector {
    static createAndResolve(Class: Function | IProvider, sharedProviders: Array<Function | IProvider>, mutableKeys?: Array<any>): ModuleInjector;
    get(Class: Function | IProvider): any;
    getInjector(Class: Function | IProvider): Injector;
    has(Class: IProvider | Function): boolean;
    remove(Class: Function | IProvider): boolean;
    getAllMetadata(): Map<any, IModuleMetadata>;
    createAndResolveSharedProviders(providers: Array<Function | IProvider>): void;
    createAndResolve(Class: Function | IProvider, mutableKeys?: Array<any>): void;
}
```

Once modules are created by ModuleInjector all objects and references can be accessed via API, keep in mind
that modules are created asynchronously to support lazy loading.
```ts
const injector = await ModuleInjector.createAndResolve(ApplicationModuleB);
const dModule: ApplicationModuleD = injector.get(ApplicationModuleD);
const cModule: ApplicationModuleC = injector.get(ApplicationModuleC);
const bModule: ApplicationModuleB = injector.get(ApplicationModuleB);
bModule.myAction();
const bModuleInjector = injector.getInjector(ApplicationModuleB);
const bService = bModuleInjector.get(BService);
bService.doWhatever();
```
In example above injected service references are evaluated as true
```ts
const dModuleInjector = injector.getInjector(ApplicationModuleD);
const cModuleInjector = injector.getInjector(ApplicationModuleC);
const bModuleInjector = injector.getInjector(ApplicationModuleB);

bModuleInjector.get(BService) === cModuleInjector.get(BService)
bModuleInjector.get(BService) === dModuleInjector.get(BService)

cModuleInjector.get(AService) === dModuleInjector.get(AService)
bModuleInjector.get(AService) != cModuleInjector.get(AService)
bModuleInjector.get(AService) != dModuleInjector.get(AService)
```

[travis-url]: https://travis-ci.com/typeix/typeix
[travis-img]: https://travis-ci.com/typeix/typeix.svg?branch=main
[npm-version-img]: https://img.shields.io/npm/v/@typeix/resty
[coverage-img]: https://coveralls.io/repos/github/typeix/typeix/badge.svg?branch=main
[coverage-url]: https://coveralls.io/github/typeix/typeix?branch=main
