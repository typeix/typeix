import {Injector} from "@typeix/resty";
import {<%= classify(className) %> } from './<%= name %>';

describe('<%= classify(className) %>', () => {
  let provider;

  beforeEach( () => {
    const injector = Injector.createAndResolve(<%= classify(name) %>, []);
    provider = injector.get(<%= classify(name) %>);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
