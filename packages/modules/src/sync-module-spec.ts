import {Module} from "./module";
import {getProviderName, Inject, Injectable, Injector, verifyProvider} from "@typeix/di";
import {ModuleInjector} from "./injector";

describe("sync @Module", () => {

  test("no imports exports", () => {

    @Injectable()
    class AService {
    }

    @Injectable()
    class BService {
      @Inject(AService) aService: AService;
    }

    @Module({
      providers: [ AService, BService ]
    })
    class ApplicationModule {
      @Inject(BService) bService: BService;
      @Inject(AService) aService: AService;
    }

    let injector = ModuleInjector.Sync.createAndResolve(ApplicationModule, []);
    let module: ApplicationModule = injector.get(ApplicationModule);

    expect(module).toBeInstanceOf(ApplicationModule);
    expect(module.bService).toBeInstanceOf(BService);
    expect(module.aService).toBeInstanceOf(AService);

  });


  test("imports", () => {

    @Injectable()
    class AService {
    }

    @Injectable()
    class BService {
      @Inject(AService) aService: AService;
    }

    @Module({
      providers: [ AService, BService ]
    })
    class ApplicationModuleD {
      @Inject(BService) bService: BService;
      @Inject(AService) aService: AService;
    }

    @Module({
      imports: [ ApplicationModuleD ],
      providers: [ AService, BService ]
    })
    class ApplicationModuleC {
      @Inject(BService) bService: BService;
      @Inject(AService) aService: AService;
    }

    @Module({
      imports: [ ApplicationModuleC ],
      providers: [ AService, BService ]
    })
    class ApplicationModuleB {
      @Inject(BService) bService: BService;
      @Inject(AService) aService: AService;
    }

    @Module({
      imports: [ ApplicationModuleB, ApplicationModuleD ],
      providers: [ AService, BService ]
    })
    class ApplicationModuleA {
      @Inject(BService) bService: BService;
      @Inject(AService) aService: AService;
    }

    let injector = ModuleInjector.Sync.createAndResolve(ApplicationModuleA, []);

    let moduleD: ApplicationModuleD = injector.get(ApplicationModuleD);

    expect(moduleD).toBeInstanceOf(ApplicationModuleD);
    expect(moduleD.bService).toBeInstanceOf(BService);
    expect(moduleD.aService).toBeInstanceOf(AService);

    let moduleC: ApplicationModuleC = injector.get(ApplicationModuleC);

    expect(moduleC).toBeInstanceOf(ApplicationModuleC);
    expect(moduleC.bService).toBeInstanceOf(BService);
    expect(moduleC.aService).toBeInstanceOf(AService);

    let moduleB: ApplicationModuleB = injector.get(ApplicationModuleB);

    expect(moduleB).toBeInstanceOf(ApplicationModuleB);
    expect(moduleB.bService).toBeInstanceOf(BService);
    expect(moduleB.aService).toBeInstanceOf(AService);

    let moduleA: ApplicationModuleA = injector.get(ApplicationModuleA);

    expect(moduleA).toBeInstanceOf(ApplicationModuleA);
    expect(moduleA.bService).toBeInstanceOf(BService);
    expect(moduleA.aService).toBeInstanceOf(AService);

    // d should not be a b c
    expect(moduleD.bService).not.toBe(moduleC.bService);
    expect(moduleD.aService).not.toBe(moduleC.aService);
    expect(moduleD.bService).not.toBe(moduleB.bService);
    expect(moduleD.aService).not.toBe(moduleB.aService);
    expect(moduleD.bService).not.toBe(moduleA.bService);
    expect(moduleD.aService).not.toBe(moduleA.aService);

    // c should not be a or b
    expect(moduleC.bService).not.toBe(moduleB.bService);
    expect(moduleC.aService).not.toBe(moduleB.aService);
    expect(moduleC.bService).not.toBe(moduleA.bService);
    expect(moduleC.aService).not.toBe(moduleA.aService);

    // b should not be a
    expect(moduleB.bService).not.toBe(moduleA.bService);
    expect(moduleB.aService).not.toBe(moduleA.aService);

    // b service a reference should be the same as module a service
    expect(moduleD.bService.aService).toBe(moduleD.aService);
    expect(moduleC.bService.aService).toBe(moduleC.aService);
    expect(moduleB.bService.aService).toBe(moduleB.aService);
    expect(moduleA.bService.aService).toBe(moduleA.aService);
    expect(injector.has(ApplicationModuleD)).toBeTruthy();
    injector.remove(ApplicationModuleD);
    expect(injector.has(ApplicationModuleD)).toBeFalsy();
    expect(() => {
      injector.createAndResolve(ApplicationModuleA, injector.getInjector(ApplicationModuleA));
    }).toThrow(`Module ${getProviderName(verifyProvider(ApplicationModuleA))} is already initialized`);

    let method = Reflect.get(injector, "processImportsAndExports");
    expect(method([], {})).toEqual([]);
  });


  test("exports", () => {

    @Injectable()
    class AService {
    }

    @Injectable()
    class BService {
      @Inject(AService) aService: AService;
    }

    @Module({
      providers: [ AService, BService ],
      exports: [ AService, BService ]
    })
    class ApplicationModuleD {
      @Inject(BService) bService: BService;
      @Inject(AService) aService: AService;
    }

    @Module({
      imports: [ ApplicationModuleD ],
      exports: [ AService, BService ],
      providers: []
    })
    class ApplicationModuleC {
      @Inject(BService) bService: BService;
      @Inject(AService) aService: AService;
    }

    @Module({
      imports: [ ApplicationModuleC ],
      providers: []
    })
    class ApplicationModuleB {
      @Inject(BService) bService: BService;
      @Inject(AService) aService: AService;
    }

    @Module({
      imports: [ ApplicationModuleB, ApplicationModuleD ],
      providers: [ AService, BService ]
    })
    class ApplicationModuleA {
      @Inject(BService) bService: BService;
      @Inject(AService) aService: AService;
    }

    let injector = ModuleInjector.Sync.createAndResolve(ApplicationModuleA, []);

    let moduleD: ApplicationModuleD = injector.get(ApplicationModuleD);

    expect(moduleD).toBeInstanceOf(ApplicationModuleD);
    expect(moduleD.bService).toBeInstanceOf(BService);
    expect(moduleD.aService).toBeInstanceOf(AService);

    let moduleC: ApplicationModuleC = injector.get(ApplicationModuleC);

    expect(moduleC).toBeInstanceOf(ApplicationModuleC);
    expect(moduleC.bService).toBeInstanceOf(BService);
    expect(moduleC.aService).toBeInstanceOf(AService);

    let moduleB: ApplicationModuleB = injector.get(ApplicationModuleB);

    expect(moduleB).toBeInstanceOf(ApplicationModuleB);
    expect(moduleB.bService).toBeInstanceOf(BService);
    expect(moduleB.aService).toBeInstanceOf(AService);

    let moduleA: ApplicationModuleA = injector.get(ApplicationModuleA);

    expect(moduleA).toBeInstanceOf(ApplicationModuleA);
    expect(moduleA.bService).toBeInstanceOf(BService);
    expect(moduleA.aService).toBeInstanceOf(AService);

    // d should not be a but is should be b c
    expect(moduleD.bService).toBe(moduleC.bService);
    expect(moduleD.aService).toBe(moduleC.aService);
    expect(moduleD.bService).toBe(moduleB.bService);
    expect(moduleD.aService).toBe(moduleB.aService);
    expect(moduleD.bService).not.toBe(moduleA.bService);
    expect(moduleD.aService).not.toBe(moduleA.aService);

    // c should not be a but is should be b
    expect(moduleC.bService).toBe(moduleB.bService);
    expect(moduleC.aService).toBe(moduleB.aService);
    expect(moduleC.bService).not.toBe(moduleA.bService);
    expect(moduleC.aService).not.toBe(moduleA.aService);

    // b should not be a
    expect(moduleB.bService).not.toBe(moduleA.bService);
    expect(moduleB.aService).not.toBe(moduleA.aService);

    // b service a reference should be the same as module a service
    expect(moduleD.bService.aService).toBe(moduleD.aService);
    expect(moduleC.bService.aService).toBe(moduleC.aService);
    expect(moduleB.bService.aService).toBe(moduleB.aService);
    expect(moduleA.bService.aService).toBe(moduleA.aService);
  });


  test("exports merge left order", () => {

    @Injectable()
    class AService {
    }

    @Injectable()
    class BService {
      @Inject(AService) aService: AService;
    }

    @Module({
      providers: [ AService, BService ],
      exports: [ AService, BService ]
    })
    class ApplicationModuleD {
      @Inject(BService) bService: BService;
      @Inject(AService) aService: AService;
    }

    @Module({
      imports: [ ApplicationModuleD ],
      exports: [ AService, BService ],
      providers: []
    })
    class ApplicationModuleC {
      @Inject(BService) bService: BService;
      @Inject(AService) aService: AService;
    }

    @Module({
      imports: [ ApplicationModuleC ],
      providers: [ AService ]
    })
    class ApplicationModuleB {
      @Inject(BService) bService: BService;
      @Inject(AService) aService: AService;
    }

    @Module({
      imports: [ ApplicationModuleB, ApplicationModuleD ],
      providers: [ AService, BService ]
    })
    class ApplicationModuleA {
      @Inject(BService) bService: BService;
      @Inject(AService) aService: AService;
    }

    let injector = ModuleInjector.Sync.createAndResolve(ApplicationModuleA, []);

    let moduleD: ApplicationModuleD = injector.get(ApplicationModuleD);
    let moduleC: ApplicationModuleC = injector.get(ApplicationModuleC);
    let moduleB: ApplicationModuleB = injector.get(ApplicationModuleB);
    let moduleA: ApplicationModuleA = injector.get(ApplicationModuleA);

    expect(moduleD).toBeInstanceOf(ApplicationModuleD);
    expect(moduleD.bService).toBeInstanceOf(BService);
    expect(moduleD.aService).toBeInstanceOf(AService);


    expect(moduleC).toBeInstanceOf(ApplicationModuleC);
    expect(moduleC.bService).toBeInstanceOf(BService);
    expect(moduleC.aService).toBeInstanceOf(AService);


    expect(moduleB).toBeInstanceOf(ApplicationModuleB);
    expect(moduleB.bService).toBeInstanceOf(BService);
    expect(moduleB.aService).toBeInstanceOf(AService);


    expect(moduleA).toBeInstanceOf(ApplicationModuleA);
    expect(moduleA.bService).toBeInstanceOf(BService);
    expect(moduleA.aService).toBeInstanceOf(AService);


    expect(moduleD.bService).toBe(moduleC.bService);
    expect(moduleD.aService).toBe(moduleC.aService);
    expect(moduleD.bService).toBe(moduleB.bService);
    expect(moduleD.aService).not.toBe(moduleB.aService);
    expect(moduleD.bService).not.toBe(moduleA.bService);
    expect(moduleD.aService).not.toBe(moduleA.aService);


    expect(moduleC.bService).toBe(moduleB.bService);
    expect(moduleC.aService).not.toBe(moduleB.aService);
    expect(moduleC.bService).not.toBe(moduleA.bService);
    expect(moduleC.aService).not.toBe(moduleA.aService);


    expect(moduleB.bService).not.toBe(moduleA.bService);
    expect(moduleB.aService).not.toBe(moduleA.aService);


    expect(moduleD.bService.aService).toBe(moduleD.aService);
    expect(moduleC.bService.aService).toBe(moduleC.aService);
    expect(moduleB.bService.aService).not.toBe(moduleB.aService);
    expect(moduleA.bService.aService).toBe(moduleA.aService);
  });


  test("getAllMetadata", () => {

    @Injectable()
    class AService {
    }

    @Injectable()
    class BService {
      @Inject(AService) aService: AService;
    }

    let metadataD = {
      providers: [ AService, BService ],
      exports: [ AService, BService ]
    };

    @Module(metadataD)
    class ApplicationModuleD {
      @Inject(BService) bService: BService;
      @Inject(AService) aService: AService;
    }

    let metadataC = {
      imports: [ ApplicationModuleD ],
      exports: [ AService, BService ],
      providers: []
    };

    @Module(metadataC)
    class ApplicationModuleC {
      @Inject(BService) bService: BService;
      @Inject(AService) aService: AService;
    }

    let metadataB = {
      imports: [ ApplicationModuleC ],
      providers: [ AService ]
    };

    @Module(metadataB)
    class ApplicationModuleB {
      @Inject(BService) bService: BService;
      @Inject(AService) aService: AService;
    }

    let metadataA = {
      imports: [ ApplicationModuleB, ApplicationModuleD ],
      providers: [ AService, BService ]
    };

    @Module(metadataA)
    class ApplicationModuleA {
      @Inject(BService) bService: BService;
      @Inject(AService) aService: AService;
    }

    let injector = ModuleInjector.Sync.createAndResolve(ApplicationModuleA, []);
    let allModuleMetadata = injector.getAllMetadata();

    let metadataContainer = new Map();
    metadataContainer.set(ApplicationModuleA, metadataA);
    metadataContainer.set(ApplicationModuleB, metadataB);
    metadataContainer.set(ApplicationModuleC, metadataC);
    metadataContainer.set(ApplicationModuleD, metadataD);

    expect(allModuleMetadata).toEqual(metadataContainer);

  });


  test("shared providers", () => {

    @Injectable()
    class AService {
    }

    @Injectable()
    class BService {
      @Inject(AService) aService: AService;
    }

    @Injectable()
    class CService {}

    let metadataD = {
      providers: [ AService, BService ],
      exports: [ AService, BService ]
    };

    @Module(metadataD)
    class ApplicationModuleD {
      @Inject(BService) bService: BService;
      @Inject(AService) aService: AService;
      @Inject(CService) cService: CService;
    }

    let metadataC = {
      imports: [ ApplicationModuleD ],
      exports: [ AService, BService ],
      providers: []
    };

    @Module(metadataC)
    class ApplicationModuleC {
      @Inject(BService) bService: BService;
      @Inject(AService) aService: AService;
      @Inject(CService) cService: CService;
    }

    let metadataB = {
      imports: [ ApplicationModuleC ],
      providers: [ AService ]
    };

    @Module(metadataB)
    class ApplicationModuleB {
      @Inject(BService) bService: BService;
      @Inject(AService) aService: AService;
      @Inject(CService) cService: CService;
    }

    let metadataA = {
      imports: [ ApplicationModuleB, ApplicationModuleD ],
      providers: [ AService, BService, CService ]
    };

    @Module(metadataA)
    class ApplicationModuleA {
      @Inject(BService) bService: BService;
      @Inject(AService) aService: AService;
      @Inject(CService) cService: CService;
    }

    let cInjector = Injector.Sync.createAndResolve(CService, []);
    let cInstance = cInjector.get(CService);

    let injector = ModuleInjector.Sync.createAndResolve(ApplicationModuleA, [ {provide: CService, useValue: cInstance} ]);

    let moduleD: ApplicationModuleD = injector.get(ApplicationModuleD);
    let moduleC: ApplicationModuleC = injector.get(ApplicationModuleC);
    let moduleB: ApplicationModuleB = injector.get(ApplicationModuleB);
    let moduleA: ApplicationModuleA = injector.get(ApplicationModuleA);

    expect(moduleD).toBeInstanceOf(ApplicationModuleD);
    expect(moduleD.bService).toBeInstanceOf(BService);
    expect(moduleD.aService).toBeInstanceOf(AService);
    expect(moduleD.cService).toBeInstanceOf(CService);

    expect(moduleC).toBeInstanceOf(ApplicationModuleC);
    expect(moduleC.bService).toBeInstanceOf(BService);
    expect(moduleC.aService).toBeInstanceOf(AService);
    expect(moduleD.cService).toBeInstanceOf(CService);


    expect(moduleB).toBeInstanceOf(ApplicationModuleB);
    expect(moduleB.bService).toBeInstanceOf(BService);
    expect(moduleB.aService).toBeInstanceOf(AService);
    expect(moduleD.cService).toBeInstanceOf(CService);


    expect(moduleA).toBeInstanceOf(ApplicationModuleA);
    expect(moduleA.bService).toBeInstanceOf(BService);
    expect(moduleA.aService).toBeInstanceOf(AService);
    expect(moduleD.cService).toBeInstanceOf(CService);


    expect(moduleD.bService).toBe(moduleC.bService);
    expect(moduleD.aService).toBe(moduleC.aService);
    expect(moduleD.bService).toBe(moduleB.bService);
    expect(moduleD.aService).not.toBe(moduleB.aService);
    expect(moduleD.bService).not.toBe(moduleA.bService);
    expect(moduleD.aService).not.toBe(moduleA.aService);


    expect(moduleC.bService).toBe(moduleB.bService);
    expect(moduleC.aService).not.toBe(moduleB.aService);
    expect(moduleC.bService).not.toBe(moduleA.bService);
    expect(moduleC.aService).not.toBe(moduleA.aService);


    expect(moduleB.bService).not.toBe(moduleA.bService);
    expect(moduleB.aService).not.toBe(moduleA.aService);


    expect(moduleD.bService.aService).toBe(moduleD.aService);
    expect(moduleC.bService.aService).toBe(moduleC.aService);
    expect(moduleB.bService.aService).not.toBe(moduleB.aService);
    expect(moduleA.bService.aService).toBe(moduleA.aService);

    expect(moduleA.cService).toBe(cInstance);
    expect(moduleB.cService).toBe(cInstance);
    expect(moduleC.cService).toBe(cInstance);
    expect(moduleD.cService).toBe(cInstance);
  });
});
