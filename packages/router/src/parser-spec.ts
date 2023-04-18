import {RouteParser} from "./parser";

describe("Parser", () => {
  test("parse and be valid on pattern 1", () => {
    let route = "/can<any>one/<name:\\w+>/should<now:\\W+>do-it/<see:(\\w+)>-<nice:([a-zA-Z]+)>-now-<only:\\d+>-not/user/<id:\\d+>";
    let parser = new RouteParser(route);
    expect(parser).toBeInstanceOf(RouteParser);
    expect(parser.isValid("/canbeone/igor/should#+do-it/whata-smile-now-2306-not/user/1412")).toBeTruthy();
    expect(parser.isValid("/canbeone/igor/should#+do-it/whata-smile-now-2306-not/user/1412a")).toBeFalsy();
    expect(parser.isValid("/canbeone/igor/should#+do-it/whata-smile-now-2306-not/user/1412/abc")).toBeFalsy();
    expect(parser.isValid("/igor/should#+do-it/whata-smile-now-2306-not/user/1412")).toBeFalsy();
    expect(parser.isValid("//igor/should#+do-it/whata-smile-now-2306-not/user/1412")).toBeFalsy();
    expect(parser.isValid("/canbeone/igor/should#+do-it/whata-smile-now-2306-not/usera/1412")).toBeFalsy();
    expect(parser.isValid("/canbeone/igor/should#+do-it/whata-smile-now-2306a-not/user/1412")).toBeFalsy();
    expect(parser.isValid("/canbeone/igor/should#+do-it/whata-smile-nowa-2306-not/user/1412")).toBeFalsy();
    expect(parser.isValid("/canbeone/igor/should#+do-it/whata1231-smile-now-2306-not/user/1412")).toBeTruthy();
    expect(parser.isValid("/canbeone/igor/should#+do-it/whata1231!-smile-now-2306-not/user/1412")).toBeFalsy();
    expect(parser.isValid("/canbeone/igor/should#+do-it/whata123-smile123-now-2306-not/user/1412")).toBeFalsy();
    expect(parser.isValid("/canbeone/igor/should--be-able-do-it/whata123-smile-now-2306-not/user/1412")).toBeFalsy();
    expect(parser.isValid("/can1454zfhg=?`='(    ()=(one/igor/should#+do-it/whata-smile-now-2306-not/user/1412")).toBeTruthy();
  });

  test("parse and get params 1", () => {
    let route = "/can<any>one/<name:\\w+>/should<now:\\W+>do-it/<see:(\\w+)>-<nice:([a-zA-Z]+)>-now-<only:\\d+>-not/user/<id:\\d+>";
    let parser = new RouteParser(route);
    let path = "/can1454zfhg=?`='(    ()=(one/igor/should#+do-it/whata-smile-now-2306-not/user/1412";
    expect(parser.getParams(path)).toEqual({
      "any": "1454zfhg=?`='(    ()=(",
      "name": "igor",
      "now": "#+",
      "see": "whata",
      "nice": "smile",
      "only": "2306",
      "id": "1412"
    });
  });

  test("parse and check params", () => {
    let route = "/can<any>one/<name:\\w+>/should<now:[\\w\\W\\/]+>do-it/<see:(\\w+)>-<nice:([a-zA-Z]+)>-now-<only:\\d+>-not/user/<id:\\d+>";
    let parser = new RouteParser(route);
    let p1 = {
      "any": "1454zfhg=?`='(    ()=(",
      "name": "igor",
      "now": "#+",
      "see": "whata",
      "nice": "smile",
      "only": "2306",
      "id": "1412"
    };
    let url1 = "/can1454zfhg=?`='(    ()=(one/igor/should#+do-it/whata-smile-now-2306-not/user/1412";
    expect(parser.getParams(url1)).toEqual(p1);

    let p2 = {
      "any": "1454zfhg=?`='(    ()=(",
      "name": "igor",
      "now": "#+abc/next-toit",
      "see": "whata",
      "nice": "smile",
      "only": "2306",
      "id": "1412"
    };
    let url2 = "/can1454zfhg=?`='(    ()=(one/igor/should#+abc/next-toitdo-it/whata-smile-now-2306-not/user/1412";

    expect(parser.getParams(url2)).toEqual(p2);
  });


  test("Should test patterns on /can<any>one/<name:\\w+>/should<now:\\W+>do-it/<see:(\\w+)>", () => {
    let pattern = new RouteParser("/can<any>one/<name:\\w+>/should<now:\\W+>do-it/<see:(\\w+)>");
    expect(pattern.isValid("")).toBeFalsy();
    expect(pattern.isValid("/canbeone/igor/should#+do-it/whata")).toBeTruthy();
    expect(pattern.isValid("/canbeone/cn/should#+do-it/all")).toBeTruthy();
    expect(pattern.isValid("/canbeone/ws/should#+do-it/good")).toBeTruthy();
    let params = pattern.getParams("/canbeone/ws/should#+do-it/good");
    expect(params).toEqual({
      "any": "be",
      "name": "ws",
      "now": "#+",
      "see": "good"
    });
  });

  test("Should test patterns on /<clientId:(\\w+)>/<url:([\\w-]+)>", () => {
    let pattern = new RouteParser("/<clientId:(\\w+)>/<url:([\\w-]+)>");
    expect(pattern.isValid("/category/1/page/1")).toBeFalsy();
    expect(pattern.isValid("/category/abc1/abc")).toBeFalsy();
    expect(pattern.isValid("/category/abc1")).toBeTruthy();
    let params = pattern.getParams("/category/abc1");
    expect(params).toEqual({
      "clientId": "category",
      "url": "abc1"
    });
  });


  test("Should test patterns on /home", () => {
    let pattern = new RouteParser("/home");
    expect(pattern.isValid("/home")).toBeTruthy();
    let params = pattern.getParams("/home");
    expect(params).toEqual({});
  });


  test("Should test patterns on /home/test", () => {
    let pattern = new RouteParser("/home/test");
    expect(pattern.isValid("/home/test")).toBeTruthy();
    let params = pattern.getParams("/home/test");
    expect(params).toEqual({});
  });


  test("Should test patterns on /home/test/abc", () => {
    let pattern = new RouteParser("/home/test/abc");
    expect(pattern.isValid("/home/test/abc")).toBeTruthy();
    let params = pattern.getParams("/home/test/abc");
    expect(params).toEqual({});
  });


  test("Should test patterns on /category/<category:(\\d+)>/page/<pagenumber:(\\d+)>", () => {
    let pattern = new RouteParser("/category/<category:(\\d+)>/page/<pagenumber:(\\d+)>");
    expect(pattern.isValid("/category/1/page/1")).toBeTruthy();
    expect(pattern.isValid("/category/abc1/abc")).toBeFalsy();
    expect(pattern.isValid("/category/abc1")).toBeFalsy();
    let params = pattern.getParams("/category/1/page/1");
    expect(params).toEqual({
      "category": "1",
      "pagenumber": "1"
    });
  });

  test("Should test patterns on /<category:(.*)>/page/<pageNum:(.*)>", () => {
    let pattern = new RouteParser("/<category:(.*)>/page/<pageNum:(.*)>");
    expect(pattern.isValid("/category/page/1")).toBeTruthy();
    expect(pattern.isValid("/category/page/1/abc")).toBeTruthy();
    expect(pattern.isValid("/category/value/page/1/abc")).toBeTruthy();
    expect(pattern.isValid("/category/value/page1/1/abc")).toBeFalsy();
    expect(pattern.isValid("/category/page1/1/abc")).toBeFalsy();
    let params = pattern.getParams("/category/value/page/1/abc");
    let params1 = pattern.getParams("/category/page/1");

    expect(params).toEqual({
      "category": "category/value",
      "pageNum": "1/abc"
    });


    expect(params1).toEqual({
      "category": "category",
      "pageNum": "1"
    });
  });


  test("Should test patterns on /home/<id:(\\d+)>", () => {
    let pattern = new RouteParser("/home/<id:(\\d+)>");
    expect(pattern.isValid("")).toBeFalsy();
    expect(pattern.isValid("/home/123")).toBeTruthy();
    expect(pattern.isValid("/home/123/")).toBeFalsy();
    expect(pattern.isValid("/home/cn/all")).toBeFalsy();
    expect(pattern.isValid("/home/abc")).toBeFalsy();
    expect(pattern.isValid("/home/abc/")).toBeFalsy();
    expect(pattern.isValid("/home/1")).toBeTruthy();
    let params = pattern.getParams("/home/123");
    expect(params).toEqual({
      "id": "123"
    });
  });

  test("Should test patterns on /home/<name:(\\w+)>", () => {
    let pattern = new RouteParser("/home/<name:(\\w+)>");
    expect(pattern.isValid("")).toBeFalsy();
    expect(pattern.isValid("/home/123")).toBeTruthy();
    expect(pattern.isValid("/home/works")).toBeTruthy();
    expect(pattern.isValid("/home/123/")).toBeFalsy();
    expect(pattern.isValid("/home/cn/all")).toBeFalsy();
    expect(pattern.isValid("/home/abc")).toBeTruthy();
    expect(pattern.isValid("/home/abc/")).toBeFalsy();
    expect(pattern.isValid("/home/1")).toBeTruthy();
    let params = pattern.getParams("/home/123");
    expect(params).toEqual({
      "name": "123"
    });
  });


  test("Should test patterns on /", () => {
    let pattern = new RouteParser("/");
    expect(pattern.isValid("/")).toBeTruthy();
    expect(pattern.isValid("")).toBeFalsy();
    expect(() => new RouteParser("")).toThrow("Url must start with \/");
    expect(() => new RouteParser("abc/")).toThrow("Url must start with \/");
  });

  test("Should get correct parameters on /can<any>one/<name:\\w+>/should<now:\\W+>do-it/<see:(\\w+)>", () => {
    let pattern = new RouteParser("/can<any>one/<name:\\w+>/should<now:\\W+>do-it/<see:(\\w+)>" +
      "-<nice:([a-zA-Z]+)>-now-<only:\\d+>-not/user/<id:\\d+>");
    let url = "/can1454zfhg=?`='(    ()=(one/igor/should#+do-it/whata-smile-now-2306-not/user/1412";
    let params = pattern.getParams(url);
    expect(params).toEqual({
      any: "1454zfhg=?`='(    ()=(",
      id: "1412",
      name: "igor",
      nice: "smile",
      now: "#+",
      only: "2306",
      see: "whata"
    });
  });

  test("Should test pattern for /assets/<file:(.*)>", () => {
    let pattern = new RouteParser("/assets/<file:(.*)>");
    let url = "/assets/css/main.css";
    expect(pattern.isValid(url)).toBeTruthy();
    expect(pattern.isValid("")).toBeFalsy();
    expect(pattern.isValid("/assets/css/main.css"));
    let params = pattern.getParams("/assets/css/main.css");
    expect(params).toEqual({
      "file": "css/main.css"
    });
  });

  test("Should test patterns on /<clientId:(\\w+)>/<url:([\\w-]+\\/[\\w-]+)>/page/<number:(\\d+)>", () => {
    let pattern = new RouteParser("/<clientId:(\\w+)>/<url:([\\w-]+\\/[\\w-]+)>/page/<number:(\\d+)>");
    expect(pattern.isValid("/ab123sbr/this-is-test/abc-123/page/123123")).toBeTruthy();
    let params = pattern.getParams("/ab123sbr/this-is-test/abc-123/page/123123");
    expect(params).toEqual({
      "clientId": "ab123sbr",
      "url": "this-is-test/abc-123",
      "number": "123123"
    });
  });


  test("Should get correct parameters on /assets/<file:(.*)>", () => {
    let pattern = new RouteParser("/assets/<file:(.*)>");
    let url = "/assets/css/main.css";
    expect(pattern.isValid(url)).toBeTruthy();
    let params = pattern.getParams(url);
    expect(params).toEqual({file: "css/main.css"});
  });


  test.skip("benchmark", () => {
    let pattern = new RouteParser("/<clientId:(\w+)>/<url:([\w-]+\/[\w-]+)>/page/<number:(\d+)>");
    let t1 = (new Date).getTime();
    for (let i = 0; i < 100000; i++) {
      pattern.isValid("/ab123sbr/this-is-test/abc-123/page/123123");
      pattern.getParams("/ab123sbr/this-is-test/abc-123/page/123123");
    }
    let t2 = (new Date).getTime();
    expect(t2 - t1).toBeLessThan(50); // 50ms
  });

});
