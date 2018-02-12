const path = require("path")
const parse = require("acorn").parse
const transform = require(".").transform

const TestStream = require('test262-stream');

const testDir = path.dirname(require.resolve("test262/package.json"));

const endOfAssertJs = "assert.throws(err, function() { Function(wrappedCode); }, 'Function: ' + code);\n};"
const useStrict = '"use strict";\n';

const unsupportedFeatures = [
  "BigInt",
  "class-fields",
  "class-fields-private",
  "class-fields-public",
  "numeric-separator-literal",
  "optional-catch-binding",
  "regexp-lookbehind",
  "regexp-named-groups",
  "regexp-unicode-property-escapes"
]

const report = test => (s, e, text) => {
  if (true) {
    console.warn(`${test.file} S${s}: ${e}`);
/*
    console.log(text);
    require("process").exit()
*/
  }
  return {fail: s}
}
var vm = require('vm')
const exec = text => {
  vm.runInNewContext(useStrict + "var print = console.warn; var $262 = {destroy() {}, createRealm() { return { global: global }; }};\n" + text, { global }, {timeout: 1000})
}
const runTest = (content, harness, report) => {
  let isEs3 = false
  try {
    parse(content, {ecmaVersion: 3})
    isEs3 = true
  } catch (e) {}
  if (isEs3) return {skip: "validEs3"}
  try {
    const transformed = transform(content, { transforms: { dangerousForOf: true, dangerousTaggedTemplateString: true }, objectAssign: "Object.assign" }).code
    try {
      const parsed = parse(transformed, {ecmaVersion: 5})
      try { exec(harness + content) } catch (e) { return {skip: "nodeBug"} }
      try {
        exec(harness + transformed)
      } catch (e) { return report(1, e, transformed) }
    } catch (e) { return report(2, e, transformed) }
  } catch (e) { if (e.message.match(/(Generators are|export is|import is|Regular expression sticky flag is) not supported|Computed accessor properties are not currently supported/)) return {skip: "missingFeature"}
    return report(3, e, content) }
  return {pass: true}
}

