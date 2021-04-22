<p align="center">
  <a href="https://typeix.com" target="blank">
    <img src="https://avatars.githubusercontent.com/u/38910665?s=200&v=4" width="120" alt="Typeix Logo" />
  </a>
</p>
<p align="center">
A progressive <a href="https://nodejs.org" target="_blank">Node.js</a>
tools for building efficient and scalable applications.
</p>


# @typeix/metadata
Metadata API for typescript decorators

[![Build Status][travis-url]][travis-img]
[![Coverage Status][coverage-img]][coverage-url]
![npm][npm-version-img]

# Installing:
```bash
npm i @typeix/metadata --save
```

## Creating Decorators with easier API
```typescript
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
        thirdProperty: string) {
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
        thirdProperty: string) {
    }
}

let metadata: Array<IMetadata> = getAllMetadataForTarget(CService);
```

## Dev packages
```
npm i typescript ts-jest jest eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin-tslint @typescript-eslint/eslint-plugin @types/node @types/jest --save-dev
```


[travis-url]: https://travis-ci.com/typeix/typeix.svg?branch=master
[travis-img]: https://travis-ci.com/typeix/typeix
[npm-version-img]: https://img.shields.io/npm/v/@typeix/metadata
[coverage-img]: https://coveralls.io/repos/github/typeix/typeix/badge.svg?branch=master
[coverage-url]: https://coveralls.io/github/typeix/typeix?branch=master
