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

[![Build Status][travis-img]][travis-url]
[![Coverage Status][coverage-img]][coverage-url]
![npm][npm-version-img]

# Dependency Injection

Dependency Injection (DI) is a design pattern used to implement IoC. It allows the creation of dependent objects outside
of a class and provides those objects to a class through different ways. Using DI, we move the creation and binding of
the dependent objects outside of the class that depends on them.

Installing

```bash
npm i @typeix/di --save
```

## Decorators

| Decorator           | Info                                 |
| ------------------- | ------------------------------------ |
| `@Injectable()`     | specifies that Typeix can use this class in the DI system. <br /> decorators can be used on classes only. |
| `@Inject()`         | specifies DI system, which object to provide when object is created, <br /> if there is no provider defined DI will throw error with explanation. |
| `@AfterConstruct()` | specifies DI system, what to execute immediately after object is created. |
| `@CreateProvider()` | decorator specifies DI system, to create new provider on injection point, <br /> this will create new object even if there is a provider defined in parent Injector. |

## Interceptors

An interceptor pattern is a software design pattern that is used when software systems or frameworks want to offer a way
to change, or augment, their usual processing cycle.

```ts
import {Injectable, Injector, Inject, createMethodInterceptor} from "@typeix/di";

@Injectable()
class LoggerInterceptor implements Interceptor {

  @Inject() logger: Logger;

  async invoke(method: Method): Promise<any> {
    const result = await method.invoke();
    this.logger.info(method.args.message, result);
    return result;
  }
}

export function Logger(message) {
  return createMethodInterceptor(Logger, LoggerInterceptor, {message});
};

@Injectable()
class ChildService {
  @Logger("Logging ChildService.getName result: ")
  getName(): string {
    return this.name;
  }
}
```

## Usage

In order to create an object of some class you need to define class as @Injectable and injection points via @Inject,
then when creating an instance you need to provide DI what to construct and which providers to create.

```typescript
import {Injectable, Injector, Inject} from "@typeix/di";

@Injectable()
class NameService {

  @Inject("name") private name: string;

  getName() {
    return this.name;
  }
}

@Injectable()
class ChildService {

  @Inject() nameService: NameService;

  getName(): string {
    return this.nameService.getName();
  }
}

Injector.createAndResolve(ChildService, [
  {provide: "name", useValue: "Igor"},
  NameService
]).then(injector => {
  let service = injector.get(ChildService);
  return service.getName();
});
```

## Provider Types

There are three type of providers class, value and factory provider, functions inside providers array are converted to
class providers.

There are three types of providers in total: <br />
`{provde, useClass}` is a class provider. <br />
`{provde, useFactory}` is a factory provider.  <br />
`{provde, useValue}` is a value provider. <br />

Dependent `providers?: Array<Function | IProvider>` inside of provider
(class and factory) are extra dependencies that are created before provider and delivered as dependencies to provider
itself.

```typescript
interface IProvider {
  provide: any;
  useValue?: any;
  useClass?: Function;
  useFactory?: Function;
  providers?: Array<Function | IProvider>;
}
```

## Injector API

**NOTE:** <br/> By default all providers are immutable, however you can define mutable provider keys. <br />
If provider is not mutable, and you are trying to create new instance of same provider on current Injector instance,
injector will throw error.

`Injector.getProviders(provider: IProvider, propertyKey?: string)` will return all providers which needs to be injected,
if propertyKey is not defined injector will return providers for constructor.

`Injector.getAllMetadataForTarget(provider: IProvider)` will return all metadata, injector cache them internally. Works
with class provider only.

```ts
class Injector {
  constructor(_parent?: Injector, keys?: Array<any>);
  static getProviders(provider: IProvider, propertyKey?: string): Array<IProvider>;
  // returns all metadata for provider
  static getAllMetadataForTarget(provider: IProvider): Array<IMetadata>;
  // creates new child injector, provider and providers
  static createAndResolveChild(parent: Injector, Class: Function | IProvider, providers: Array<MixedProvider>): Promise<Injector>;
  // creates new injector, provider and providers
  static createAndResolve(Class: Function | IProvider, providers: Array<MixedProvider>): Promise<Injector>;
  // creates new provider and providers
  createAndResolve(provider: IProvider, providers: Array<IProvider>): Promise<any>;
  // clens current injectables and all child injectors & providers
  destroy(): void;
  // check if providier exists on current SyncInjector instance
  has(key: any): boolean;
  // get provider value from current SyncInjector if not found bubble parrent's
  // if not found on any of parents exception is thrown.
  get(provider: string, Class?: IProvider): any;
  get<T>(provider: Type<T>, Class?: IProvider): T;
  // set provider and value
  set(key: any, value: Object): void;
  getParent(): Injector;
  setParent(injector: Injector): void;
  setName(provider: IProvider): void;
  hasChild(injector: Injector): boolean;
  addChild(injector: Injector): this;
}
```

## Sync Injector API
Since version 8.x default Injector behavior is converted to async API, if you want to use sync api you need to use
`Injector.Sync.createAndResolve` or `Injector.Sync.createAndResolveChild` difference is that Async API supports
Async providers, it's allowed to use of async/await in factory and return Promises in value provider!
```ts
class SyncInjector {
  constructor(_parent?: Injector, keys?: Array<any>);
  static getProviders(provider: IProvider, propertyKey?: string): Array<IProvider>;
  // returns all metadata for provider
  static getAllMetadataForTarget(provider: IProvider): Array<IMetadata>;
  // creates new child injector, provider and providers
  static createAndResolveChild(parent: Injector, Class: Function | IProvider, providers: Array<MixedProvider>): Injector;
  // creates new injector, provider and providers
  static createAndResolve(Class: Function | IProvider, providers: Array<MixedProvider>): Injector;
  // creates new provider and providers
  createAndResolve(provider: IProvider, providers: Array<IProvider>): any;
  // clens current injectables and all child injectors & providers
  destroy(): void;
  // check if providier exists on current SyncInjector instance
  has(key: any): boolean;
  // get provider value from current SyncInjector if not found bubble parrent's
  // if not found on any of parents exception is thrown.
  get(provider: string, Class?: IProvider): any;
  get<T>(provider: Type<T>, Class?: IProvider): T;
  // set provider and value
  set(key: any, value: Object): void;
  getParent(): Injector;
  setParent(injector: Injector): void;
  setName(provider: IProvider): void;
  hasChild(injector: Injector): boolean;
  addChild(injector: Injector): this;
}
```

[travis-url]: https://travis-ci.com/typeix/typeix

[travis-img]: https://travis-ci.com/typeix/typeix.svg?branch=main

[npm-version-img]: https://img.shields.io/npm/v/@typeix/resty

[coverage-img]: https://coveralls.io/repos/github/typeix/typeix/badge.svg?branch=main

[coverage-url]: https://coveralls.io/github/typeix/typeix?branch=mainaster
