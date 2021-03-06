import {Injector} from "./injector";
import {getMetadata, hasDecorator} from "@typeix/metadata";
import {uuid} from "@typeix/utils";
import {AfterConstruct, AsyncInterceptor, CreateProvider, Inject, Injectable} from "../decorators";
import {createMethodInterceptor, verifyProvider} from "../helpers";
import {IAfterConstruct, Interceptor, Method} from "../interfaces";


describe("Injector", () => {

  test("getConstructorProviders", () => {

    @Injectable()
    class AService {
    }

    @Injectable()
    class CService {
    }

    @Injectable()
    class RootService {
      @Inject() cService: CService;
    }

    @Injectable()
    class BService extends RootService {
      @Inject(AService)
      aService: AService;

      lService: AService;

      // eslint-disable-next-line @typescript-eslint/member-ordering
      @Inject() specialInjectTest: CService;

      uService: AService;


      constructor(
        aService: AService,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        @Inject("class") value1: CService,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        @Inject("factory") value2: AService,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        @Inject("value") value: string
      ) {
        super();
        this.lService = aService;
      }

      actionTest(@Inject("value") whatever: string) {
        return whatever;
      }
    }

    let metadata = getMetadata("design:paramtypes", BService);
    expect(metadata).toStrictEqual([AService, CService, AService, String]);
    let injector = Injector.Sync.createAndResolve(BService, [
      AService,
      CService,
      {provide: "value", useValue: "fancy"},
      {provide: "class", useClass: CService},
      {provide: "factory", useFactory: () => new AService()}
    ]);

    let service = injector.get(BService);

    expect(injector.hasName()).toBeTruthy();
    expect(service).toBeInstanceOf(BService);
    expect(service.aService).toBeInstanceOf(AService);
    expect(service.cService).toBeInstanceOf(CService);
    expect(service.lService).toBeInstanceOf(AService);
    expect(service.uService).toBeUndefined();
    expect(service.specialInjectTest).toBeInstanceOf(CService);
    expect(Object.getOwnPropertyNames(service)).toEqual(["lService", "aService", "specialInjectTest", "cService"]);
  });


  test("inheritance", () => {

    @Injectable()
    class CreatedInfoService {

    }

    @Injectable()
    class InfoService {
      @CreateProvider(CreatedInfoService)
      createdProviderTest: CreatedInfoService;
    }

    @Injectable()
    class BSubInfoService extends InfoService {
    }

    @Injectable()
    class ASubInfoService extends InfoService {
    }


    @Injectable()
    class RootService {
      @Inject() infoService: InfoService;
    }

    @Injectable()
    class AService extends RootService {
      @Inject() infoService: ASubInfoService;
    }


    @Injectable()
    class BService extends RootService {
      @Inject() infoService: BSubInfoService;
    }


    let bInjector = Injector.Sync.createAndResolve(BService, [BSubInfoService]);
    let bService: BService = bInjector.get(BService);
    expect(bService).toBeInstanceOf(BService);
    expect(bService.infoService).toBeInstanceOf(BSubInfoService);
    expect(bService.infoService.createdProviderTest).toBeInstanceOf(CreatedInfoService);

    let aInjector = Injector.Sync.createAndResolve(AService, [ASubInfoService]);
    let aService: AService = aInjector.get(AService);
    expect(aService).toBeInstanceOf(AService);
    expect(aService.infoService).toBeInstanceOf(ASubInfoService);

  });


  test("no provider test", () => {

    @Injectable()
    class InfoService {
    }

    @Injectable()
    class BSubInfoService extends InfoService {
    }

    @Injectable()
    class ASubInfoService extends InfoService {
    }


    @Injectable()
    class RootService {
      @Inject(InfoService) infoService: InfoService;
    }

    @Injectable()
    class AService extends RootService {
      @Inject(ASubInfoService) infoService: ASubInfoService;
    }


    @Injectable()
    class BService extends RootService {
      @Inject(BSubInfoService) infoService: BSubInfoService;
    }

    let bInjector = Injector.Sync.createAndResolve(BService, [BSubInfoService]);
    let bService: BService = bInjector.get(BService);
    expect(bService).toBeInstanceOf(BService);
    expect(bService.infoService).toBeInstanceOf(BSubInfoService);


    expect(() => Injector.Sync.createAndResolve(BService, [ASubInfoService]))
      .toThrow(/No provider BSubInfoService on class BService/);

    expect(() => Injector.Sync.createAndResolve(AService, [BSubInfoService]))
      .toThrow(/No provider ASubInfoService on class AService/);

  });


  test("children", () => {

    @Injectable()
    class InfoService {
    }

    @Injectable()
    class BSubInfoService extends InfoService {
    }

    @Injectable()
    class ASubInfoService extends InfoService {
    }


    @Injectable()
    class RootService {
      @Inject(InfoService) infoService: InfoService;
    }

    @Injectable()
    class AService extends RootService {
      @Inject(ASubInfoService) infoService: ASubInfoService;
    }


    @Injectable()
    class BService extends RootService {
      @Inject(BSubInfoService) infoService: BSubInfoService;
    }

    let parent = Injector.Sync.createAndResolve(AService, [ASubInfoService]);

    let siblingOne = Injector.Sync.createAndResolveChild(parent, BService, [BSubInfoService]);
    let bServiceOne: BService = siblingOne.get(BService);
    let aServiceOne: AService = siblingOne.get(AService);
    expect(bServiceOne).toBeInstanceOf(BService);
    expect(aServiceOne).toBeInstanceOf(AService);
    expect(bServiceOne.infoService).toBeInstanceOf(BSubInfoService);
    expect(aServiceOne.infoService).toBeInstanceOf(ASubInfoService);

    let siblingTwo = Injector.Sync.createAndResolveChild(parent, BService, [BSubInfoService]);
    let bServiceTwo: BService = siblingTwo.get(BService);
    let aServiceTwo: AService = siblingTwo.get(AService);
    expect(bServiceTwo).toBeInstanceOf(BService);
    expect(aServiceTwo).toBeInstanceOf(AService);
    expect(bServiceTwo.infoService).toBeInstanceOf(BSubInfoService);
    expect(aServiceTwo.infoService).toBeInstanceOf(ASubInfoService);

    expect(bServiceOne.infoService).not.toBe(bServiceTwo.infoService);
    expect(aServiceOne.infoService).toBe(aServiceTwo.infoService);

    let childSibling = Injector.Sync.createAndResolveChild(siblingTwo, BService, [BSubInfoService]);

    expect(parent.getInjectorsByProvider(verifyProvider(BService)))
      .toEqual([siblingOne, siblingTwo, childSibling]);


    expect(parent.hasChild(siblingOne)).toBeTruthy();
    expect(parent.hasChild(siblingTwo)).toBeTruthy();
    expect(siblingTwo.hasChild(childSibling)).toBeTruthy();
    expect(siblingOne.getParent()).toBe(parent);
    expect(siblingTwo.getParent()).toBe(parent);
    expect(childSibling.getParent()).toBe(siblingTwo);
    childSibling.detach();
    expect(childSibling.getParent()).toBe(undefined);
    expect(siblingTwo.hasChild(childSibling)).toBeFalsy();
  });


  test("tokens inherited root to its children", () => {

    @Injectable()
    class InfoService {
    }

    @Injectable()
    class BSubInfoService extends InfoService {
    }

    @Injectable()
    class ASubInfoService extends InfoService {
    }


    @Injectable()
    class RootService {
      @Inject(InfoService) infoService: InfoService;
    }

    @Injectable()
    class AService extends RootService {
      @Inject(ASubInfoService) infoService: ASubInfoService;
    }


    @Injectable()
    class BService extends RootService {
      @Inject(BSubInfoService) infoService: BSubInfoService;
    }

    let parent = Injector.Sync.createAndResolve(AService, [InfoService, ASubInfoService, BSubInfoService]);
    let child = Injector.Sync.createAndResolveChild(parent, BService, []);
    let bService: BService = child.get(BService);
    let aService: AService = child.get(AService);
    expect(bService).toBeInstanceOf(BService);
    expect(aService).toBeInstanceOf(AService);
    expect(bService.infoService).toBeInstanceOf(BSubInfoService);
    expect(aService.infoService).toBeInstanceOf(ASubInfoService);
    expect(parent).not.toBe(child);
  });

  test("tokens inherited root to its children recursive", () => {

    @Injectable()
    class CService {
    }


    @Injectable()
    class InfoService {
    }

    @Injectable()
    class BSubInfoService extends InfoService {
      @Inject(CService) cService: CService;
    }

    @Injectable()
    class ASubInfoService extends InfoService {
    }


    @Injectable()
    class RootService {
      @Inject(InfoService) infoService: InfoService;
    }

    @Injectable()
    class AService extends RootService {
      @Inject(ASubInfoService) infoService: ASubInfoService;
    }


    @Injectable()
    class BService extends RootService {
      @Inject(BSubInfoService) infoService: BSubInfoService;
      @Inject(CService) cService: CService;
    }

    let parent = Injector.Sync.createAndResolve(AService, [CService, InfoService, ASubInfoService, BSubInfoService]);
    let child = Injector.Sync.createAndResolveChild(parent, BService, []);
    let bService: BService = child.get(BService);
    let aService: AService = child.get(AService);
    expect(bService).toBeInstanceOf(BService);
    expect(aService).toBeInstanceOf(AService);
    expect(bService.infoService).toBeInstanceOf(BSubInfoService);
    expect(bService.infoService.cService).toBeInstanceOf(CService);
    expect(aService.infoService).toBeInstanceOf(ASubInfoService);
    expect(bService.cService).toBeInstanceOf(CService);
    expect(bService.cService).toBe(bService.infoService.cService);
    expect(parent).not.toBe(child);
  });

  test("afterConstruct", () => {
    @Injectable()
    class AfterConstructLegacy implements IAfterConstruct {
      static number = 0;

      afterConstruct() {
        AfterConstructLegacy.number += 1;
      }
    }

    @Injectable()
    class AfterConstructNew {
      static number = 0;

      @AfterConstruct()
      onInitDoSomeChanges() {
        AfterConstructNew.number += 1;
      }
    }

    expect(AfterConstructLegacy.number).toBe(0);
    Injector.Sync.createAndResolve(AfterConstructLegacy, []).get(AfterConstructLegacy);
    expect(AfterConstructLegacy.number).toBe(1);

    expect(AfterConstructNew.number).toBe(0);
    Injector.Sync.createAndResolve(AfterConstructNew, []).get(AfterConstructNew);
    expect(AfterConstructNew.number).toBe(1);
  });


  test("destroy", () => {


    @Injectable()
    class CService {
    }

    @Injectable()
    class DService {
    }


    @Injectable()
    class InfoService {
    }

    @Injectable()
    class BSubInfoService extends InfoService {
      @Inject(CService) cService: CService;
    }

    @Injectable()
    class ASubInfoService extends InfoService {
    }


    @Injectable()
    class RootService {
      @Inject() infoService: InfoService;
    }

    @Injectable()
    class AService extends RootService {
      @Inject() infoService: ASubInfoService;
    }


    @Injectable()
    class BService extends RootService {
      @Inject() infoService: BSubInfoService;
      @Inject() cService: CService;
      @Inject() dService: DService;
    }

    let parent = Injector.Sync.createAndResolve(AService, [
      CService,
      InfoService,
      ASubInfoService,
      {
        provide: BSubInfoService,
        useFactory: (serv: CService) => {
          let instance = new BSubInfoService();
          Reflect.set(instance, "cService", serv);
          return instance;
        },
        providers: [CService]
      }
    ]);
    let child = Injector.Sync.createAndResolveChild(parent, {
      provide: BService,
      useClass: BService,
      providers: [DService]
    }, []);

    expect(() => {
      child.setParent(new Injector.Sync());
    }).toThrow("Cannot redefine parent for injector: BService");

    expect(() => {
      child.setName(verifyProvider(BService));
    }).toThrow("Cannot redefine injector name: BService");
    expect(parent.getInjectorsByProvider(verifyProvider(Injector))).toEqual([parent, child]);
    expect(parent.getInjectorsByProvider(verifyProvider(AService))).toEqual([parent]);
    expect(parent.getInjectorsByProvider(verifyProvider(BService))).toEqual([child]);
    child.destroy();
    child.destroy();
    parent.destroy();
    parent.destroy();
    expect(child.getParent()).toBe(undefined);
    expect(parent.getInjectorsByProvider(verifyProvider(AService))).toEqual([]);
    expect(parent.getInjectorsByProvider(verifyProvider(BService))).toEqual([]);
    expect(parent.getInjectorsByProvider(verifyProvider(Injector))).toEqual([]);
  });


  test("interceptors", () => {
    let interceptor_count = 0, invocation_count = 0;
    let interceptor_result = [];
    let obj = {
      handler: (value) => {
        interceptor_count += 1;
        interceptor_result.push(value);
      }
    };

    @Injectable()
    class Logger {
      log(value) {
        obj.handler(value);
      }
    }

    @Injectable()
    class LoggerInterceptor implements Interceptor {
      @Inject() logger: Logger;

      invoke(method: Method): any {
        let result = method.invoke();
        this.logger.log({result, args: method.decoratorArgs});
      }
    }

    const FLog = (value) => createMethodInterceptor(FLog, LoggerInterceptor, {value});
    const DataLog = (value) => createMethodInterceptor(DataLog, LoggerInterceptor, {value});

    let uUID = null;

    @Injectable()
    class AService {

      @FLog("FLog")
      @DataLog("DataLog")
      process(): Date {
        invocation_count += 1;
        uUID = uuid();
        return uUID;
      }
    }

    const injector = Injector.Sync.createAndResolve(AService, [Logger]);
    const instance = injector.get(AService);
    const spy = jest.spyOn(obj, "handler");
    expect(uUID).toBeNull();
    let returnVal: any = instance.process();
    expect(uUID).not.toBeNull();
    expect(returnVal).toBe(uUID);
    expect(spy).toBeCalled();
    expect(invocation_count).toBe(1);
    expect(interceptor_count).toBe(2);
    expect(interceptor_result).toEqual([
      {result: uUID, args: {value: "DataLog"}},
      {result: uUID, args: {value: "FLog"}}
    ]);
    interceptor_result = [];
    let _cUID = uUID;
    uUID = null;
    expect(uUID).toBeNull();
    returnVal = instance.process();
    expect(uUID).not.toBeNull();
    expect(returnVal).toBe(uUID);
    expect(uUID === _cUID).toBeFalsy();
    expect(uUID).not.toBe(_cUID);
    expect(invocation_count).toBe(2);
    expect(interceptor_count).toBe(4);
    expect(interceptor_result).not.toEqual([
      {result: _cUID, args: {value: "DataLog"}},
      {result: _cUID, args: {value: "FLog"}}
    ]);
    expect(interceptor_result).toEqual([
      {result: uUID, args: {value: "DataLog"}},
      {result: uUID, args: {value: "FLog"}}
    ]);
  });

  test("interceptors transform", () => {
    let interceptor_count = 0, transform_count = 0, transform_interceptor_count = 0;
    let interceptor_result = [], transformed;
    let obj = {
      handler: (value) => {
        interceptor_count += 1;
        interceptor_result.push(value);
      },
      transform: (value) => {
        transformed = value;
      }
    };

    @Injectable()
    class Logger {
      log(value) {
        obj.handler(value);
      }
    }

    @Injectable()
    class LoggerInterceptor implements Interceptor {
      @Inject() logger: Logger;

      invoke(method: Method): any {
        let result = method.invoke();
        transform_interceptor_count += 1;
        this.logger.log({result, args: method.decoratorArgs});
      }
    }

    @Injectable()
    class TransformInterceptor implements Interceptor {
      invoke(method: Method): any {
        let result = method.invoke();
        transform_interceptor_count += 1;
        let val = method.decoratorArgs.value + "-" + result;
        obj.transform(val);
        method.transform(val);
      }
    }

    const FLog = (value) => createMethodInterceptor(FLog, LoggerInterceptor, {value});
    const DataLog = (value) => createMethodInterceptor(DataLog, LoggerInterceptor, {value});
    const Transform = (value) => createMethodInterceptor(Transform, TransformInterceptor, {value});

    let uUID = null, tUID = uuid();

    @Injectable()
    class AService {
      @FLog("FLog")
      @DataLog("DataLog")
      @Transform(tUID)
      transform(): number {
        transform_count += 1;
        uUID = uuid();
        return uUID;
      }
    }

    const injector = Injector.Sync.createAndResolve(AService, [Logger]);
    const instance = injector.get(AService);
    const spy = jest.spyOn(obj, "transform");
    expect(uUID).toBeNull();
    let returnVal = instance.transform();
    expect(uUID).not.toBeNull();
    expect(spy).toBeCalled();
    let _cUID = tUID + "-" + uUID;
    expect(returnVal).toBe(_cUID);
    expect(interceptor_count).toBe(2);
    expect(transform_count).toBe(1);
    expect(transform_interceptor_count).toBe(3);
    expect(transformed).toEqual(_cUID);
    expect(interceptor_result).toEqual([
      {result: _cUID, args: {value: "DataLog"}},
      {result: _cUID, args: {value: "FLog"}}
    ]);

    interceptor_result = [];
    let _dUID = tUID + "-" + uUID;
    uUID = null;
    expect(uUID).toBeNull();
    returnVal = instance.transform();
    _cUID = tUID + "-" + uUID;
    expect(uUID).not.toBeNull();
    expect(returnVal).toBe(_cUID);
    expect(_dUID === _cUID).toBeFalsy();
    expect(_dUID).not.toBe(_cUID);
    expect(interceptor_count).toBe(4);
    expect(transform_count).toBe(2);
    expect(transform_interceptor_count).toBe(6);
    expect(interceptor_result).not.toEqual([
      {result: _dUID, args: {value: "DataLog"}},
      {result: _dUID, args: {value: "FLog"}}
    ]);
    expect(interceptor_result).toEqual([
      {result: _cUID, args: {value: "DataLog"}},
      {result: _cUID, args: {value: "FLog"}}
    ]);
  });


  test("interceptors auto invoke", () => {
    let interceptor_count = 0, invocation_count = 0;
    let interceptor_result = [];
    let obj = {
      handler: (value) => {
        interceptor_count += 1;
        interceptor_result.push(value);
      }
    };

    @Injectable()
    class Logger {
      log(value) {
        obj.handler(value);
      }
    }

    @Injectable()
    class LoggerInterceptor implements Interceptor {

      @Inject() logger: Logger;

      invoke(method: Method): any {
        this.logger.log({args: method.decoratorArgs});
      }
    }

    const FLog = (value) => createMethodInterceptor(FLog, LoggerInterceptor, {value});
    const DataLog = (value) => createMethodInterceptor(DataLog, LoggerInterceptor, {value});


    @Injectable()
    class AService {

      @FLog("FLog")
      @DataLog("DataLog")
      process(): string {
        invocation_count += 1;
        return "result";
      }
    }

    const injector = Injector.Sync.createAndResolve(AService, [Logger]);
    const instance = injector.get(AService);
    const spy = jest.spyOn(obj, "handler");
    expect(instance.process()).toBe("result");
    expect(spy).toBeCalled();
    expect(invocation_count).toBe(1);
    expect(interceptor_count).toBe(2);
    expect(interceptor_result).toEqual([
      {args: {value: "DataLog"}},
      {args: {value: "FLog"}}
    ]);
  });

  test("interceptors async transform", async () => {
    let interceptor_count = 0, transform_count = 0, transform_interceptor_count = 0;
    let interceptor_result = [], transformed;
    let obj = {
      handler: (value) => {
        interceptor_count += 1;
        interceptor_result.push(value);
      },
      transform: (value) => {
        transformed = value;
      }
    };

    @Injectable()
    class Logger {
      log(value) {
        obj.handler(value);
      }
    }

    @Injectable()
    class LoggerInterceptor implements Interceptor {
      @Inject() logger: Logger;

      async invoke(method: Method): Promise<any> {
        let result = await method.invoke();
        transform_interceptor_count += 1;
        this.logger.log({result, args: method.decoratorArgs});
      }
    }

    @Injectable()
    class TransformInterceptor implements Interceptor {
      async invoke(method: Method): Promise<any> {
        let result = await method.invoke();
        transform_interceptor_count += 1;
        result = method.decoratorArgs.value + "-" + result;
        obj.transform(result);
        method.transform(result);
      }
    }

    const FLog = (value) => createMethodInterceptor(FLog, LoggerInterceptor, {value});
    const DataLog = (value) => createMethodInterceptor(DataLog, LoggerInterceptor, {value});
    const Transform = (value) => createMethodInterceptor(Transform, TransformInterceptor, {value});
    const Transform2 = (value) => createMethodInterceptor(Transform2, TransformInterceptor, {value});

    let uUID = null;

    @Injectable()
    class AService {
      @FLog("FLog")
      @DataLog("DataLog")
      @Transform("SECOND")
      @Transform2("FIRST")
      async transform(): Promise<any> {
        transform_count += 1;
        uUID = uuid();
        return uUID;
      }
    }

    const injector = Injector.Sync.createAndResolve(AService, [Logger]);
    const instance = injector.get(AService);
    const spy = jest.spyOn(obj, "transform");
    expect(uUID).toBeNull();
    let returnVal = await instance.transform();
    expect(uUID).not.toBeNull();
    expect(spy).toBeCalled();
    let _cUID = "SECOND-FIRST-" + uUID;
    expect(returnVal).toBe(_cUID);
    expect(interceptor_count).toBe(2);
    expect(transform_count).toBe(1);
    expect(transform_interceptor_count).toBe(4);
    expect(transformed).toEqual(_cUID);
    expect(interceptor_result).toEqual([
      {result: _cUID, args: {value: "DataLog"}},
      {result: _cUID, args: {value: "FLog"}}
    ]);

    interceptor_result = [];
    uUID = null;
    expect(uUID).toBeNull();
    returnVal = await instance.transform();
    _cUID = "SECOND-FIRST-" + uUID;
    expect(uUID).not.toBeNull();
    expect(returnVal).toBe(_cUID);
    expect(interceptor_count).toBe(4);
    expect(transform_count).toBe(2);
    expect(transform_interceptor_count).toBe(8);
    expect(interceptor_result).toEqual([
      {result: _cUID, args: {value: "DataLog"}},
      {result: _cUID, args: {value: "FLog"}}
    ]);
  });


  test("interceptors async transform with promise", async () => {
    let interceptor_count = 0, transform_count = 0, transform_interceptor_count = 0;
    let interceptor_result = [], transformed;
    let obj = {
      handler: (value) => {
        interceptor_count += 1;
        interceptor_result.push(value);
      },
      transform: (value) => {
        transformed = value;
      }
    };

    @Injectable()
    class Logger {
      log(value) {
        obj.handler(value);
      }
    }

    @Injectable()
    class LoggerInterceptor implements Interceptor {
      @Inject() logger: Logger;

      invoke(method: Method): Promise<any> {
        transform_interceptor_count += 1;
        return method.invoke().then(result => {
          this.logger.log({result, args: method.decoratorArgs});
          return result;
        });
      }
    }

    @Injectable()
    class TransformInterceptor implements Interceptor {
      invoke(method: Method): Promise<any> {
        return method.invoke()
          .then(result => {
            transform_interceptor_count += 1;
            result = method.decoratorArgs.value + "-" + result;
            obj.transform(result);
            return method.transform(result);
          });
      }
    }

    const FLog = (value) => createMethodInterceptor(FLog, LoggerInterceptor, {value});
    const DataLog = (value) => createMethodInterceptor(DataLog, LoggerInterceptor, {value});
    const Transform = (value) => createMethodInterceptor(Transform, TransformInterceptor, {value});
    const Transform2 = (value) => createMethodInterceptor(Transform2, TransformInterceptor, {value});

    let uUID = null;

    @Injectable()
    class AService {
      @FLog("FLog")
      @DataLog("DataLog")
      @Transform("SECOND")
      @Transform2("FIRST")
      async transform(): Promise<any> {
        transform_count += 1;
        uUID = uuid();
        return uUID;
      }
    }

    const injector = Injector.Sync.createAndResolve(AService, [Logger]);
    const instance = injector.get(AService);
    const spy = jest.spyOn(obj, "transform");
    expect(uUID).toBeNull();
    let returnVal = await instance.transform();
    expect(uUID).not.toBeNull();
    expect(spy).toBeCalled();
    let _cUID = "SECOND-FIRST-" + uUID;
    expect(returnVal).toBe(_cUID);
    expect(interceptor_count).toBe(2);
    expect(transform_count).toBe(1);
    expect(transform_interceptor_count).toBe(4);
    expect(transformed).toEqual(_cUID);
    expect(interceptor_result).toEqual([
      {result: _cUID, args: {value: "DataLog"}},
      {result: _cUID, args: {value: "FLog"}}
    ]);

    interceptor_result = [];
    uUID = null;
    expect(uUID).toBeNull();
    returnVal = await instance.transform();
    _cUID = "SECOND-FIRST-" + uUID;
    expect(uUID).not.toBeNull();
    expect(returnVal).toBe(_cUID);
    expect(interceptor_count).toBe(4);
    expect(transform_count).toBe(2);
    expect(transform_interceptor_count).toBe(8);
    expect(interceptor_result).toEqual([
      {result: _cUID, args: {value: "DataLog"}},
      {result: _cUID, args: {value: "FLog"}}
    ]);
  });

  test("interceptors async invoke", async () => {
    let interceptor_count = 0, invocation_count = 0;
    let interceptor_result = [];
    let obj = {
      handler: (value) => {
        interceptor_count += 1;
        interceptor_result.push(value);
      }
    };

    @Injectable()
    class Logger {
      log(value) {
        obj.handler(value);
      }
    }

    @Injectable()
    class LoggerInterceptor implements Interceptor {

      @Inject() logger: Logger;

      async invoke(method: Method): Promise<any> {
        let result = await method.invoke();
        this.logger.log({result, args: method.decoratorArgs});
        return result;
      }
    }

    const FLog = (value) => createMethodInterceptor(FLog, LoggerInterceptor, {value});
    const DataLog = (value) => createMethodInterceptor(DataLog, LoggerInterceptor, {value});


    @Injectable()
    class AService {

      @FLog("FLog")
      @DataLog("DataLog")
      async process(): Promise<any> {
        invocation_count += 1;
        return 1;
      }
    }

    const injector = Injector.Sync.createAndResolve(AService, [Logger]);
    const instance = injector.get(AService);
    const spy = jest.spyOn(obj, "handler");
    expect(await instance.process()).toBe(1);
    expect(spy).toBeCalled();
    expect(invocation_count).toBe(1);
    expect(interceptor_count).toBe(2);
    expect(interceptor_result).toEqual([
      {result: 1, args: {value: "DataLog"}},
      {result: 1, args: {value: "FLog"}}
    ]);
  });


  test("interceptors async decorator", async () => {
    let interceptor_count = 0, invocation_count = 0;
    let interceptor_result = [];
    let obj = {
      handler: (value) => {
        interceptor_count += 1;
        interceptor_result.push(value);
      }
    };

    @Injectable()
    class Logger {
      log(value) {
        obj.handler(value);
      }
    }

    @Injectable()
    class LoggerInterceptor implements Interceptor {

      @Inject() logger: Logger;

      invoke(method: Method): any {
        return method.invoke().then(result => {
          this.logger.log({result, args: method.decoratorArgs});
          return result;
        });
      }
    }

    const FLog = (value) => createMethodInterceptor(FLog, LoggerInterceptor, {value});
    const DataLog = (value) => createMethodInterceptor(DataLog, LoggerInterceptor, {value});


    @Injectable()
    class AService {

      @FLog("FLog")
      @DataLog("DataLog")
      @AsyncInterceptor()
      processAsyncDecorator(): any {
        invocation_count += 1;
        return Promise.resolve(1);
      }
    }

    const injector = Injector.Sync.createAndResolve(AService, [Logger]);
    const instance = injector.get(AService);
    const spy = jest.spyOn(obj, "handler");
    expect(hasDecorator(AsyncInterceptor, AService.prototype, "processAsyncDecorator")).toBe(true);
    expect(await instance.processAsyncDecorator()).toBe(1);
    expect(spy).toBeCalled();
    expect(invocation_count).toBe(1);
    expect(interceptor_count).toBe(2);
    expect(interceptor_result).toEqual([
      {result: 1, args: {value: "DataLog"}},
      {result: 1, args: {value: "FLog"}}
    ]);
  });

  test("interceptors async invoke Promise", async () => {
    let interceptor_count = 0, invocation_count = 0;
    let interceptor_result = [];
    let obj = {
      handler: (value) => {
        interceptor_count += 1;
        interceptor_result.push(value);
      }
    };

    @Injectable()
    class Logger {
      log(value) {
        obj.handler(value);
      }
    }

    @Injectable()
    class LoggerInterceptor implements Interceptor {

      @Inject() logger: Logger;

      invoke(method: Method): Promise<any> {
        return method.invoke().then(result => {
          this.logger.log({result, args: method.decoratorArgs});
          return result;
        });
      }
    }

    const FLog = (value) => createMethodInterceptor(FLog, LoggerInterceptor, {value});
    const DataLog = (value) => createMethodInterceptor(DataLog, LoggerInterceptor, {value});


    @Injectable()
    class AService {

      @FLog("FLog")
      @DataLog("DataLog")
      async process(): Promise<any> {
        invocation_count += 1;
        return 1;
      }
    }

    const injector = Injector.Sync.createAndResolve(AService, [Logger]);
    const instance = injector.get(AService);
    const spy = jest.spyOn(obj, "handler");
    expect(await instance.process()).toBe(1);
    expect(spy).toBeCalled();
    expect(invocation_count).toBe(1);
    expect(interceptor_count).toBe(2);
    expect(interceptor_result).toEqual([
      {result: 1, args: {value: "DataLog"}},
      {result: 1, args: {value: "FLog"}}
    ]);
  });


  test("interceptors async auto invoke", async () => {
    let interceptor_count = 0, invocation_count = 0;
    let interceptor_result = [];
    let obj = {
      handler: (value) => {
        interceptor_count += 1;
        interceptor_result.push(value);
      }
    };

    @Injectable()
    class Logger {
      log(value) {
        obj.handler(value);
      }
    }

    @Injectable()
    class LoggerInterceptor implements Interceptor {

      @Inject() logger: Logger;

      async invoke(method: Method): Promise<any> {
        this.logger.log({args: method.decoratorArgs});
      }
    }

    const FLog = (value) => createMethodInterceptor(FLog, LoggerInterceptor, {value});
    const DataLog = (value) => createMethodInterceptor(DataLog, LoggerInterceptor, {value});


    @Injectable()
    class AService {

      @FLog("FLog")
      @DataLog("DataLog")
      async process(): Promise<any> {
        invocation_count += 1;
        return "result";
      }
    }

    const injector = Injector.Sync.createAndResolve(AService, [Logger]);
    const instance = injector.get(AService);
    const spy = jest.spyOn(obj, "handler");
    expect(await instance.process()).toBe("result");
    expect(spy).toBeCalled();
    expect(invocation_count).toBe(1);
    expect(interceptor_count).toBe(2);
    expect(interceptor_result).toEqual([
      {args: {value: "DataLog"}},
      {args: {value: "FLog"}}
    ]);
    expect(() => {
      injector.get("whatever", null);
    }).toThrow();
  });


  test("interceptors args check", async () => {
    let transform_interceptor_count = 0;
    let cMethod: Method = undefined;

    @Injectable()
    class TransformInterceptor implements Interceptor {
      async invoke(method: Method): Promise<any> {
        cMethod = method;
        let result = await method.invoke();
        transform_interceptor_count += 1;
        result = method.decoratorArgs.value + "-" + result;
        method.transform(result);
      }
    }

    const Transform = (value) => createMethodInterceptor(Transform, TransformInterceptor, {value});


    @Injectable()
    class AService {
      @Transform("SECOND")
      async transform(@Inject("test") value: string): Promise<any> {
        return value;
      }
    }

    const injector = Injector.Sync.createAndResolve(AService, [{provide: "test", useValue: "test-value"}]);
    const instance = injector.get(AService);
    let returnVal = await instance.transform(injector.get("test"));
    expect(returnVal).toBe("SECOND-test-value");
    expect(transform_interceptor_count).toBe(1);
    expect(cMethod).toBeDefined();
    expect(cMethod.methodArgs).toEqual(["test-value"]);
  });


  test("interceptors args override check", async () => {
    let transform_interceptor_count = 0;
    let cMethod: Method = undefined;

    @Injectable()
    class TransformInterceptor implements Interceptor {
      async invoke(method: Method): Promise<any> {
        cMethod = method;
        let result = await method.invokeWithArgs("one");
        transform_interceptor_count += 1;
        result = method.decoratorArgs.value + "-" + result;
        method.transform(result);
      }
    }

    const Transform = (value) => createMethodInterceptor(Transform, TransformInterceptor, {value});

    @Injectable()
    class AService {
      @Transform("SECOND")
      async transform(@Inject("test") value: string): Promise<any> {
        return value;
      }
    }

    const injector = Injector.Sync.createAndResolve(AService, [{provide: "test", useValue: "test-value"}]);
    const instance = injector.get(AService);
    let returnVal = await instance.transform(injector.get("test"));
    expect(returnVal).toBe("SECOND-one");
    expect(transform_interceptor_count).toBe(1);
    expect(cMethod).toBeDefined();
    expect(cMethod.methodArgs).toEqual(["test-value"]);
  });

  test("interceptors args override reference check", async () => {
    let transform_interceptor_count = 0;
    let cMethod: Method = undefined;

    @Injectable()
    class TransformInterceptor implements Interceptor {
      async invoke(method: Method): Promise<any> {
        cMethod = method;
        let result = await method.invokeWithArgs("one");
        transform_interceptor_count += 1;
        result = method.decoratorArgs.value + "-" + result;
        method.transform(result);
      }
    }

    const Transform = (value) => createMethodInterceptor(Transform, TransformInterceptor, {value});

    @Injectable()
    class AService {
      @Transform("SECOND")
      async transform(@Inject("test") value: string): Promise<any> {
        return value;
      }
    }

    const injector = Injector.Sync.createAndResolve(AService, [{provide: "test", useValue: "test-value"}]);
    const instance = injector.get(AService);
    let returnVal = await instance.transform(injector.get("test"));
    expect(returnVal).toBe("SECOND-one");
    expect(transform_interceptor_count).toBe(1);
    expect(cMethod).toBeDefined();
    expect(cMethod.methodArgs).toEqual(["test-value"]);

  });

});