const stream = new TestStream(testDir, {acceptVersion: "2.0.0"});
const results = [];
stream.on('data', test => {
  if (test.attrs.negative && (test.attrs.negative.phase === "parse" || test.attrs.negative.phase === "early")) {
    results.push({skip: "testsParseError"});
    return
  }
  if (test.attrs.includes && test.attrs.includes.includes("fnGlobalObject.js")) {
    // FIXME: Not strictly necessary, but the skipped tests seem boring
    results.push({skip: "fnGlobalObject"});
    return;
  }
  if (test.attrs.includes && test.attrs.includes.includes("detachArrayBuffer.js")) {
    // test bug: I don't know how to detach an array buffer in nodejs
    results.push({skip: "detachArrayBuffer"});
    return;
  }
  if (test.file.includes("/AsyncFunction/") || test.file.includes("async-") || test.file.includes("await")) {
    // buble bug: Does not transpile async functions
    results.push({fail: "asyncFunction"});
    return;
  }
  if (test.file.includes("/Atomics/") || test.file.includes("/DataView/") || test.file.endsWith("sab.js")) {
    // test bug: my nodejs doesn't support this
    results.push({skip: true});
    return;
  }
  if (test.file.includes("ary-ptrn-elem-ary-empty-iter") || test.file.endsWith("-object-patterns.js")) {
    // buble bug: buble throws an error
    results.push({fail: "bubleThrowsError"});
    return;
  }
  if (test.file.endsWith("method-override.js") || test.file.endsWith("setter-constructor.js")) {
    // buble bug: Shouldn't trigger setters on a classes superclass
    results.push({fail: "superclassSetter"});
    return;
  }
  test.file = test.file.substr(5); // Strip leading 'test/'
  if (test.file == "language/expressions/assignment/dstr-array-elem-init-fn-name-arrow.js") {
    // buble bug: buble emits invalid code
    results.push({fail: "bubleBadArrowTranspiling"});
    return;
  }
  if (test.file.includes("subclass/builtin-objects") ||
      test.file.endsWith("ctx-ctor.js") || [
        "intl402/Collator/subclassing.js",
        "language/statements/class/subclass/builtins.js",
        "built-ins/ArrayBuffer/isView/arg-is-dataview-subclass-instance.js",
        "built-ins/ArrayBuffer/isView/arg-is-typedarray-subclass-instance.js",
      ].includes(test.file)) {
    // buble bug: subclassing of builtins does not work
    results.push({fail: "subclassingBuiltins"});
    return;
  }
  if ([
    "language/computed-property-names/to-name-side-effects/class.js",
    "language/computed-property-names/to-name-side-effects/numbers-class.js"
  ].includes(test.file)) {
    // buble bug: class methods should not be enumerable on the prototype
    results.push({fail: "nonEnumerablePrototypeProperties"});
    return;
  }
  if (test.file.includes("for-of/dstr-obj-rest-")) {
    // buble bug: emits code with invalid runtime behavior for rest properties in for-of loop heads
    results.push({fail: "s1_invalidRestPropertiesForOf"});
    return;
  }
  if ([
    "language/destructuring/binding/initialization-requires-object-coercible-null.js",
    "language/destructuring/binding/initialization-requires-object-coercible-undefined.js",
  ].includes(test.file) || test.file.endsWith("obj-init-null.js") || test.file.endsWith("obj-init-undefined.js")) {
    // buble bug: destructuring null or undefined should fail
    results.push({fail: "destructuringNullOrUndefined"});
    return;
  }
  if (test.file.endsWith("dflt-params-ref-later.js") || test.file.endsWith("dflt-params-ref-self.js")) {
    // buble bug: buble allows referencing later and self arguments in default values
    results.push({fail: "badParamsDefault"});
    return;
  }
  if (test.file.endsWith("dflt-params-trailing-comma.js") || test.file == "language/expressions/arrow-function/length-dflt.js") {
    // buble bug: buble does not correctly set arguments count with default parameter
    results.push({fail: "fnLengthDefaultParams"});
    return;
  }
  if ([
    "language/expressions/arrow-function/lexical-super-call-from-within-constructor.js",
  ].includes(test.file)) {
    // buble bug: Shouldn't be able to call super() outside of constructor
    results.push({fail: "superConstructor"});
    return;
  }
  if ([
    "language/statements/class/syntax/class-body-method-definition-super-property.js"
  ].includes(test.file)) {
    // buble bug: There are no restrictions on super property
    results.push({fail: "superProperty"});
    return;
  }
  if ([
    "language/expressions/arrow-function/scope-paramsbody-var-open.js",
  ].includes(test.file)) {
    // buble bug: Transpiled default value function access function body's scope
    results.push({fail: "defaultValueScope"});
    return;
  }
  if ([
    "language/expressions/arrow-function/prototype-rules.js",
  ].includes(test.file)) {
    // buble bug: transpiled arrow functions have a prototype
    results.push({fail: "arrowPrototype"});
    return;
  }
  if ([
    "language/expressions/arrow-function/throw-new.js",
  ].includes(test.file)) {
    // buble bug: transpiled arrow functions allow new
    results.push({fail: "arrowNew"});
    return;
  }
  if ([
    "built-ins/RegExp/dotall/with-dotall-unicode.js",
    "built-ins/RegExp/dotall/with-dotall.js",
    "built-ins/RegExp/prototype/dotAll/this-val-regexp.js",
    "built-ins/RegExp/prototype/flags/this-val-regexp.js",
  ].includes(test.file)) {
    // buble bug: dotAll is not supported
    results.push({fail: "dotAll"});
    return;
  }
  if ([
    "language/expressions/array/spread-obj-getter-init.js"
  ].includes(test.file)) {
    // buble bug: Object.assign (spread) executes getters instead of copying them
    results.push({fail: "objectAssignGetters"});
    return;
  }
  if (test.contents.includes("static name()")) {
    // buble bug: cannot transpile static method called name
    results.push({fail: "staticName"});
    return;
  }
  if (test.contents.includes("String.raw`")) {
    // buble bug: dangerousTaggedTemplateLiteral
    results.push({fail: "dangerousTaggedTemplateLiteral"});
    return;
  }
  if (test.file.endsWith("escape-hex.js") || test.contents.includes("\\u")) {
    // buble bug: Does not transpile unicode escapes
    results.push({fail: "unicodeEscapes"});
    return;
  }
  if (test.contents.includes("eval(") || test.contents.includes("eval)")) {
    // buble bug: does not transpile in eval
    // not all of these are bad, but in general there's nothing interesting to be
    // gained from these tests
    results.push({fail: "eval"});
    return;
  }
  if (test.contents.includes("Symbol.iterator")) {
    // buble bug: does not support iterators in spread
    results.push({fail: "iterators"});
    return;
  }
  if (test.file.endsWith("put-const.js") || test.file == "language/global-code/decl-lex.js" || test.file.includes("const-invalid-assignment")) {
    // test bug: buble performs runtime const check at compile time
    results.push({skip: "constCheck"});
    return
  }
  if (test.file.includes("derived-class-return-override-with-") && !test.file.includes("derived-class-return-override-with-undefined")) {
    // buble bug: allows constructors to return !== undefined
    results.push({fail: "returnNotUndefined"});
    return;
  }
  if ([
    "language/statements/class/subclass/default-constructor.js",
    "language/statements/class/subclass/default-constructor-2.js",
    "language/statements/class/subclass/binding.js"
  ].includes(test.file)) {
    // buble bug: allows constructors to be called without new
    results.push({fail: "noNewConstructor"});
    return;
  }
  if (test.file.includes("before-initialization")) {
    // buble bug: lexically scoped variables have no temporal dead zone
    results.push({fail: "s1_tdz"});
    return;
  }
  // s2: for ({x} of []) a.push(() => x)
  if ([
    "language/statements/class/name-binding/in-extends-expression-assigned.js",
    "language/statements/class/name-binding/in-extends-expression.js",
  ].includes(test.file)) {
    // buble bug: allows classes to extend itself
    results.push({fail: "superClassSelf"});
    return;
  }
  if ([
    "language/statements/class/name-binding/const.js"
  ].includes(test.file)) {
    // buble bug: allows classes to be redefined
    results.push({fail: "classDeclarationConst"});
    return;
  }

  if (test.file.includes("let-closure-inside-")) {
    // buble bug: does not close over let in for head
    results.push({fail: "letClosureForHead"});
    return;
  }
  if ([
      "intl402/language-tags-canonicalized.js",
      "built-ins/Promise/executor-function-name.js",
      "built-ins/Promise/reject-function-name.js",
      "built-ins/TypedArrays/typedarray-arg-other-ctor-buffer-ctor-species-not-ctor-throws.js",
      "intl402/Collator/default-options-object-prototype.js",

      // buble bug: lexical declarations should shadow globals
      "language/global-code/decl-lex-configurable-global.js",
    ].includes(test.file)) {
    results.push({skip: true});
    return;
  }
  if ([
    "language/statements/for-of/head-lhs-cover.js",
    "language/statements/for-of/head-lhs-member.js",
  ].includes(test.file)) {
    // buble bug: does not support member or parenthesized expressions in for-of head
    results.push({fail: "moreTypesForOfHead"});
    return;
  }
  if (test.attrs.features && unsupportedFeatures.some(f => test.attrs.features.includes(f))) {
    results.push({fail: "unsupportedFeatures"});
    return;
  }
  if (test.contents.includes("new.target")) {
    // buble bug: Does not transpile new.target
    results.push({fail: "newTarget"});
    return;
  }
  let harness = '';
  if (!test.attrs.flags.raw) {
    if (test.contents.substr(0, useStrict.length) !== useStrict) {
      results.push({skip: "noStrict"});
      return;
    }
    const m = test.contents.indexOf(endOfAssertJs) + endOfAssertJs.length
    harness = test.contents.substr(0, m);
    test.contents = test.contents.substr(m);
  }
  results.push(runTest(test.contents, harness, report(test)));
});

stream.on('end', () => {
  const counts = results.reduce((counts, i) => {
    const key = i.skip ? ("skip_" + i.skip) : (i.pass ? "pass" : ("fail_" + i.fail))
    counts[key] = (counts[key] || 0) + 1
    return counts
  }, {})
  console.warn(counts)
});
