
module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "node": true
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json",
    "sourceType": "module"
  },
  "plugins": [
    "@typescript-eslint"
  ],
  "rules": {
    "@typescript-eslint/dot-notation": "error",
    "@typescript-eslint/explicit-member-accessibility": [
      "off",
      {
        "accessibility": "explicit"
      }
    ],
    "@typescript-eslint/indent": [
      "error",
      2
    ],
    "@typescript-eslint/member-delimiter-style": [
      "error",
      {
        "multiline": {
          "delimiter": "semi",
          "requireLast": true
        },
        "singleline": {
          "delimiter": "semi",
          "requireLast": false
        }
      }
    ],
    "@typescript-eslint/member-ordering": "error",
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": ["function", "parameter"],
        "format": ["camelCase", "PascalCase"],
        "leadingUnderscore": "allow",
        "trailingUnderscore": "allow"
      },
      {
        "selector": ["class", "interface", "enum", "typeAlias", "typeParameter"],
        "format": ["PascalCase"],
        "leadingUnderscore": "forbid",
        "trailingUnderscore": "forbid"
      }
    ],
    "@typescript-eslint/no-empty-function": "error",
    "@typescript-eslint/no-inferrable-types": "error",
    "@typescript-eslint/no-unused-expressions": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-use-before-define": "warn",
    "@typescript-eslint/quotes": [
      "error",
      "double",
      {
        "avoidEscape": true
      }
    ],
    "@typescript-eslint/semi": [
      "error",
      "always"
    ],
    "@typescript-eslint/type-annotation-spacing": "error",
    "array-bracket-spacing": "off",
    "brace-style": [
      "error",
      "1tbs"
    ],
    "comma-dangle": "error",
    "curly": "error",
    "eol-last": "error",
    "eqeqeq": [
      "off",
      "smart"
    ],
    "guard-for-in": "error",
    "id-blacklist": "off",
    "id-match": "off",
    "max-len": [
      "error",
      {
        "code": 140
      }
    ],
    "no-bitwise": "off",
    "no-caller": "error",
    "no-console": [
      "error",
      {
        "allow": [
          "log",
          "warn",
          "dir",
          "timeLog",
          "assert",
          "clear",
          "count",
          "countReset",
          "group",
          "groupEnd",
          "table",
          "dirxml",
          "error",
          "groupCollapsed",
          "Console",
          "profile",
          "profileEnd",
          "timeStamp",
          "context"
        ]
      }
    ],
    "no-debugger": "error",
    "no-empty": "error",
    "no-eval": "error",
    "no-fallthrough": "error",
    "no-new-wrappers": "error",
    "no-redeclare": "off",
    "no-shadow": [
      "error",
      {
        "hoist": "all"
      }
    ],
    "no-trailing-spaces": "off",
    "no-underscore-dangle": "off",
    "no-unused-labels": "error",
    "no-var": "error",
    "radix": "error",
    "spaced-comment": [
      "error",
      "always",
      {
        "markers": [
          "/"
        ]
      }
    ]
  }
};
