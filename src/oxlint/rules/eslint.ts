import type { OxlintRuleGroup } from "../types.ts";
import {
  allTypeScriptFilesDefaultCase,
  allTypeScriptFilesHandledByTypeScript,
  allTypeScriptFilesNoImpliedEval,
  allTypeScriptFilesNoUnreachable,
  testFiles,
} from "../utils.ts";

const eslint: OxlintRuleGroup = {
  name: "ESLint Ported Rules",
  plugin: "eslint",
  description:
    "These rules come ported from ESLint; some also incorporate typescript-eslint functionality to work with TypeScript files.",
  changes: [
    "The `no-inline-comments` rule has an ignore pattern set to address some common bundler/coverage directives that getmistakenly flagged by the rule",
    "The `no-throw-literal` rule is deprecated in oxlint, so we use the `typescript/only-throw-error` exclusively",
  ],
  correctness: {
    "no-class-assign": {
      settings: "error",
      override: {
        files: allTypeScriptFilesHandledByTypeScript,
        settings: "off",
      },
    },
    "no-const-assign": {
      settings: "error",
      override: {
        files: allTypeScriptFilesHandledByTypeScript,
        settings: "off",
      },
    },
    "no-dupe-class-members": {
      settings: "error",
      override: {
        files: allTypeScriptFilesHandledByTypeScript,
        settings: "off",
      },
    },
    "no-dupe-keys": {
      settings: "error",
      override: {
        files: allTypeScriptFilesHandledByTypeScript,
        settings: "off",
      },
    },
    "no-extra-boolean-cast": {
      settings: ["error", { enforceForInnerExpressions: true }],
    },
    "no-new-native-nonconstructor": {
      settings: "off",
      admonishments: [
        {
          type: "note",
          text: "We use the `unicorn/new-for-builtins` rule to better cover the use of `new` beyond what TypeScript also guards with its type checker.",
        },
      ],
    },
    "no-this-before-super": {
      settings: "error",
      override: {
        files: allTypeScriptFilesHandledByTypeScript,
        settings: "off",
      },
    },
    "no-unreachable": {
      settings: "error",
      override: {
        files: allTypeScriptFilesNoUnreachable,
        settings: "off",
      },
    },
    "no-unsafe-negation": {
      settings: ["error", { enforceForOrderingRelations: false }],
      override: {
        files: allTypeScriptFilesHandledByTypeScript,
        settings: "off",
      },
    },
    "no-unsafe-optional-chaining": {
      settings: ["error", { disallowArithmeticOperators: true }],
    },
    "no-unused-expressions": {
      settings: [
        "error",
        {
          allowShortCircuit: false,
          allowTaggedTemplates: false,
          allowTernary: false,
          enforceForJSX: true,
          ignoreDirectives: false,
        },
      ],
    },
    "no-unused-vars": {
      settings: [
        "error",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          fix: {
            imports: "fix",
            variables: "fix",
          },
          ignoreClassWithStaticInitBlock: false,
          ignoreRestSiblings: false,
          ignoreUsingDeclarations: false,
          reportUsedIgnorePattern: true,
          reportVarsOnlyUsedAsTypes: true,
          vars: "all",
          varsIgnorePattern: "^_",
        },
      ],
    },
    "use-isnan": {
      settings: ["error", { enforceForIndexOf: true, enforceForSwitchCase: true }],
    },
  },
  suspicious: {
    "block-scoped-var": {
      settings: "error",
    },
    "no-extend-native": {
      settings: ["error", { exceptions: [] }],
    },
    "no-extra-bind": {
      settings: "error",
    },
    "no-implied-eval": {
      settings: "error",
      override: {
        files: allTypeScriptFilesNoImpliedEval,
        settings: "off",
      },
    },
    "no-new": {
      settings: "error",
    },
    "no-shadow": {
      settings: [
        "error",
        {
          allow: [],
          builtinGlobals: true,
          hoist: "functions-and-types",
          ignoreFunctionTypeParameterNameValueShadow: true,
          ignoreOnInitialization: true,
          ignoreTypeValueShadow: true,
        },
      ],
    },
    "no-unexpected-multiline": {
      settings: "error",
    },
    "no-unmodified-loop-condition": {
      settings: ["error", { checkConditionalExpressions: true }],
    },
    "no-unneeded-ternary": {
      settings: ["error", { defaultAssignment: false }],
    },
    "no-useless-concat": {
      settings: "error",
    },
    "no-useless-constructor": {
      settings: "error",
    },
    "preserve-caught-error": {
      settings: ["error", { requireCatchParameter: true }],
    },
  },
  restriction: {
    "class-methods-use-this": {
      settings: [
        "error",
        {
          enforceForClassFields: true,
          exceptMethods: [],
          ignoreClassesWithImplements: "public-fields",
          ignoreOverrideMethods: true,
        },
      ],
    },
    "default-case": {
      settings: ["error", { commentPattern: "No default" }],
      override: {
        files: allTypeScriptFilesDefaultCase,
        settings: "off",
      },
    },
    "no-alert": {
      settings: "error",
      admonishments: [
        {
          type: "warning",
          text: "It may be tempting to turn this rule off when developing a console/cli app. Instead, you should use a proper prompt library such as [Inquirer](https://github.com/sboudrias/inquirer.js/) to handle prompts and confirmations.",
        },
      ],
    },
    "no-bitwise": {
      settings: ["error", { allow: [], int32Hint: false }],
      admonishments: [
        {
          type: "tip",
          text: "For special circumstances such as [handling Discord permissions](https://docs.discord.com/developers/topics/permissions), we recommend creating dedicated methods or using a proper library for bitwise operations instead of disabling this rule.",
        },
      ],
    },
    "no-console": {
      settings: ["error", { allow: [] }],
      admonishments: [
        {
          type: "warning",
          text: "Logging via the built-in `console` object can be convenient, but usually leads to excess outputs hanging around, and in some runtimes, synchronous logging that can bottleneck the application; it's best to use a logging framework, or (carefully) consolidate any console logging to a small service for smaller apps.",
        },
      ],
    },
    "no-div-regex": {
      settings: "error",
    },
    "no-empty": {
      settings: ["error", { allowEmptyCatch: false }],
    },
    "no-empty-function": {
      settings: ["error", { allow: [] }],
    },
    "no-eq-null": {
      settings: "error",
    },
    "no-implicit-globals": {
      settings: ["error", { lexicalBindings: true }],
    },
    "no-param-reassign": {
      settings: [
        "error",
        { ignorePropertyModificationsFor: [], ignorePropertyModificationsForRegex: [], props: false },
      ],
    },
    "no-plusplus": {
      settings: ["error", { allowForLoopAfterthoughts: true }],
    },
    "no-proto": {
      settings: "error",
    },
    "no-regex-spaces": {
      settings: "error",
    },
    "no-sequences": {
      settings: ["error", { allowInParentheses: true }],
    },
    "no-use-before-define": {
      settings: [
        "error",
        {
          allowNamedExports: false,
          classes: true,
          enums: true,
          functions: true,
          ignoreTypeReferences: true,
          typedefs: true,
          variables: true,
        },
      ],
    },
    "no-var": {
      settings: "error",
    },
    "no-void": {
      settings: ["error", { allowAsStatement: true }],
    },
    "unicode-bom": {
      settings: ["error", "never"],
    },
  },
  perf: {
    "no-await-in-loop": {
      settings: "error",
    },
    "no-useless-call": {
      settings: "error",
    },
  },
  pedantic: {
    "accessor-pairs": {
      settings: [
        "error",
        { enforceForClassMembers: true, enforceForTSTypes: false, getWithoutSet: false, setWithoutGet: true },
      ],
    },
    "array-callback-return": {
      settings: ["error", { allowImplicit: false, allowVoid: false, checkForEach: true }],
    },
    eqeqeq: {
      settings: ["error", "always", { null: "always" }],
    },
    "max-classes-per-file": {
      settings: ["error", { ignoreExpressions: false, max: 1 }],
    },
    "max-lines": {
      settings: ["error", { max: 10_000, skipBlankLines: true, skipComments: true }],
    },
    "max-lines-per-function": {
      settings: ["error", { IIFEs: true, max: 1000, skipBlankLines: true, skipComments: true }],
    },
    "max-nested-callbacks": {
      settings: ["error", { max: 10 }],
    },
    "no-array-constructor": {
      settings: "error",
    },
    "no-case-declarations": {
      settings: "error",
    },
    "no-constructor-return": {
      settings: "error",
    },
    "no-else-return": {
      settings: ["error", { allowElseIf: true }],
    },
    "no-fallthrough": {
      settings: [
        "error",
        { allowEmptyCase: false, commentPattern: "Falls through", reportUnusedFallthroughComment: true },
      ],
    },
    "no-inline-comments": {
      settings: ["error", { ignorePattern: "__PURE__|__NO_SIDE_EFFECTS__|webpackChunkName|@vite-ignore|[vc]8 ignore" }],
      admonishments: [
        {
          type: "tip",
          text: "We allow a very limited set of inline comments for bundler annotations and test coverage directives that are commonly misflagged by this rule.",
        },
      ],
    },
    "no-inner-declarations": {
      settings: ["error", "functions", { blockScopedFunctions: "allow", namespaces: "disallow" }],
    },
    "no-lonely-if": {
      settings: "error",
    },
    "no-loop-func": {
      settings: "error",
    },
    "no-negated-condition": {
      settings: "error",
    },
    "no-object-constructor": {
      settings: "error",
    },
    "no-promise-executor-return": {
      settings: ["error", { allowVoid: false }],
    },
    "no-prototype-builtins": {
      settings: "error",
    },
    "no-redeclare": {
      settings: ["error", { builtinGlobals: true }],
      override: {
        files: allTypeScriptFilesHandledByTypeScript,
        settings: "off",
      },
    },
    "no-self-compare": {
      settings: "error",
    },
    "no-useless-return": {
      settings: "error",
    },
    "no-warning-comments": {
      settings: ["error", { decoration: ["*", "/"], location: "start", terms: ["fixme"] }],
      admonishments: [
        {
          type: "tip",
          text: "We use `FIXME` as a designated comment keyword to indicate something should be fixed before pushing the code to production.",
        },
      ],
    },
    radix: {
      settings: ["error", "always"],
    },
    "require-unicode-regexp": {
      settings: ["error", { requireFlag: "v" }],
    },
    "symbol-description": {
      settings: "error",
    },
  },
  style: {
    "arrow-body-style": {
      settings: ["error", "as-needed", { requireReturnForObjectLiteral: true }],
    },
    "capitalized-comments": {
      settings: [
        "error",
        "always",
        { ignoreConsecutiveComments: true, ignoreInlineComments: true, ignorePattern: "[vc]8 ignore" },
      ],
      admonishments: [
        {
          type: "note",
          text: "Test coverage directives (eg `/* v8 ignore next */`) must be lowercase to work, so they're exempt from this rule.",
        },
      ],
    },
    curly: {
      settings: ["error", "all"],
    },
    "default-case-last": {
      settings: "error",
    },
    "default-param-last": {
      settings: "error",
    },
    "func-name-matching": {
      settings: ["error", "always", { considerPropertyDescriptor: true, includeCommonJSModuleExports: false }],
    },
    "func-names": {
      settings: ["error", "as-needed", { generators: "as-needed" }],
    },
    "func-style": {
      settings: ["error", "declaration", { allowArrowFunctions: true, allowTypeAnnotation: false }],
    },
    "grouped-accessor-pairs": {
      settings: ["error", "getBeforeSet", { enforceForTSTypes: true }],
    },
    "guard-for-in": {
      settings: "error",
    },
    "id-length": {
      settings: [
        "error",
        {
          checkGeneric: true,
          exceptionPatterns: ["^[A-Z]$"],
          exceptions: ["_", "fs", "t", "v", "z"],
          max: Number.MAX_SAFE_INTEGER,
          min: 3,
          properties: "never",
        },
      ],
      admonishments: [
        {
          type: "note",
          text: "We allow very specific exceptions for well-recognized i18n and schema validation library conventions (eg i18next, valibot, zod), which often make use of single-letter functions. A lone `_` is allowed for ignored parameters, as are single uppercase letters for generic type parameters (eg `T`).",
        },
      ],
    },
    "logical-assignment-operators": {
      settings: ["error", "always", { enforceForIfStatements: true }],
    },
    "max-params": {
      settings: ["error", { countThis: "never", max: 4 }],
      admonishments: [
        {
          type: "note",
          text: "We choose not to count `this` as a parameter as it's often used to set scope, and is often included outside the programmer's control.",
        },
      ],
    },
    "new-cap": {
      settings: [
        "error",
        { capIsNew: true, capIsNewExceptions: [], newIsCap: true, newIsCapExceptions: ["ctor"], properties: true },
      ],
      admonishments: [
        {
          type: "tip",
          text: "Use the designated word `ctor` to represent a generic class constructor method, such as when used as a parameter in a function.",
        },
      ],
    },
    "no-continue": {
      settings: "error",
    },
    "no-extra-label": {
      settings: "error",
    },
    "no-implicit-coercion": {
      settings: ["error", { allow: [], boolean: true, disallowTemplateShorthand: false, number: true, string: true }],
    },
    "no-label-var": {
      settings: "error",
    },
    "no-labels": {
      settings: ["error", { allowLoop: true, allowSwitch: false }],
    },
    "no-lone-blocks": {
      settings: "error",
    },
    "no-magic-numbers": {
      settings: [
        "error",
        {
          detectObjects: false,
          enforceConst: true,
          ignore: [-1, "-1n", 0, "0n", 1, "1n"],
          ignoreArrayIndexes: true,
          ignoreClassFieldInitialValues: true,
          ignoreDefaultValues: true,
          ignoreEnums: true,
          ignoreNumericLiteralTypes: true,
          ignoreReadonlyClassProperties: true,
          ignoreTypeIndexes: true,
        },
      ],
      override: {
        files: testFiles,
        settings: "off",
      },
    },
    "no-multi-assign": {
      settings: ["error", { ignoreNonDeclaration: false }],
    },
    "no-multi-str": {
      settings: "error",
    },
    "no-nested-ternary": {
      settings: "error",
    },
    "no-new-func": {
      settings: "error",
    },
    "no-return-assign": {
      settings: ["error", "always"],
    },
    "no-script-url": {
      settings: "error",
    },
    "no-template-curly-in-string": {
      settings: "error",
    },
    "no-useless-computed-key": {
      settings: ["error", { enforceForClassMembers: true }],
    },
    "object-shorthand": {
      settings: [
        "error",
        "always",
        { avoidExplicitReturnArrows: false, avoidQuotes: false, ignoreConstructors: false },
      ],
    },
    "one-var": {
      settings: ["error", "never"],
    },
    "operator-assignment": {
      settings: ["error", "always"],
    },
    "prefer-arrow-callback": {
      settings: ["error", { allowNamedFunctions: false, allowUnboundThis: true }],
    },
    "prefer-const": {
      settings: ["error", { destructuring: "any", ignoreReadBeforeAssign: false }],
    },
    "prefer-destructuring": {
      settings: [
        "error",
        { object: true, array: false },
        { enforceForDeclarationWithTypeAnnotation: false, enforceForRenamedProperties: false },
      ],
    },
    "prefer-exponentiation-operator": {
      settings: "error",
    },
    "prefer-named-capture-group": {
      settings: "error",
    },
    "prefer-numeric-literals": {
      settings: "error",
    },
    "prefer-object-has-own": {
      settings: "error",
    },
    "prefer-object-spread": {
      settings: "error",
    },
    "prefer-regex-literals": {
      settings: ["error", { disallowRedundantWrapping: true }],
    },
    "prefer-rest-params": {
      settings: "error",
    },
    "prefer-template": {
      settings: "error",
    },
    "sort-imports": {
      settings: [
        "error",
        {
          allowSeparatedGroups: true,
          ignoreCase: false,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
        },
      ],
      admonishments: [
        {
          type: "note",
          text: "We only use this rule to aid in sorting import specifier names; we make sure newlines reset the sort so that we don't collide with the oxfmt `sortImports` settings",
        },
      ],
    },
    yoda: {
      settings: ["error", "never", { exceptRange: true, onlyEquality: false }],
    },
  },
  nursery: {
    "no-undef": {
      settings: ["warn", { typeof: false }],
      override: {
        files: allTypeScriptFilesHandledByTypeScript,
        settings: "off",
      },
    },
    "no-unreachable-loop": {
      settings: ["warn", { ignore: [] }],
    },
    "no-useless-assignment": {
      settings: "warn",
    },
  },
};

export default eslint;
