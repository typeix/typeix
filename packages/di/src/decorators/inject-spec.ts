import {Injectable} from "./injectable";
import {Inject} from "./inject";
import {getAllMetadataForTarget, getDecoratorId, IMetadata} from "@typeix/metadata";

describe("Inject", () => {

  test("inheritance getAllMetadata", () => {

    @Injectable()
    class DService {
    }

    @Injectable()
    class CService {
    }

    @Injectable()
    class RootService {
      @Inject(DService) info: DService;
    }

    @Injectable()
    class BService extends RootService {
    }

    @Injectable()
    class AService extends RootService {

      @Inject(CService) info: CService;

      // eslint-disable-next-line no-shadow,@typescript-eslint/no-unused-vars
      constructor(bService: BService, cService: CService) {
        super();
      }
    }


    let aService: IMetadata[] = getAllMetadataForTarget(AService);

    expect(aService).toStrictEqual([
      {
        "args": [
          BService,
          CService
        ],
        "metadataKey": "design:paramtypes",
        "propertyKey": "constructor"
      },
      {
        "args": {},
        "decorator": Injectable,
        "decoratorType": "constructor",
        "designParam": [
          BService,
          CService
        ],
        "metadataKey": getDecoratorId(Injectable),
        "propertyKey": "constructor",
        "type": "constructor"
      },
      {
        "args": CService,
        "metadataKey": "design:type",
        "propertyKey": "info"
      },
      {
        "args": {
          "isMutable": false,
          "token": CService
        },
        "decorator": Inject,
        "decoratorType": "mixed",
        "designType": CService,
        "metadataKey": getDecoratorId(Inject),
        "propertyKey": "info",
        "type": "property"
      }
    ]);

    let bService: IMetadata[] = getAllMetadataForTarget(BService);

    expect(bService).toStrictEqual([
      {
        "args": {},
        "decorator": Injectable,
        "decoratorType": "constructor",
        "metadataKey": getDecoratorId(Injectable),
        "propertyKey": "constructor",
        "type": "constructor"
      },
      {
        "args": DService,
        "metadataKey": "design:type",
        "propertyKey": "info"
      },
      {
        "args": {
          "isMutable": false,
          "token": DService
        },
        "decorator": Inject,
        "decoratorType": "mixed",
        "designType": DService,
        "metadataKey": getDecoratorId(Inject),
        "propertyKey": "info",
        "type": "property"
      }
    ]);

  });

  test("inheritance 1 getAllMetadata", () => {

    @Injectable()
    class AService {
    }

    @Injectable()
    class CService {
    }

    @Injectable()
    class RootService {
      @Inject(CService) cService: CService;
    }

    @Injectable()
    class BService extends RootService {
      @Inject(AService) aService: AService;
    }

    let rService: IMetadata[] = getAllMetadataForTarget(RootService);

    expect(rService).toStrictEqual([
      {
        "args": {},
        "decorator": Injectable,
        "decoratorType": "constructor",
        "metadataKey": getDecoratorId(Injectable),
        "propertyKey": "constructor",
        "type": "constructor"
      },
      {
        "args": CService,
        "metadataKey": "design:type",
        "propertyKey": "cService"
      },
      {
        "args": {
          "isMutable": false,
          "token": CService
        },
        "decorator": Inject,
        "decoratorType": "mixed",
        "designType": CService,
        "metadataKey": getDecoratorId(Inject),
        "propertyKey": "cService",
        "type": "property"
      }
    ]);

    let bService: IMetadata[] = getAllMetadataForTarget(BService);

    expect(bService).toStrictEqual([
      {
        "args": {},
        "decorator": Injectable,
        "decoratorType": "constructor",
        "metadataKey": getDecoratorId(Injectable),
        "propertyKey": "constructor",
        "type": "constructor"
      },
      {
        "args": AService,
        "metadataKey": "design:type",
        "propertyKey": "aService"
      },
      {
        "args": {
          "isMutable": false,
          "token": AService
        },
        "decorator": Inject,
        "decoratorType": "mixed",
        "designType": AService,
        "metadataKey": getDecoratorId(Inject),
        "propertyKey": "aService",
        "type": "property"
      },
      {
        "args": CService,
        "metadataKey": "design:type",
        "propertyKey": "cService"
      },
      {
        "args": {
          "isMutable": false,
          "token": CService
        },
        "decorator": Inject,
        "decoratorType": "mixed",
        "designType": CService,
        "metadataKey": getDecoratorId(Inject),
        "propertyKey": "cService",
        "type": "property"
      }
    ]);

  });

  test("getAllMetadata", () => {

    @Injectable()
    class CService {
    }

    @Injectable()
    class RootService {
      @Inject(CService) info: CService;
    }

    @Injectable()
    class BService extends RootService {

      @Inject(CService) info: CService;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      constructor(cService: CService) {
        super();
      }

    }

    @Injectable()
    class AService extends RootService {

      @Inject(BService) info: BService;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-shadow
      constructor(bService: BService, cService: CService) {
        super();
      }
    }

    let aService: IMetadata[] = getAllMetadataForTarget(AService);

    expect(aService).toStrictEqual([
      {
        "args": [
          BService,
          CService
        ],
        "metadataKey": "design:paramtypes",
        "propertyKey": "constructor"
      },
      {
        "args": {},
        "decorator": Injectable,
        "decoratorType": "constructor",
        "designParam": [
          BService,
          CService
        ],
        "metadataKey": getDecoratorId(Injectable),
        "propertyKey": "constructor",
        "type": "constructor"
      },
      {
        "args": BService,
        "metadataKey": "design:type",
        "propertyKey": "info"
      },
      {
        "args": {
          "isMutable": false,
          "token": BService
        },
        "decorator": Inject,
        "decoratorType": "mixed",
        "designType": BService,
        "metadataKey": getDecoratorId(Inject),
        "propertyKey": "info",
        "type": "property"
      }
    ]);

    let bService: IMetadata[] = getAllMetadataForTarget(BService);

    expect(bService).toStrictEqual([
      {
        "args": [
          CService
        ],
        "metadataKey": "design:paramtypes",
        "propertyKey": "constructor"
      },
      {
        "args": {},
        "decorator": Injectable,
        "decoratorType": "constructor",
        "designParam": [
          CService
        ],
        "metadataKey": getDecoratorId(Injectable),
        "propertyKey": "constructor",
        "type": "constructor"
      },
      {
        "args": CService,
        "metadataKey": "design:type",
        "propertyKey": "info"
      },
      {
        "args": {
          "isMutable": false,
          "token": CService
        },
        "decorator": Inject,
        "decoratorType": "mixed",
        "designType": CService,
        "metadataKey": getDecoratorId(Inject),
        "propertyKey": "info",
        "type": "property"
      }
    ]);

  });


  test("getAllMetadata paramIndex on @Inject", () => {

    @Injectable()
    class CService {
    }

    @Injectable()
    class BService {
    }

    @Injectable()
    class AService {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
      constructor(@Inject(BService) bService: BService, cService: CService) {
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-shadow
      name(aService: AService, @Inject("value") value: string, @Inject("value") value1: string): string {
        return "";
      }
    }

    let aService: IMetadata[] = getAllMetadataForTarget(AService);

    expect(aService).toStrictEqual([
      {
        "args": [
          BService,
          CService
        ],
        "metadataKey": "design:paramtypes",
        "propertyKey": "constructor"
      },
      {
        "args": {
          "isMutable": false,
          "token": BService
        },
        "decorator": Inject,
        "decoratorType": "mixed",
        "designParam": [
          BService,
          CService
        ],
        "metadataKey": getDecoratorId(Inject, 0),
        "paramIndex": 0,
        "propertyKey": "constructor",
        "type": "parameter"
      },
      {
        "args": {},
        "decorator": Injectable,
        "decoratorType": "constructor",
        "designParam": [
          BService,
          CService
        ],
        "metadataKey": getDecoratorId(Injectable),
        "propertyKey": "constructor",
        "type": "constructor"
      },
      {
        "args": String,
        "metadataKey": "design:returntype",
        "propertyKey": "name"
      },
      {
        "args": [
          AService,
          String,
          String
        ],
        "metadataKey": "design:paramtypes",
        "propertyKey": "name"
      },
      {
        "args": Function,
        "metadataKey": "design:type",
        "propertyKey": "name"
      },
      {
        "args": {
          "isMutable": false,
          "token": "value"
        },
        "decorator": Inject,
        "decoratorType": "mixed",
        "designParam": [
          AService,
          String,
          String
        ],
        "designReturn": String,
        "designType": Function,
        "metadataKey": getDecoratorId(Inject, 2),
        "paramIndex": 2,
        "propertyKey": "name",
        "type": "parameter"
      },
      {
        "args": {
          "isMutable": false,
          "token": "value"
        },
        "decorator": Inject,
        "decoratorType": "mixed",
        "designParam": [
          AService,
          String,
          String
        ],
        "designReturn": String,
        "designType": Function,
        "metadataKey": getDecoratorId(Inject, 1),
        "paramIndex": 1,
        "propertyKey": "name",
        "type": "parameter"
      }
    ]);

  });


  test("getAllMetadata check", () => {

    @Injectable()
    class AService {
    }

    @Injectable()
    class CService {
    }

    @Injectable()
    class RootService {
      @Inject(CService) cService: CService;
    }

    @Injectable()
    class BService extends RootService {
      @Inject(AService) aService: AService;
    }

    let bService: IMetadata[] = getAllMetadataForTarget(BService);

    expect(bService).toStrictEqual([
      {
        "args": {},
        "decorator": Injectable,
        "decoratorType": "constructor",
        "metadataKey": getDecoratorId(Injectable),
        "propertyKey": "constructor",
        "type": "constructor"
      },
      {
        "args": AService,
        "metadataKey": "design:type",
        "propertyKey": "aService"
      },
      {
        "args": {
          "isMutable": false,
          "token": AService
        },
        "decorator": Inject,
        "decoratorType": "mixed",
        "designType": AService,
        "metadataKey": getDecoratorId(Inject),
        "propertyKey": "aService",
        "type": "property"
      },
      {
        "args": CService,
        "metadataKey": "design:type",
        "propertyKey": "cService"
      },
      {
        "args": {
          "isMutable": false,
          "token": CService
        },
        "decorator": Inject,
        "decoratorType": "mixed",
        "designType": CService,
        "metadataKey": getDecoratorId(Inject),
        "propertyKey": "cService",
        "type": "property"
      }
    ]);

  });

});
