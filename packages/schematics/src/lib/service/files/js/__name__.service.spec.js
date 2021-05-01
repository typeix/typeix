import {Injector} from "@typeix/resty";
import {<%= classify(name) %>Service} from './<%= name %>.service';

describe('<%= classify(name) %>Service', () => {
  let service;

  beforeEach(async () => {
    const injector = Injector.createAndResolve(<%= classify(name) %>Service, []);
    service = injector.get(<%= classify(name) %>Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
