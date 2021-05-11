import {Injectable} from "./injectable";
import {getAllMetadataForTarget} from "@typeix/metadata";

describe("Injectable", () => {
  test("constructor injectable", () => {

    @Injectable()
    class AService {
    }

    @Injectable()
    class BService {
      constructor(private serviceA: AService) {
      }
    }

    @Injectable()
    class CService {
      constructor(private serviceB: BService) {
      }
    }

    let aParams = getAllMetadataForTarget(AService);
    let bParams = getAllMetadataForTarget(BService).pop().designParam;
    let cParams = getAllMetadataForTarget(CService).pop().designParam;
    expect(aParams.length).toBe(1);
    expect(aParams.pop().decorator).toBe(Injectable);
    expect(bParams).toStrictEqual([ AService ]);
    expect(cParams).toStrictEqual([ BService ]);

  });
});
