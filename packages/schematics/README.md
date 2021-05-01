<p align="center">
  <a href="https://typeix.com" target="blank">
    <img src="https://avatars.githubusercontent.com/u/38910665?s=200&v=4" width="120" alt="Typeix Logo" />
  </a>
</p>
<p align="center">
A progressive <a href="https://nodejs.org" target="_blank">Node.js</a>
tools for building efficient and scalable applications.
</p>

# @typeix/schematics
[![Build Status][travis-img]][travis-url]
[![Coverage Status][coverage-img]][coverage-url]
![npm][npm-version-img]

## Description
Typeix is a set of tools for building efficient, scalable <a href="http://nodejs.org" target="_blank">Node.js</a> server-side applications. 
It uses modern <a href="http://www.typescriptlang.org" target="_blank">TypeScript</a> and combines elements of OOP, 
Functional Programming and Reactive Programming.

<p>
Typeix uses <a href="https://img.shields.io/npm/v/@typeix/router" target="_blank">@typeix/router</a> as a lightweight server, but also, provides compatibility with a wide range of other libraries, 
allowing for easy use of the myriad third-party plugins which are available.
</p>


## Philosophy
<p>
In 2016 inspired by Angular first version of typeix was born, which provides an application architecture 
to allow effortless creation of highly testable, scalable, loosely coupled and easily maintainable applications. 

Typeix has unique features like request interceptors, method interceptors, extensive dependency injection with custom decorators, global and local error routing handlers,
aws lambda adapter, (gcp & azure will be added).

</p>

## Core Packages
* [@typeix/metadata](packages/metadata)
* [@typeix/di](packages/di)
* [@typeix/modules](packages/modules)
* [@typeix/router](packages/router)
* [@typeix/resty](packages/resty)
* [@typeix/resty-aws-lambda](packages/resty-aws-lambda)  
* [@typeix/utils](packages/utils)
* [@typeix/logger](packages/logger)

## Questions
For questions and support please use the official Discord channel. 
The issue list of this repo is exclusively for bug reports and feature requests.

## Issues
Please make sure to read the [Issue Reporting Checklist](https://github.com/typeix/typeix/blob/master/CONTRIBUTING.md#-submitting-an-issue) before opening an issue. 
Issues not conforming to the guidelines may be closed immediately.

## Consulting
With official support, you can get expert help straight from Typeix core team. We provide dedicated technical support, migration strategies,
advice on best practices (and design decisions), PR reviews, and team augmentation.

## Support
Typeix is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. 
If you'd like to join them, please [read more here](https://docs.typeix.com/support).

## Stay in touch
* Author - [Igor Ivanovic](https://twitter.com/igorzg1987)
* Website - [https://typeix.com](https://typeix.com)
* Twitter - [@typeixframework](https://twitter.com/typeixframework)

## License

Typeix is [MIT licensed](LICENSE).

[travis-url]: https://travis-ci.com/typeix/schematics
[travis-img]: https://travis-ci.com/typeix/schematics.svg?branch=main
[npm-version-img]: https://img.shields.io/npm/v/@typeix/schematics
[coverage-img]: https://coveralls.io/repos/github/typeix/schematics/badge.svg?branch=main
[coverage-url]: https://coveralls.io/github/typeix/schematics?branch=main