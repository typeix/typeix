import {
  isDefined,
  isString,
  isUndefined,
  uuid,
  isBoolean,
  isNumber,
  isArray,
  isNull,
  isFunction,
  isDate,
  isSymbol,
  isRegExp,
  isObject, isTruthy, isFalsy, isClass, isEqual, inArray
} from "./utils";

describe("utils test", () => {

  test("uuid", () => {
    expect(uuid()).toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
  });

  test("isSymbol", () => {
    expect(isSymbol(true)).toBeFalsy();
    expect(isSymbol(false)).toBeFalsy();
    expect(isSymbol(null)).toBeFalsy();
    expect(isSymbol("")).toBeFalsy();
    expect(isSymbol(undefined)).toBeFalsy();
    expect(isSymbol((() => {
    }))).toBeFalsy();
    expect(isSymbol({})).toBeFalsy();
    expect(isSymbol([])).toBeFalsy();
    expect(isSymbol(1)).toBeFalsy();
    expect(isSymbol(1.1)).toBeFalsy();
    expect(isSymbol(Symbol("whatever"))).toBeTruthy();
  });

  test("isBoolean", () => {
    expect(isBoolean(true)).toBeTruthy();
    expect(isBoolean(false)).toBeTruthy();
    expect(isBoolean(null)).toBeFalsy();
    expect(isBoolean("")).toBeFalsy();
    expect(isBoolean(undefined)).toBeFalsy();
    expect(isBoolean((() => { /* none */
    }))).toBeFalsy();
    expect(isBoolean({})).toBeFalsy();
    expect(isBoolean([])).toBeFalsy();
    expect(isBoolean(1)).toBeFalsy();
    expect(isBoolean(1.1)).toBeFalsy();
  });

  test("isUndefined", () => {
    expect(isUndefined(true)).toBeFalsy();
    expect(isUndefined(false)).toBeFalsy();
    expect(isUndefined(null)).toBeFalsy();
    expect(isUndefined("")).toBeFalsy();
    expect(isUndefined(undefined)).toBeTruthy();
    expect(isUndefined((() => { /* none */
    }))).toBeFalsy();
    expect(isUndefined({})).toBeFalsy();
    expect(isUndefined([])).toBeFalsy();
    expect(isUndefined(1)).toBeFalsy();
    expect(isUndefined(1.1)).toBeFalsy();
  });

  test("isDefined", () => {
    expect(isDefined(true)).toBeTruthy();
    expect(isDefined(false)).toBeTruthy();
    expect(isDefined(null)).toBeFalsy();
    expect(isDefined("")).toBeTruthy();
    expect(isDefined(undefined)).toBeFalsy();
    expect(isDefined((() => { /* none */
    }))).toBeTruthy();
    expect(isDefined({})).toBeTruthy();
    expect(isDefined([])).toBeTruthy();
    expect(isDefined(1)).toBeTruthy();
    expect(isDefined(1.1)).toBeTruthy();
  });

  test("isString", () => {
    expect(isString(true)).toBeFalsy();
    expect(isString(false)).toBeFalsy();
    expect(isString(null)).toBeFalsy();
    expect(isString("")).toBeTruthy();
    expect(isString(undefined)).toBeFalsy();
    expect(isString((() => { /* none */
    }))).toBeFalsy();
    expect(isString({})).toBeFalsy();
    expect(isString([])).toBeFalsy();
    expect(isString(1)).toBeFalsy();
    expect(isString(1.1)).toBeFalsy();
  });


  test("isNumber", () => {
    expect(isNumber(true)).toBeFalsy();
    expect(isNumber(false)).toBeFalsy();
    expect(isNumber(null)).toBeFalsy();
    expect(isNumber("")).toBeFalsy();
    expect(isNumber(undefined)).toBeFalsy();
    expect(isNumber((() => { /* none */
    }))).toBeFalsy();
    expect(isNumber({})).toBeFalsy();
    expect(isNumber([])).toBeFalsy();
    expect(isNumber(1)).toBeTruthy();
    expect(isNumber(1.1)).toBeTruthy();
  });

  test("isArray", () => {
    expect(isArray(true)).toBeFalsy();
    expect(isArray(false)).toBeFalsy();
    expect(isArray(null)).toBeFalsy();
    expect(isArray("")).toBeFalsy();
    expect(isArray(undefined)).toBeFalsy();
    expect(isArray((() => { /* none */
    }))).toBeFalsy();
    expect(isArray({})).toBeFalsy();
    expect(isArray([])).toBeTruthy();
    expect(isArray(1)).toBeFalsy();
    expect(isArray(1.1)).toBeFalsy();
  });

  test("isNull", () => {
    expect(isNull(true)).toBeFalsy();
    expect(isNull(false)).toBeFalsy();
    expect(isNull(null)).toBeTruthy();
    expect(isNull("")).toBeFalsy();
    expect(isNull(undefined)).toBeFalsy();
    expect(isNull((() => { /* none */
    }))).toBeFalsy();
    expect(isNull({})).toBeFalsy();
    expect(isNull([])).toBeFalsy();
    expect(isNull(1)).toBeFalsy();
    expect(isNull(1.1)).toBeFalsy();
  });

  test("isFunction", () => {
    expect(isFunction(true)).toBeFalsy();
    expect(isFunction(false)).toBeFalsy();
    expect(isFunction(null)).toBeFalsy();
    expect(isFunction("")).toBeFalsy();
    expect(isFunction(undefined)).toBeFalsy();
    expect(isFunction((() => { /* none */
    }))).toBeTruthy();
    expect(isFunction({})).toBeFalsy();
    expect(isFunction([])).toBeFalsy();
    expect(isFunction(1)).toBeFalsy();
    expect(isFunction(1.1)).toBeFalsy();

    class A {
    }

    expect(isFunction(A)).toBeTruthy();
  });


  test("isDate", () => {
    expect(isDate(true)).toBeFalsy();
    expect(isDate(false)).toBeFalsy();
    expect(isDate(null)).toBeFalsy();
    expect(isDate("")).toBeFalsy();
    expect(isDate(undefined)).toBeFalsy();
    expect(isDate((() => { /* none */
    }))).toBeFalsy();
    expect(isDate({})).toBeFalsy();
    expect(isDate([])).toBeFalsy();
    expect(isDate(1)).toBeFalsy();
    expect(isDate(1.1)).toBeFalsy();

    class A {
    }

    expect(isDate(A)).toBeFalsy();
    expect(isDate(new Date)).toBeTruthy();
  });

  test("isRegExp", () => {
    expect(isRegExp(true)).toBeFalsy();
    expect(isRegExp(false)).toBeFalsy();
    expect(isRegExp(null)).toBeFalsy();
    expect(isRegExp("")).toBeFalsy();
    expect(isRegExp(undefined)).toBeFalsy();
    expect(isRegExp((() => { /* none */
    }))).toBeFalsy();
    expect(isRegExp({})).toBeFalsy();
    expect(isRegExp([])).toBeFalsy();
    expect(isRegExp(1)).toBeFalsy();
    expect(isRegExp(1.1)).toBeFalsy();

    class A {
    }

    expect(isRegExp(A)).toBeFalsy();
    expect(isRegExp(new Date)).toBeFalsy();
    expect(isRegExp(/abc/)).toBeTruthy();
    expect(isRegExp(new RegExp("abc"))).toBeTruthy();
  });

  test("isObject", () => {
    expect(isObject(true)).toBeFalsy();
    expect(isObject(false)).toBeFalsy();
    expect(isObject(null)).toBeFalsy();
    expect(isObject("")).toBeFalsy();
    expect(isObject(undefined)).toBeFalsy();
    expect(isObject((() => { /* none */
    }))).toBeFalsy();
    expect(isObject({})).toBeTruthy();
    expect(isObject([])).toBeTruthy();
    expect(isObject(1)).toBeFalsy();
    expect(isObject(1.1)).toBeFalsy();

    class A {
    }

    expect(isObject(A)).toBeFalsy();
    expect(isObject(new Date)).toBeTruthy();
    expect(isObject(/abc/)).toBeTruthy();
    expect(isObject(new RegExp("abc"))).toBeTruthy();
  });

  test("isTruthy", () => {
    expect(isTruthy(true)).toBeTruthy();
    expect(isTruthy(false)).toBeFalsy();
    expect(isTruthy(null)).toBeFalsy();
    expect(isTruthy("")).toBeFalsy();
    expect(isTruthy(undefined)).toBeFalsy();
    expect(isTruthy((() => { /* none */
    }))).toBeTruthy();
    expect(isTruthy({})).toBeTruthy();
    expect(isTruthy([])).toBeTruthy();
    expect(isTruthy(1)).toBeTruthy();
    expect(isTruthy(1.1)).toBeTruthy();

    class A {
    }

    expect(isTruthy(A)).toBeTruthy();
    expect(isTruthy(new Date)).toBeTruthy();
    expect(isTruthy(/abc/)).toBeTruthy();
    expect(isTruthy(new RegExp("abc"))).toBeTruthy();
  });


  test("isFalsy", () => {
    expect(isFalsy(true)).toBeFalsy();
    expect(isFalsy(false)).toBeTruthy();
    expect(isFalsy(null)).toBeTruthy();
    expect(isFalsy("")).toBeTruthy();
    expect(isFalsy(NaN)).toBeTruthy();
    expect(isFalsy("")).toBeTruthy();
    expect(isFalsy(undefined)).toBeTruthy();
    expect(isFalsy((() => { /* none */
    }))).toBeFalsy();
    expect(isFalsy({})).toBeFalsy();
    expect(isFalsy([])).toBeFalsy();
    expect(isFalsy(1)).toBeFalsy();
    expect(isFalsy(1.1)).toBeFalsy();

    class A {
    }

    expect(isFalsy(A)).toBeFalsy();
    expect(isFalsy(new Date)).toBeFalsy();
    expect(isFalsy(/abc/)).toBeFalsy();
    expect(isFalsy(new RegExp("abc"))).toBeFalsy();
  });


  test("isClass", () => {
    expect(isClass(true)).toBeFalsy();
    expect(isClass(false)).toBeFalsy();
    expect(isClass(null)).toBeFalsy();
    expect(isClass("")).toBeFalsy();
    expect(isClass(NaN)).toBeFalsy();
    expect(isClass("")).toBeFalsy();
    expect(isClass(undefined)).toBeFalsy();
    expect(isClass((() => { /* none */
    }))).toBeFalsy();
    expect(isClass({})).toBeFalsy();
    expect(isClass([])).toBeFalsy();
    expect(isClass(1)).toBeFalsy();
    expect(isClass(1.1)).toBeFalsy();

    class A {
    }

    expect(isClass(A)).toBeTruthy();
    expect(isClass(new Date)).toBeFalsy();
    expect(isClass(/abc/)).toBeFalsy();
    expect(isClass(new RegExp("abc"))).toBeFalsy();
  });

  test("isEqual simple", () => {
    expect(isEqual(1, 1)).toBeTruthy();
    expect(isEqual("a", "a")).toBeTruthy();
    expect(isEqual("a", "b")).toBeFalsy();
    let time = Date.now();
    let date = new Date();
    date.setTime(time);
    let date1 = new Date();
    date1.setTime(time);
    expect(isEqual(date, date1)).toBeTruthy();
    let a = [];
    expect(isEqual(Symbol("a"), Symbol("a"))).toBeFalsy();
    expect(isEqual(Symbol("a"), Symbol("b"))).toBeFalsy();
    expect(isEqual(a, a)).toBeTruthy();
    expect(isEqual([{}], [{}])).toBeTruthy();
    expect(isEqual([{a: 1}], [{a: 1}])).toBeTruthy();
    expect(isEqual([{a: 1, b: [{c: 1}]}], [{a: 1, b: [{c: 1}]}])).toBeTruthy();
    expect(isEqual([], {})).toBeFalsy();
    expect(isEqual({}, {})).toBeTruthy();
    expect(isEqual([], [])).toBeTruthy();
    expect(isEqual([{a: 1, b: [{c: 1}]}], [{a: 1, b: [{c: 2}]}])).toBeFalsy();

    let d = [a, 1, {}, 3, 4];
    d.push(d);
    d.push(1);
    let e = [a, 1, {}, 3, 4];
    e.push(e);
    e.push(1);
    expect(isEqual(d, e)).toBeTruthy();

    let d1 = [a, 1, {}, 3, 4];
    d1.push(d1);
    let e1 = [a, 1, {}, 3, 4];
    expect(isEqual(d1, e1)).toBeFalsy();

    let a1 = {a: 1, b: 2, c: {}, d};
    let a2 = {a: 1, b: 2, c: a1, d};
    a1.c = a1;
    expect(isEqual(a1, a2)).toBeTruthy();

    let b1 = {a: 1, b: 2, c: {}, d};
    let b2 = {a: 1, b: 2, c: {}, d};
    b1.c = a1;
    b2.c = b2;
    expect(isEqual(b1, b2)).toBeTruthy();
    expect(isEqual([b1, a1], [b1, a1])).toBeTruthy();
    expect(isEqual([b1, a1], [{...a1, b: 3}, b1])).toBeFalsy();
    expect(isEqual([1], [])).toBeFalsy();
    expect(isEqual(1, 2)).toBeFalsy();
    expect(isEqual(1, NaN)).toBeFalsy();
    expect(isEqual(1, 1)).toBeTruthy();
    expect(isEqual(/a/, /a/)).toBeTruthy();
    expect(isEqual(/a/, /b/)).toBeFalsy();
  });

  test('inArray', () => {
    let data = [1, 2, 3, String];
    expect(inArray(data, 1)).toBeTruthy();
    expect(inArray(data, 2)).toBeTruthy();
    expect(inArray(data, 3)).toBeTruthy();
    expect(inArray(data, String)).toBeTruthy();
    expect(inArray(data, 4)).toBeFalsy();
  });
});
