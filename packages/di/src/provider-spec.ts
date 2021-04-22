import {Injectable} from "./injectable";
import {getProviderName, ProviderList, shiftLeft, shiftRight, verifyProviders} from "./provider";

describe('provider', () => {


  test("merge providers", async () => {
    @Injectable()
    class A {}

    @Injectable()
    class B {}

    @Injectable()
    class C {}

    expect(shiftLeft(
      [{provide: B, useClass: C}],
      verifyProviders([A, B])
    )).toEqual([
      {provide: B, useClass: C},
      {provide: A, useClass: A}
    ]);

    expect(shiftRight(
      [{provide: B, useClass: C}],
      verifyProviders([A, B])
    )).toEqual([
      {provide: A, useClass: A},
      {provide: B, useClass: C}
    ]);
  });

  test("getProviderName", async () => {
    @Injectable()
    class A {}

    @Injectable()
    class B {}

    @Injectable()
    class C {}

    expect(getProviderName(Injectable)).toEqual("Injectable");
    expect(getProviderName("Injectable")).toEqual("Injectable");
    expect(getProviderName({provide: Injectable, useValue: "Injectable"})).toEqual("Injectable");
    expect(getProviderName(function (){})).toEqual("Function");
    expect(getProviderName(undefined)).toBe(null);
  });


  test("ProviderList", async () => {
    let k1 = "method";
    const list = new ProviderList([k1]);
    list.set(k1, 1);
    expect(list.has(k1)).toBeTruthy();
    expect(list.get(k1)).toBe(1);
    expect(list.isMutable(k1)).toBeTruthy();
    list.set(k1, 2);
    expect(list.has(k1)).toBeTruthy();
    expect(list.get(k1)).toBe(2);

    let k2 = "immutable";
    list.set(k2, 3);
    expect(list.has(k2)).toBeTruthy();
    expect(list.get(k2)).toBe(3);

    expect(() => {
      list.set(k2, 4);
    }).toThrow(`${getProviderName(k2)} is already defined in injector, value: 4`);

    expect(verifyProviders(null)).toEqual([]);
  });
});
