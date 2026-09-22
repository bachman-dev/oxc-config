import type { OxlintRuleGroup } from "../types.ts";
import { testFiles } from "../utils.ts";

const typescript: OxlintRuleGroup = {
  name: "TypeScript Rules",
  plugin: "typescript",
  description:
    "These rules were ported from typescript-eslint, and are specifically tailored for linting TypeScript code.",
  changes: [
    "The `no-empty-object-type` and `no-empty-interface` rules now permit empty interfaces that extend from a single interface",
    "The `no-explicit-any` rule ported from typescript-eslint now fixes `any` types to `unknown`",
    "The newer `strict-void-return` rule has been enabled",
    "`consistent-type-assertions` now bans type assertions entirely, as better approaches such as the `satisfies` operator exist; only in rare cases should you need to disable this rule on a line",
  ],
  correctness: {
    "typescript/unbound-method": {
      settings: ["error", { ignoreStatic: false }],
      override: {
        files: testFiles,
        settings: "off",
      },
      admonishments: [
        {
          type: "note",
          text: "Test files commonly pass spied-on methods to `expect()` (eg `expect(service.method).toHaveBeenCalled()`), which is safe but trips this rule.",
        },
      ],
    },
  },
  suspicious: {
    "typescript/no-confusing-non-null-assertion": {
      settings: "error",
    },
    "typescript/no-extraneous-class": {
      settings: [
        "error",
        { allowConstructorOnly: false, allowEmpty: false, allowStaticOnly: false, allowWithDecorator: false },
      ],
    },
    "typescript/no-unnecessary-boolean-literal-compare": {
      settings: ["error", { allowComparingNullableBooleansToFalse: true, allowComparingNullableBooleansToTrue: true }],
    },
    "typescript/no-unnecessary-template-expression": {
      settings: "error",
    },
    "typescript/no-unnecessary-type-arguments": {
      settings: "error",
    },
    "typescript/no-unnecessary-type-assertion": {
      settings: ["error", { checkLiteralConstAssertions: false, typesToIgnore: [] }],
    },
    "typescript/no-unnecessary-type-constraint": {
      settings: "error",
    },
    "typescript/no-unnecessary-type-conversion": {
      settings: "error",
    },
    "typescript/no-unnecessary-type-parameters": {
      settings: "error",
    },
    "typescript/no-unsafe-enum-comparison": {
      settings: "error",
    },
    "typescript/no-unsafe-type-assertion": {
      settings: "error",
    },
  },
  restriction: {
    "typescript/explicit-function-return-type": {
      settings: [
        "error",
        {
          allowConciseArrowFunctionExpressionsStartingWithVoid: false,
          allowDirectConstAssertionInArrowFunctions: true,
          allowExpressions: false,
          allowFunctionsWithoutTypeParameters: false,
          allowHigherOrderFunctions: true,
          allowIIFEs: false,
          allowTypedFunctionExpressions: true,
          allowedNames: [],
        },
      ],
    },
    "typescript/explicit-member-accessibility": {
      settings: ["error", { accessibility: "explicit", ignoredMethodNames: [], overrides: {} }],
    },
    "typescript/explicit-module-boundary-types": {
      settings: [
        "error",
        {
          allowArgumentsExplicitlyTypedAsAny: false,
          allowDirectConstAssertionInArrowFunctions: true,
          allowHigherOrderFunctions: true,
          allowOverloadFunctions: false,
          allowTypedFunctionExpressions: true,
          allowedNames: [],
        },
      ],
    },
    "typescript/no-dynamic-delete": {
      settings: "error",
    },
    "typescript/no-empty-object-type": {
      settings: ["error", { allowInterfaces: "with-single-extends", allowObjectTypes: "never" }],
    },
    "typescript/no-explicit-any": {
      settings: ["error", { fixToUnknown: true, ignoreRestArgs: false }],
    },
    "typescript/no-import-type-side-effects": {
      settings: "error",
    },
    "typescript/no-invalid-void-type": {
      settings: ["error", { allowAsThisParameter: false, allowInGenericTypeArguments: true }],
    },
    "typescript/no-namespace": {
      settings: ["error", { allowDeclarations: false, allowDefinitionFiles: true }],
    },
    "typescript/no-non-null-asserted-nullish-coalescing": {
      settings: "error",
    },
    "typescript/no-non-null-assertion": {
      settings: "error",
    },
    "typescript/prefer-literal-enum-member": {
      settings: ["error", { allowBitwiseExpressions: false }],
    },
    "typescript/promise-function-async": {
      settings: [
        "error",
        {
          allowAny: true,
          allowedPromiseNames: [],
          checkArrowFunctions: true,
          checkFunctionDeclarations: true,
          checkFunctionExpressions: true,
          checkMethodDeclarations: true,
        },
      ],
    },
    "typescript/use-unknown-in-catch-callback-variable": {
      settings: "error",
    },
  },
  perf: {
    // None as of oxlint 1.82.0
  },
  pedantic: {
    "typescript/ban-ts-comment": {
      settings: [
        "error",
        {
          minimumDescriptionLength: 10,
          "ts-check": false,
          "ts-expect-error": "allow-with-description",
          "ts-ignore": true,
          "ts-nocheck": true,
        },
      ],
    },
    "typescript/no-confusing-void-expression": {
      settings: [
        "error",
        { ignoreArrowShorthand: false, ignoreVoidOperator: false, ignoreVoidReturningFunctions: false },
      ],
    },
    "typescript/no-deprecated": {
      settings: ["error", { allow: [] }],
    },
    "typescript/no-misused-promises": {
      settings: ["error", { checksConditionals: true, checksSpreads: true, checksVoidReturn: true }],
    },
    "typescript/no-mixed-enums": {
      settings: "error",
    },
    "typescript/no-unsafe-argument": {
      settings: "error",
    },
    "typescript/no-unsafe-assignment": {
      settings: "error",
    },
    "typescript/no-unsafe-call": {
      settings: "error",
    },
    "typescript/no-unsafe-function-type": {
      settings: "error",
    },
    "typescript/no-unsafe-member-access": {
      settings: ["error", { allowOptionalChaining: false }],
    },
    "typescript/no-unsafe-return": {
      settings: "error",
    },
    "typescript/only-throw-error": {
      settings: ["error", { allow: [], allowRethrowing: true, allowThrowingAny: true, allowThrowingUnknown: true }],
    },
    "typescript/prefer-enum-initializers": {
      settings: "error",
    },
    "typescript/prefer-includes": {
      settings: "error",
    },
    "typescript/prefer-nullish-coalescing": {
      settings: [
        "error",
        {
          ignoreBooleanCoercion: false,
          ignoreConditionalTests: true,
          ignoreIfStatements: false,
          ignoreMixedLogicalExpressions: false,
          ignorePrimitives: {
            bigint: false,
            boolean: false,
            number: false,
            string: false,
          },
          ignoreTernaryTests: false,
        },
      ],
    },
    "typescript/prefer-promise-reject-errors": {
      settings: ["error", { allow: [], allowEmptyReject: false, allowThrowingAny: false, allowThrowingUnknown: false }],
    },
    "typescript/related-getter-setter-pairs": {
      settings: "error",
    },
    "typescript/require-await": {
      settings: "error",
    },
    "typescript/restrict-plus-operands": {
      settings: [
        "error",
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
          skipCompoundAssignments: false,
        },
      ],
    },
    "typescript/return-await": {
      settings: ["error", "always"],
    },
    "typescript/strict-boolean-expressions": {
      settings: [
        "error",
        {
          allowAny: false,
          allowNullableBoolean: false,
          allowNullableEnum: false,
          allowNullableNumber: false,
          allowNullableObject: true,
          allowNullableString: false,
          allowNumber: true,
          allowString: true,
        },
      ],
    },
    "typescript/strict-void-return": {
      settings: ["error", { allowReturnAny: false }],
    },
    "typescript/switch-exhaustiveness-check": {
      settings: [
        "error",
        {
          allowDefaultCaseForExhaustiveSwitch: true,
          considerDefaultExhaustiveForUnions: true,
          defaultCaseCommentPattern: "No default",
          requireDefaultForNonUnion: true,
        },
      ],
      admonishments: [
        {
          type: "note",
          text: "This rule stands in for `default-case` in TypeScript files: switches over unions must handle every member (with no `default` case), and all other switches need a `default` case or a `// No default` comment.",
        },
      ],
    },
  },
  style: {
    "typescript/adjacent-overload-signatures": {
      settings: "error",
    },
    "typescript/array-type": {
      settings: ["error", { default: "array", readonly: "array" }],
    },
    "typescript/ban-tslint-comment": {
      settings: "error",
    },
    "typescript/class-literal-property-style": {
      settings: ["error", "fields"],
    },
    "typescript/consistent-generic-constructors": {
      settings: ["error", "constructor"],
    },
    "typescript/consistent-indexed-object-style": {
      settings: ["error", "record"],
    },
    "typescript/consistent-type-assertions": {
      settings: [
        "error",
        { arrayLiteralTypeAssertions: "never", assertionStyle: "never", objectLiteralTypeAssertions: "never" },
      ],
    },
    "typescript/consistent-type-definitions": {
      settings: ["error", "interface"],
    },
    "typescript/consistent-type-exports": {
      settings: ["error", { fixMixedExportsWithInlineTypeSpecifier: true }],
    },
    "typescript/consistent-type-imports": {
      settings: ["error", { disallowTypeAnnotations: true, fixStyle: "inline-type-imports", prefer: "type-imports" }],
    },
    "typescript/dot-notation": {
      settings: [
        "error",
        {
          allowIndexSignaturePropertyAccess: false,
          allowKeywords: true,
          allowPattern: "",
          allowPrivateClassPropertyAccess: false,
          allowProtectedClassPropertyAccess: false,
        },
      ],
    },
    "typescript/method-signature-style": {
      settings: ["error", "property"],
    },
    "typescript/no-empty-interface": {
      settings: ["error", { allowSingleExtends: true }],
    },
    "typescript/no-inferrable-types": {
      settings: ["error", { ignoreParameters: false, ignoreProperties: false }],
    },
    "typescript/no-unnecessary-qualifier": {
      settings: "error",
    },
    "typescript/parameter-properties": {
      settings: ["error", { allow: [], prefer: "class-property" }],
    },
    "typescript/prefer-find": {
      settings: "error",
    },
    "typescript/prefer-for-of": {
      settings: "error",
    },
    "typescript/prefer-function-type": {
      settings: "error",
    },
    "typescript/prefer-readonly": {
      settings: ["error", { onlyInlineLambdas: false }],
    },
    "typescript/prefer-reduce-type-parameter": {
      settings: "error",
    },
    "typescript/prefer-regexp-exec": {
      settings: "error",
    },
    "typescript/prefer-return-this-type": {
      settings: "error",
    },
    "typescript/prefer-string-starts-ends-with": {
      settings: ["error", { allowSingleElementEquality: "never" }],
    },
  },
  nursery: {
    "typescript/no-unnecessary-condition": {
      settings: ["warn", { allowConstantLoopConditions: "never", checkTypePredicates: false }],
    },
    "typescript/prefer-optional-chain": {
      settings: [
        "warn",
        {
          allowPotentiallyUnsafeFixesThatModifyTheReturnTypeIKnowWhatImDoing: false,
          checkAny: true,
          checkBigInt: true,
          checkBoolean: true,
          checkNumber: true,
          checkString: true,
          checkUnknown: true,
          requireNullish: false,
        },
      ],
    },
  },
};

export default typescript;
