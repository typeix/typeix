import {
  createClassDecorator,
  createMethodDecorator,
  createParameterAndPropertyDecorator,
  createPropertyDecorator,
  getClassMetadata,
  getDecoratorId,
  getAllMetadataForTarget,
  getAllMetadataKeysForTarget,
  getMethodMetadata,
  getParameterMetadata,
  getPropertyMetadata,
  hasDecorator,
  getMetadataForTarget,
  getMetadataKeysForTarget,
  IMetadata,
  defineMetadata,
  TS_TYPE,
  TS_PARAMS,
  TS_RETURN,
  hasMetadata,
  hasOwnMetadata,
  getOwnMetadata,
  getOwnMetadataKeys,
  deleteMetadata,
  getDecoratorUUID,
  getDecoratorType,
  getDecoratorName, createParameterDecorator, validateDecorator
} from "./metadata";

describe("Decorators", () => {

  test("ClassDecorator", () => {
    let Injectable = () => createClassDecorator(Injectable);

    @Injectable()
    class BService {
    }

    expect(getClassMetadata(Injectable, BService)).toStrictEqual({
      args: {},
      type: "constructor",
      metadataKey: getDecoratorId(Injectable),
      decoratorType: "constructor",
      propertyKey: "constructor",
      decorator: Injectable
    });
    expect(getDecoratorId(Injectable)).toMatch("@typeix:constructor");
    expect(hasDecorator(Injectable, BService)).toBeTruthy();
  });

  test("ClassDecorator with Args", () => {
    let Injectable = (...args: any) => createClassDecorator(Injectable, args);

    @Injectable("Custom", "Arguments")
    class BService {
    }


    expect(getDecoratorId(Injectable)).toMatch("@typeix:constructor:Injectable");
    expect(hasDecorator(Injectable, BService)).toBeTruthy();
    expect(getClassMetadata(Injectable, BService)).toStrictEqual({
      args: {0: "Custom", 1: "Arguments"},
      metadataKey: getDecoratorId(Injectable),
      decorator: Injectable,
      decoratorType: "constructor",
      propertyKey: "constructor",
      type: "constructor"
    });
  });

  test("ClassDecorator with Named Args", () => {
    let Injectable = (token, name) => createClassDecorator(Injectable, {token, name});

    @Injectable("Custom", "Arguments")
    class BService {
    }


    expect(getDecoratorId(Injectable)).toMatch("@typeix:constructor:Injectable");
    expect(hasDecorator(Injectable, BService)).toBeTruthy();
    expect(getClassMetadata(Injectable, BService)).toStrictEqual({
      args: {token: "Custom", name: "Arguments"},
      metadataKey: getDecoratorId(Injectable),
      decorator: Injectable,
      decoratorType: "constructor",
      propertyKey: "constructor",
      type: "constructor"
    });
  });


  test("PropertyDecorator with Args", () => {
    let Injectable = () => createClassDecorator(Injectable);
    let Inject = (token: Function) => createPropertyDecorator(Inject, {token});

    @Injectable()
    class AService {
    }

    class BService {
      @Inject(AService)
      publicProperty: AService;
    }


    expect(getDecoratorId(Injectable)).toMatch("@typeix:constructor:Injectable");
    expect(getDecoratorId(Inject)).toMatch("@typeix:property:Inject");
    let decorator = getPropertyMetadata(Inject, BService, "publicProperty");
    expect(decorator).toStrictEqual({
      args: {
        token: AService
      },
      metadataKey: getDecoratorId(Inject),
      decoratorType: "property",
      propertyKey: "publicProperty",
      decorator: Inject,
      designType: AService,
      type: "property"
    });
  });

  test("Parameter with Args", () => {
    let Injectable = () => createClassDecorator(Injectable);
    let Inject = (token?) => createParameterAndPropertyDecorator(Inject, {token});

    @Injectable()
    class AService {
    }

    class BService {
      @Inject() publicProperty: AService;

      constructor(@Inject() firstProperty: AService) {
      }


      publicMethod(
        @Inject() firstProperty: AService,
        @Inject(AService) secondProperty: AService,
        thirdProperty: string
      ) {
      }

    }

    expect(getDecoratorId(Injectable)).toMatch("@typeix:constructor:Injectable");
    expect(getDecoratorId(Inject)).toMatch("@typeix:mixed:Inject");

    let decorator = getPropertyMetadata(Inject, BService, "publicProperty");
    expect(decorator).toStrictEqual({
      args: {token: undefined},
      metadataKey: getDecoratorId(Inject),
      decoratorType: "mixed",
      propertyKey: "publicProperty",
      designType: AService,
      decorator: Inject,
      type: "property"
    });

    decorator = getParameterMetadata(Inject, BService, 0, "publicMethod");
    expect(decorator).toStrictEqual({
      args: {token: undefined},
      designType: Function,
      designParam: [
        AService,
        AService,
        String
      ],
      decorator: Inject,
      decoratorType: "mixed",
      metadataKey: getDecoratorId(Inject, 0),
      propertyKey: "publicMethod",
      paramIndex: 0,
      designReturn: undefined,
      type: "parameter"
    });

    let name = getDecoratorId(Inject, 1);
    decorator = getParameterMetadata(Inject, BService, 1, "publicMethod");
    expect(decorator).toStrictEqual({
      args: {token: AService},
      designType: Function,
      designParam: [
        AService,
        AService,
        String
      ],
      decoratorType: "mixed",
      metadataKey: name,
      propertyKey: "publicMethod",
      paramIndex: 1,
      decorator: Inject,
      designReturn: undefined,
      type: "parameter"
    });
  });

  test("Parameter static parameter error", () => {
    let Injectable = () => createClassDecorator(Injectable);
    let Inject = (token?) => createParameterAndPropertyDecorator(Inject, {token});

    @Injectable()
    class AService {
    }

    expect(getDecoratorId(Injectable)).toMatch("@typeix:constructor:Injectable");
    expect(() => {
      class BService {
        static staticMethod(
          @Inject() firstProperty: AService,
          @Inject(AService) secondProperty: AService,
          thirdProperty: string
        ) {
        }
      }
    }).toThrow("Decorator can´t be declared on static method/property: staticMethod");

    expect(() => {
      class BService {
        @Inject() static staticProperty: AService;
      }
    }).toThrow("Decorator can´t be declared on static method/property: staticProperty");
  });


  test("Method decorator", () => {
    let Injectable = () => createClassDecorator(Injectable);
    let Inject = (token?) => createMethodDecorator(Inject, {token});

    @Injectable()
    class AService {
    }

    class BService {

      @Inject()
      methodDecoratorString(): string {
        return "string";
      }

      @Inject(1)
      @Inject(2)
      methodDecorator() {
      }

      @Inject()
      static staticDecorator() {
      }
    }

    expect(getDecoratorId(Inject)).toMatch("@typeix:method:Inject");
    let decorator = getMethodMetadata(Inject, BService, "methodDecorator");
    expect(decorator).toEqual([
      {
        args: {token: 2},
        type: "method",
        designParam: [],
        decoratorType: "method",
        decorator: Inject,
        metadataKey: getDecoratorId(Inject),
        propertyKey: "methodDecorator",
        designReturn: undefined,
        designType: Function
      },
      {
        args: {token: 1},
        type: "method",
        designParam: [],
        decoratorType: "method",
        decorator: Inject,
        metadataKey: getDecoratorId(Inject),
        propertyKey: "methodDecorator",
        designReturn: undefined,
        designType: Function
      }
    ]);

    decorator = getMethodMetadata(Inject, BService, "methodDecoratorString");
    expect(decorator).toStrictEqual({
      args: {token: undefined},
      type: "method",
      designParam: [],
      decoratorType: "method",
      decorator: Inject,
      metadataKey: getDecoratorId(Inject),
      propertyKey: "methodDecoratorString",
      designReturn: String,
      designType: Function
    });

    decorator = getMethodMetadata(Inject, BService, "staticDecorator", true);
    expect(decorator).toStrictEqual({
      args: {token: undefined},
      type: "static",
      designParam: [],
      decoratorType: "method",
      decorator: Inject,
      metadataKey: getDecoratorId(Inject),
      propertyKey: "staticDecorator",
      designReturn: undefined,
      designType: Function
    });
  });


  test("Get Decorator Metadata", () => {
    let Injectable = () => createClassDecorator(Injectable);
    let Inject = (token?) => createParameterAndPropertyDecorator(Inject, {token});
    let SetHeader = (key, value) => createMethodDecorator(SetHeader, {key, value});

    @Injectable()
    class AService {
    }

    @Injectable()
    class DService {
    }

    @Injectable()
    class BService {
      @Inject() bServiceProperty: AService;

      constructor(@Inject() bServiceConst: AService) {
      }

      @SetHeader("content-type", "application/json")
      @SetHeader("connection", "closed")
      publicMethod(@Inject() firstProperty: AService, @Inject(AService) secondProperty: AService, thirdProperty: string) {
        //
      }
    }

    @Injectable()
    class CService extends BService {
      @Inject() cServiceProperty: AService;

      constructor(@Inject() cServiceConst: AService, @Inject() dServiceConst: DService) {
        super(cServiceConst);
      }

      publicMethod(
        @Inject() firstProperty: AService,
        @Inject(AService) secondProperty: AService,
        thirdProperty: string
      ) {
      }
    }

    let keys = getAllMetadataKeysForTarget(CService);
    expect(keys).toStrictEqual([
      {
        propertyKey: undefined,
        target: CService,
        metadataKey: "design:paramtypes"
      },
      {
        propertyKey: undefined,
        target: CService,
        metadataKey: getDecoratorId(Inject, 1)
      },
      {
        propertyKey: undefined,
        target: CService,
        metadataKey: getDecoratorId(Inject, 0)
      },
      {
        propertyKey: undefined,
        target: CService,
        metadataKey: getDecoratorId(Injectable)
      },
      {
        propertyKey: "publicMethod",
        target: CService.prototype,
        metadataKey: "design:returntype"
      },
      {
        propertyKey: "publicMethod",
        target: CService.prototype,
        metadataKey: "design:paramtypes"
      },
      {
        propertyKey: "publicMethod",
        target: CService.prototype,
        metadataKey: "design:type"
      },
      {
        propertyKey: "publicMethod",
        target: CService.prototype,
        metadataKey: getDecoratorId(Inject, 1)
      },
      {
        propertyKey: "publicMethod",
        target: CService.prototype,
        metadataKey: getDecoratorId(Inject, 0)
      },
      {
        propertyKey: "publicMethod",
        target: CService.prototype,
        metadataKey: getDecoratorId(SetHeader)
      },
      {
        propertyKey: "cServiceProperty",
        target: CService.prototype,
        metadataKey: "design:type"
      },
      {
        propertyKey: "cServiceProperty",
        target: CService.prototype,
        metadataKey: getDecoratorId(Inject)
      },
      {
        propertyKey: "bServiceProperty",
        target: BService.prototype,
        metadataKey: "design:type"
      },
      {
        propertyKey: "bServiceProperty",
        target: BService.prototype,
        metadataKey: getDecoratorId(Inject)
      }
    ]);

    let metadata = getAllMetadataForTarget(CService);
    expect(metadata.length).toBe(19);
    expect(metadata.shift()).toEqual({
      args: [
        AService,
        DService
      ],
      "metadataKey": "design:paramtypes",
      "propertyKey": "constructor"
    });
    expect(metadata.shift()).toEqual({
      args: {
        token: undefined
      },
      "decoratorType": "mixed",
      decorator: Inject,
      "type": "parameter",
      "metadataKey": getDecoratorId(Inject, 1),
      "paramIndex": 1,
      "propertyKey": "constructor",
      "designParam": [
        AService,
        DService
      ]
    });
    expect(metadata.shift()).toEqual({
      "args": {
        token: undefined
      },
      "decoratorType": "mixed",
      decorator: Inject,
      "type": "parameter",
      "metadataKey": getDecoratorId(Inject, 0),
      "paramIndex": 0,
      "propertyKey": "constructor",
      "designParam": [
        AService
      ]
    });
    expect(metadata.shift()).toEqual({
      "args": {
        token: undefined
      },
      "decoratorType": "mixed",
      decorator: Inject,
      "type": "parameter",
      "metadataKey": getDecoratorId(Inject, 0),
      "paramIndex": 0,
      "propertyKey": "constructor",
      "designParam": [
        AService,
        DService
      ]
    });
    expect(metadata.shift()).toEqual({
      "args": {},
      "decoratorType": "constructor",
      "type": "constructor",
      decorator: Injectable,
      "metadataKey": getDecoratorId(Injectable),
      "propertyKey": "constructor",
      "designParam": [
        AService
      ]
    });
    expect(metadata.shift()).toEqual({
      "args": {},
      "designParam": [
        AService,
        DService
      ],
      "decoratorType": "constructor",
      "type": "constructor",
      decorator: Injectable,
      "metadataKey": getDecoratorId(Injectable),
      "propertyKey": "constructor"
    });
    expect(metadata.shift()).toEqual({
      "args": undefined,
      "metadataKey": "design:returntype",
      "propertyKey": "publicMethod"
    });
    expect(metadata.shift()).toEqual({
      "args": [
        AService,
        AService,
        String
      ],
      "metadataKey": "design:paramtypes",
      "propertyKey": "publicMethod"
    });
    expect(metadata.shift()).toEqual({
      "args": Function,
      "metadataKey": "design:type",
      "propertyKey": "publicMethod"
    });
    expect(metadata.shift()).toEqual({
      "args": {
        token: AService
      },
      "decoratorType": "mixed",
      "type": "parameter",
      decorator: Inject,
      "metadataKey": getDecoratorId(Inject, 1),
      "paramIndex": 1,
      designReturn: undefined,
      designType: Function,
      "propertyKey": "publicMethod",
      "designParam": [
        AService,
        AService,
        String
      ]
    });
    expect(metadata.shift()).toEqual({
      "args": {
        token: AService
      },
      "decoratorType": "mixed",
      "type": "parameter",
      decorator: Inject,
      "metadataKey": getDecoratorId(Inject, 1),
      "paramIndex": 1,
      designReturn: undefined,
      designType: Function,
      "propertyKey": "publicMethod",
      "designParam": [
        AService,
        AService,
        String
      ]
    });
    expect(metadata.shift()).toEqual({
      "args": {
        token: undefined
      },
      "designParam": [
        AService,
        AService,
        String
      ],
      "decoratorType": "mixed",
      "type": "parameter",
      designType: Function,
      designReturn: undefined,
      "paramIndex": 0,
      decorator: Inject,
      "metadataKey": getDecoratorId(Inject, 0),
      "propertyKey": "publicMethod"
    });
    expect(metadata.shift()).toEqual({
      "args": {
        token: undefined
      },
      "designParam": [
        AService,
        AService,
        String
      ],
      "decoratorType": "mixed",
      "type": "parameter",
      designType: Function,
      decorator: Inject,
      "paramIndex": 0,
      "designReturn": undefined,
      "metadataKey": getDecoratorId(Inject, 0),
      "propertyKey": "publicMethod"
    });
    expect(metadata.shift()).toEqual({
      "args": {
        "key": "connection",
        "value": "closed"
      },
      "designParam": [
        AService,
        AService,
        String
      ],
      "decoratorType": "method",
      "type": "method",
      designType: Function,
      decorator: SetHeader,
      "designReturn": undefined,
      "metadataKey": getDecoratorId(SetHeader),
      "propertyKey": "publicMethod"
    });
    expect(metadata.shift()).toEqual({
      "args": {
        "key": "content-type",
        "value": "application/json"
      },
      "decoratorType": "method",
      "designParam": [
        AService,
        AService,
        String
      ],
      "type": "method",
      "designReturn": undefined,
      designType: Function,
      decorator: SetHeader,
      "metadataKey": getDecoratorId(SetHeader),
      "propertyKey": "publicMethod"
    });
    expect(metadata.shift()).toEqual({
      "args": AService,
      "metadataKey": "design:type",
      "propertyKey": "cServiceProperty"
    });

    expect(metadata.shift()).toEqual(
      {
        "args": {
          token: undefined
        },
        "decoratorType": "mixed",
        "type": "property",
        designType: AService,
        decorator: Inject,
        "metadataKey": getDecoratorId(Inject),
        "propertyKey": "cServiceProperty"
      }
    );
    expect(metadata.shift()).toEqual({
      "args": AService,
      "metadataKey": "design:type",
      "propertyKey": "bServiceProperty"
    });
  });


  test("Get Constructor Metadata", () => {
    let Injectable = () => createClassDecorator(Injectable);
    let Inject = (token?) => createParameterAndPropertyDecorator(Inject, {token});
    let Produces = (type) => createMethodDecorator(Produces, {type});
    let ReCheck = (type) => createMethodDecorator(Produces, {type});

    @Injectable()
    class AService {
    }

    @Injectable()
    class DService {
    }

    @Injectable()
    class BService {
      @Inject() bServiceProperty: AService;

      constructor(@Inject() bServiceConst: AService) {
      }

      @Produces("application/json")
      publicMethod(
        @Inject() firstProperty: AService,
        @Inject(AService) secondProperty: AService,
        thirdProperty: string
      ) {
      }
    }

    @Injectable()
    class CService extends BService {
      @Inject() cServiceProperty: AService;

      constructor(@Inject() cServiceConst: AService, @Inject() dServiceConst: DService) {
        super(cServiceConst);
      }

      @ReCheck("/nice/")
      publicMethod(
        @Inject() firstProperty: AService,
        @Inject(AService) secondProperty: AService,
        thirdProperty: string
      ) {
      }
    }

    let keys = getMetadataKeysForTarget(CService);
    expect(keys).toStrictEqual([
      {
        propertyKey: undefined,
        target: CService,
        metadataKey: "design:paramtypes"
      },
      {
        propertyKey: undefined,
        target: CService,
        metadataKey: getDecoratorId(Inject, 1)
      },
      {
        propertyKey: undefined,
        target: CService,
        metadataKey: getDecoratorId(Inject, 0)
      },
      {
        propertyKey: undefined,
        target: CService,
        metadataKey: getDecoratorId(Injectable)
      }
    ]);

    let metadata: Array<IMetadata> = getMetadataForTarget(CService);
    expect(metadata.shift()).toEqual({
      "args": [
        AService,
        DService
      ],
      "propertyKey": "constructor",
      "metadataKey": "design:paramtypes"
    });
    expect(metadata.shift()).toEqual({
      args: {
        token: undefined
      },
      "decoratorType": "mixed",
      decorator: Inject,
      "type": "parameter",
      "metadataKey": getDecoratorId(Inject, 1),
      "paramIndex": 1,
      "propertyKey": "constructor",
      "designParam": [
        AService,
        DService
      ]
    });
    expect(metadata.shift()).toEqual({
      "args": {
        token: undefined
      },
      "decoratorType": "mixed",
      decorator: Inject,
      "type": "parameter",
      "metadataKey": getDecoratorId(Inject, 0),
      "paramIndex": 0,
      "propertyKey": "constructor",
      "designParam": [
        AService
      ]
    });
    expect(metadata.shift()).toEqual({
      "args": {
        "token": undefined
      },
      "decorator": Inject,
      "decoratorType": "mixed",
      "metadataKey": getDecoratorId(Inject, 0),
      "paramIndex": 0,
      "type": "parameter",
      "propertyKey": "constructor",
      "designParam": [
        AService,
        DService
      ]
    });

    keys = getMetadataKeysForTarget(CService, "publicMethod");
    expect(keys).toStrictEqual([
      {
        "metadataKey": "design:returntype",
        "propertyKey": "publicMethod",
        "target": CService.prototype
      },
      {
        "metadataKey": "design:paramtypes",
        "propertyKey": "publicMethod",
        "target": CService.prototype
      },
      {
        "metadataKey": "design:type",
        "propertyKey": "publicMethod",
        "target": CService.prototype
      },
      {
        "propertyKey": "publicMethod",
        "target": CService.prototype,
        "metadataKey": getDecoratorId(Inject, 1)
      },
      {
        "propertyKey": "publicMethod",
        "target": CService.prototype,
        "metadataKey": getDecoratorId(Inject, 0)
      },
      {
        "propertyKey": "publicMethod",
        "target": CService.prototype,
        "metadataKey": getDecoratorId(Produces)
      }
    ]);
    metadata = getMetadataForTarget(CService, "publicMethod");
    expect(metadata.shift()).toEqual(
      {
        "args": undefined,
        "metadataKey": "design:returntype",
        "propertyKey": "publicMethod"
      }
    );
    expect(metadata.shift()).toEqual(
      {
        "args": [
          AService,
          AService,
          String
        ],
        "metadataKey": "design:paramtypes",
        "propertyKey": "publicMethod"
      }
    );
    expect(metadata.shift()).toEqual(
      {
        "args": Function,
        "metadataKey": "design:type",
        "propertyKey": "publicMethod"
      }
    );
    expect(metadata.shift()).toEqual(
      {
        args: {
          token: AService
        },
        "decoratorType": "mixed",
        decorator: Inject,
        "type": "parameter",
        "metadataKey": getDecoratorId(Inject, 1),
        "paramIndex": 1,
        "propertyKey": "publicMethod",
        designReturn: undefined,
        designType: Function,
        "designParam": [
          AService,
          AService,
          String
        ]
      }
    );
    expect(metadata.shift()).toEqual(
      {
        "args": {
          token: AService
        },
        "decoratorType": "mixed",
        decorator: Inject,
        "type": "parameter",
        "metadataKey": getDecoratorId(Inject, 1),
        "paramIndex": 1,
        "propertyKey": "publicMethod",
        designReturn: undefined,
        designType: Function,
        "designParam": [
          AService,
          AService,
          String
        ]
      }
    );
    expect(metadata.shift()).toEqual(
      {
        "args": {
          "token": undefined
        },
        "decoratorType": "mixed",
        "type": "parameter",
        decorator: Inject,
        "metadataKey": getDecoratorId(Inject, 0),
        designReturn: undefined,
        "paramIndex": 0,
        designType: Function,
        "propertyKey": "publicMethod",
        "designParam": [
          AService,
          AService,
          String
        ]
      }
    );
  });

  it("Should throw error on defineMetadata", () => {
    expect(() => {
      let token = {};
      defineMetadata(TS_TYPE, "abc", token);
    }).toThrowError(`You can't override typescript metadata: ${TS_TYPE}, ${TS_PARAMS}, ${TS_RETURN}`);
  });

  it("Should have metadata and decorator info", () => {
    const metadataKey = "metadata";
    const metadataValue = {a: 1, b: 2};

    class A {
    }

    defineMetadata(metadataKey, metadataValue, A);
    expect(hasMetadata(metadataKey, A)).toBeTruthy();
    expect(hasMetadata(metadataKey, null)).toBeFalsy();
    expect(hasOwnMetadata(metadataKey, A)).toBeTruthy();
    expect(hasOwnMetadata(metadataKey, null)).toBeFalsy();
    expect(getOwnMetadata(metadataKey, A)).toEqual(metadataValue);
    expect(getOwnMetadataKeys(A)).toEqual([metadataKey]);

    expect(deleteMetadata(metadataKey, A)).toBeTruthy();
    expect(() => {
      deleteMetadata(TS_TYPE, A);
    }).toThrowError(`You can't delete typescript metadata: ${TS_TYPE}, ${TS_PARAMS}, ${TS_RETURN}`);
    expect(deleteMetadata(metadataKey, null)).toBeFalsy();

    const Injectable = () => createClassDecorator(Injectable);

    @Injectable()
    class BInjectable {
    }

    expect(getDecoratorId(Injectable)).toContain("@typeix:constructor:Injectable");
    expect(getDecoratorUUID(Injectable)).toBeDefined();
    expect(getDecoratorName(Injectable)).toBe("Injectable");

    expect(() => {
      getDecoratorId(A);
    }).toThrowError(`Decorator must be created via @typeix decorator functions: ${A.toString()}`);

    expect(() => {
      getDecoratorUUID(A);
    }).toThrowError(`Decorator must be created via @typeix decorator functions: ${A.toString()}`);

    expect(() => {
      getDecoratorType(A);
    }).toThrowError(`Decorator must be created via @typeix decorator functions: ${A.toString()}`);

    expect(() => {
      getDecoratorName(A);
    }).toThrowError(`Decorator must be created via @typeix decorator functions: ${A.toString()}`);

    expect(() => {
      getDecoratorName(A);
    }).toThrowError(`Decorator must be created via @typeix decorator functions: ${A.toString()}`);

    const Param = () => createParameterDecorator(Param);
    const Method = () => createMethodDecorator(Method);
    const Property = () => createPropertyDecorator(Property);

    @Injectable()
    class CInjectable {
      @Property() info: string;

      constructor(@Param() data: string) {
      }

      @Method()
      asset() {

      }
    }

    expect(() => {
      validateDecorator(Param, "constructor");
    }).toThrowError(`Invalid ${getDecoratorName(Param)} decorator get lookup, use: getParameterDecorator`);
    expect(() => {
      validateDecorator(Param, "property");
    }).toThrowError(`Invalid ${getDecoratorName(Param)} decorator get lookup, use: getParameterDecorator`);
    expect(() => {
      validateDecorator(Param, "method");
    }).toThrowError(`Invalid ${getDecoratorName(Param)} decorator get lookup, use: getParameterDecorator`);

    expect(() => {
      validateDecorator(Property, "method");
    }).toThrowError(`Invalid ${getDecoratorName(Property)} decorator get lookup, use: getPropertyDecorator`);


    expect(() => {
      validateDecorator(Method, "constructor");
    }).toThrowError(`Invalid ${getDecoratorName(Method)} decorator get lookup, use: getMethodDecorator`);


    expect(() => {
      validateDecorator(Injectable, "parameter");
    }).toThrowError(`Invalid ${getDecoratorName(Injectable)} decorator get lookup, use: getClassDecorator`);
  });
});
