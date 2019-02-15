exports.features_list = {
	//generators: [4, "generators"],

	// test262 features acorn doesn't parse and thus are S3
	"class-fields-private": [3, "unsupportedFeatures"],
	"class-fields-public": [3, "unsupportedFeatures"],
	"class-methods-private": [3, "unsupportedFeatures"],
	"class-static-fields-private": [3, "unsupportedFeatures"],
	"class-static-fields-public": [3, "unsupportedFeatures"],
	"class-static-methods-private": [3, "unsupportedFeatures"],
	"numeric-separator-literal": [3, "unsupportedFeatures"],

	// This is actually something bublé cannot handle, even though acorn parses it
	"optional-catch-binding": [3, "unsupportedFeatures"],

	"dynamic-import": [4, "importReserved"],
	"import.meta": [3, "importMeta"],

	// test262 features bublé doesn't transpile and thus are S2
	// buble bug: Does not transpile new.target
	"new.target": [2, "newTarget"],
	"regexp-lookbehind": [2, "notTranspiledFeatures"],
};

const mapFilePatterns = files => {
	const patterns = files.map(p => p.replace(/[-.,$]/g, '\\$&').replace(/\*/g, '.+'));
	return new RegExp("^(" + patterns.join("|") + ')$');
};

exports.file_list = [
	// buble bug: dangerousTaggedTemplateLiteral
	{ level: 1, desc: "dangerousTaggedTemplateLiteral", files: [
		"language/expressions/(template-literal/tv-*|tagged-template/(template-object-frozen-strict.js|template-object.js|invalid-escape-sequences.js))",
		"built-ins/String/raw/(return-the-string-value-from-template|special-characters|template-substitutions-are-appended-on-same-index|zero-literal-segments).js"
	]},

	// buble bug: async () => {} turned into function async() {}
	// https://github.com/Rich-Harris/buble/issues/109
	{ level: 1, desc: "asyncArrowFunctionEmittedAsName",
		config: { transforms: { asyncAwait: false } },
		files: [
			"language/expressions/async-arrow-function/dflt-params-abrupt.js",
			"language/expressions/async-arrow-function/dflt-params-arg-val-not-undefined.js",
			"language/expressions/async-arrow-function/dflt-params-arg-val-undefined.js",
			"language/expressions/async-arrow-function/dflt-params-ref-prior.js",
			"language/expressions/async-arrow-function/params-trailing-comma-multiple.js",
			"language/expressions/async-arrow-function/params-trailing-comma-single.js",
			"language/expressions/async-arrow-function/try-return-finally-throw.js",
			"language/expressions/async-arrow-function/try-throw-finally-throw.js",
		]
	},

	// Acorn doesn't parse BigInt without acorn-bigint
	{ level: 3, desc: "BigInt", files: [
		"built-ins/BigInt/as(Ui|I)ntN/(a|bits|l|n|o)*",
		"built-ins/BigInt/as(Ui|I)ntN/bigint-tobigint.js",
		"built-ins/BigInt/as(Ui|I)ntN/bigint-tobigint-toprimitive.js",
		"built-ins/BigInt/as(Ui|I)ntN/bigint-tobigint-wrapped-values.js",
		"built-ins/BigInt/(c|i|l|n|p|t|v)*",
		"built-ins/JSON/stringify/bigint(|-order|-replacer|-tojson).js",
		"built-ins/Number/bigint-conversion.js",
		"built-ins/Object/bigint.js",
		"built-ins/Object/prototype/toString/Object.prototype.toString.call-bigint.js",
		"built-ins/Object/setPrototypeOf/bigint.js",
		"built-ins/String/prototype/indexOf/position-tointeger-bigint.js",
		"built-ins/String/prototype/indexOf/searchstring-tostring-bigint.js",
		"built-ins/TypedArrayConstructors/BigInt/*",
		"built-ins/TypedArrayConstructors/(i|o|p)*(BigInt|bigint)*",
		"built-ins/TypedArray/prototype/*/BigInt/*",
		"built-ins/TypedArray/prototype/set/src-typedarray-big-throws.js",
		"language/*bigint*",
	]},

	// These have an u flag, so regexpucore throws
	{ level: 3, desc: "regexpNamedGroups", files: [
		"built-ins/RegExp/named-groups/(groups-p*.js|l*|unicode-(p*|r*))",
	]},

	// These don't have an u flag, so regexpucore is not executed on them
	{ level: 2, desc: "regexpNamedGroups", files: [
		"annexB/built-ins/RegExp/named-groups/non-unicode-malformed.js",
		"built-ins/RegExp/named-groups/groups-object-unmatched.js",
		"built-ins/RegExp/named-groups/groups-object.js",
		"built-ins/RegExp/named-groups/non-unicode-match.js",
		"built-ins/RegExp/named-groups/non-unicode-property-names.js",
		"built-ins/RegExp/named-groups/non-unicode-references.js",
		"language/literals/regexp/named-groups/forward-reference.js",
	]},

	{ level: 3, desc: "regjsparserBug", files: [
		"built-ins/RegExp/named-groups/unicode-property-names.js",
	]},

	{ level: 1, desc: "regexpucoreBug", files: [
		"built-ins/RegExp/property-escapes/generated/Case_Ignorable.js",
		"built-ins/RegExp/property-escapes/generated/Changes_When_NFKC_Casefolded.js",
		"built-ins/RegExp/property-escapes/generated/Changes_When_Titlecased.js",
		"built-ins/RegExp/property-escapes/generated/Changes_When_Uppercased.js",
		"built-ins/RegExp/property-escapes/generated/General_Category_-_Decimal_Number.js",
		"built-ins/RegExp/property-escapes/generated/General_Category_-_Lowercase_Letter.js",
		"built-ins/RegExp/property-escapes/generated/General_Category_-_Number.js",
		"built-ins/RegExp/property-escapes/generated/General_Category_-_Other.js",
		"built-ins/RegExp/property-escapes/generated/General_Category_-_Unassigned.js",
		"built-ins/RegExp/property-escapes/generated/Grapheme_Base.js",
		"built-ins/RegExp/property-escapes/generated/ID_Continue.js",
		"built-ins/RegExp/property-escapes/generated/Lowercase.js",
		"built-ins/RegExp/property-escapes/generated/XID_Continue.js",
	]},

	// buble bug: Since we parse with module source type, this does not parse
	// https://tc39.github.io/ecma262/#sec-identifiers-static-semantics-early-errors
	{ level: 3, desc: "awaitKeyword", files: [
		'language/expressions/await/await-BindingIdentifier-in-global.js',
		'language/expressions/await/await-in-generator.js',
		'language/expressions/await/await-in-nested-function.js',
		'language/expressions/await/await-in-nested-generator.js',
		"language/expressions/class/class-name-ident-await-escaped.js",
		"language/expressions/class/class-name-ident-await.js",
		"language/expressions/dynamic-import/assignment-expression/await-identifier.js",
		"language/statements/class/class-name-ident-await-escaped.js",
		"language/statements/class/class-name-ident-await.js",
	]},

	// Another valid script, invalid module (see also above)
	{ level: 3, desc: "scriptInvalidModule", files: [
		"*eval-script-code-host-resolves-module-code*",
		"*script-code-valid*",
	]},

	{ level: 4, desc: "asyncFunction", files: [
		"*await*",
		"*AsyncFunction*",
		"*async-(gen|meth|super|function|await)*",
		"language/expressions/async-arrow-function/(ar|aw|d|e|p|r|t)*",
		"built-ins/Function/prototype/toString/async-arrow-function.js",
		"*returns-promise.js",
	]},

	// buble bug: buble throws an error
	{ level: 3, desc: "bubleThrowsError", files: [
		"*ary-ptrn-elem-ary-empty-iter*",
		"*-object-patterns.js"
	]},

	// buble bug: Shouldn't trigger setters on a classes superclass
	{ level: 1, desc: "superclassSetter", files: [
		"*method-override.js",
		"language/statements/class/definition/side-effects-in-property-define.js",
		"language/statements/class/subclass/superclass-prototype-setter-constructor.js",
	]},

	// buble bug: The unicode property is not set for transpiled unicode regexps
	{ level: 1, desc: "unicodeFlag", files: [
		"built-ins/RegExp/prototype/unicode/this-val-regexp.js"
	]},

	// buble bug: buble emits invalid code
	{ level: 2, desc: "bubleBadArrowTranspiling", files: [
		"language/expressions/assignment/dstr/array-elem-init-fn-name-arrow.js",
		"language/expressions/assignment/dstr/obj-prop-elem-init-fn-name-arrow.js",
		"language/expressions/assignment/dstr/obj-id-init-fn-name-arrow.js",
		"language/expressions/object/fn-name-class.js",
	]},

	// buble bug: name for (arrow) function expressions wrong
	{ level: 1, desc: "functionName", files: [
		"language/statements/for/dstr/const-ary-ptrn-elem-id-init-fn-name-arrow.js",
		"language/statements/for/dstr/const-obj-ptrn-id-init-fn-name-arrow.js",
		"language/statements/for/dstr/const-obj-ptrn-id-init-fn-name-cover.js",
		"language/statements/for/dstr/const-obj-ptrn-id-init-fn-name-fn.js",
		"language/statements/for/dstr/let-ary-ptrn-elem-id-init-fn-name-arrow.js",
		"language/statements/for/dstr/let-obj-ptrn-id-init-fn-name-arrow.js",
		"language/statements/for/dstr/let-obj-ptrn-id-init-fn-name-cover.js",
		"language/statements/for/dstr/let-obj-ptrn-id-init-fn-name-fn.js",
		"language/statements/for/dstr/var-ary-ptrn-elem-id-init-fn-name-arrow.js",
		"language/statements/for/dstr/var-ary-ptrn-elem-id-init-fn-name-cover.js",
		"language/statements/for/dstr/var-ary-ptrn-elem-id-init-fn-name-fn.js",
		"language/statements/for/dstr/var-obj-ptrn-id-init-fn-name-arrow.js",
		"language/statements/for/dstr/var-obj-ptrn-id-init-fn-name-cover.js",
		"language/statements/for/dstr/var-obj-ptrn-id-init-fn-name-fn.js",
		"language/statements/for-of/dstr/array-elem-init-fn-name-arrow.js",
		"language/statements/for-of/dstr/array-elem-init-fn-name-cover.js",
		"language/statements/for-of/dstr/array-elem-init-fn-name-fn.js",
		"language/statements/for-of/dstr/obj-id-init-fn-name-arrow.js",
		"language/statements/for-of/dstr/obj-id-init-fn-name-cover.js",
		"language/statements/for-of/dstr/obj-id-init-fn-name-fn.js",
		"language/statements/for-of/dstr/obj-prop-elem-init-fn-name-arrow.js",
		"language/statements/for-of/dstr/obj-prop-elem-init-fn-name-cover.js",
		"language/statements/for-of/dstr/obj-prop-elem-init-fn-name-fn.js",
		"language/expressions/assignment/dstr/obj-prop-elem-init-fn-name-cover.js",
		"language/expressions/assignment/dstr/obj-prop-elem-init-fn-name-fn.js",
		"language/expressions/assignment/dstr/obj-id-init-fn-name-cover.js",
		"language/expressions/assignment/dstr/obj-id-init-fn-name-fn.js",
		"language/expressions/assignment/dstr/array-elem-init-fn-name-cover.js",
		"language/expressions/assignment/dstr/array-elem-init-fn-name-fn.js",
		"language/expressions/class/name.js",
	]},

	// buble bug: https://github.com/Rich-Harris/buble/issues/77
	{ level: 2, desc: "functionToString", files: [
		"built-ins/Function/prototype/toString/class-declaration-complex-heritage.js"
	]},

	// buble bug: toString of classes, arrow functions and functions with argument defaults
	// is altered
	{ level: 1, desc: "functionToString", files: [
		"built-ins/Function/prototype/toString/class-declaration-complex-heritage.js",
		"built-ins/Function/prototype/toString/class-declaration-explicit-ctor.js",
		"built-ins/Function/prototype/toString/class-declaration-implicit-ctor.js",
		"built-ins/Function/prototype/toString/class-expression-explicit-ctor.js",
		"built-ins/Function/prototype/toString/class-expression-implicit-ctor.js",
		"built-ins/Function/prototype/toString/arrow-function.js",
		"built-ins/Function/prototype/toString/function-declaration-non-simple-parameter-list.js",
		"built-ins/Function/prototype/toString/method-*",
	]},

	// buble bug: class methods should not be enumerable on the prototype
	{ level: 1, desc: "nonEnumerablePrototypeProperties", files: [
		"language/computed-property-names/to-name-side-effects/class.js",
		"language/computed-property-names/to-name-side-effects/numbers-class.js"
	]},

	// buble bug: destructuring null or undefined should fail
	{ level: 1, desc: "destructuringNullOrUndefined", files: [
		"language/destructuring/binding/initialization-requires-object-coercible-null.js",
		"language/destructuring/binding/initialization-requires-object-coercible-undefined.js",
		"*obj-init-null.js", "*obj-init-undefined.js"
	]},

	// buble bug: template cache is keyed based on raw string literal
	{ level: 1, desc: "templateCacheUnicodeEscape", files: [
		"language/expressions/tagged-template/cache-differing-raw-strings.js"
	]},

	// buble bug: buble allows referencing later and self arguments in default values
	{ level: 1, desc: "badParamsDefault", files: [
		"*dflt-params-ref-(later|self).js"
	]},

	// buble bug: buble does not correctly set arguments count with default parameter
	{ level: 1, desc: "fnLengthDefaultParams", files: [
		"*dflt-params-trailing-comma.js",
		"*length-dflt.js"
	]},

	// buble bug: Shouldn't be able to call super() outside of constructor
	{ level: 1, desc: "superConstructor", files: [
		"language/expressions/arrow-function/lexical-super-call-from-within-constructor.js",
	]},

	{ level: 1, desc: "computedProto", files: [
		// buble bug: A computed property called "__proto__" does not set the prototype
		// This is probably not transpilable
		"language/expressions/object/computed-__proto__.js",
		// Duplicate property legal if computed
		"annexB/language/expressions/object/__proto__-duplicate-computed.js",
	]},

	// buble bug: Having a setter or getter with the same name
	// as an earlier property apparently used to be illegal
	{ level: 2, desc: "setterGetterAfterProperty", files: [
		"*prop-dup*"
	]},

	// buble bug: Various bugs around super
	{ level: 1, desc: "superVarious", files: [
		"language/statements/class/definition/this-check-ordering.js",
		"language/statements/class/definition/this-access-restriction.js",
		"language/statements/class/definition/this-access-restriction-2.js",
		"language/statements/class/super/in-constructor-superproperty-evaluation.js",
		"built-ins/Function/internals/Construct/derived-this-uninitialized.js",
		"language/expressions/delete/super-property.js", // delete super.xx
		"language/expressions/super/call-bind-this-value-twice.js",
		"language/expressions/super/call-bind-this-value.js",
		"language/expressions/super/call-proto-not-ctor.js",
		"language/expressions/super/prop-dot-cls-ref-this.js",
		"language/expressions/super/prop-dot-cls-this-uninit.js",
		"language/expressions/super/prop-expr-cls-ref-this.js",
		"language/expressions/super/prop-expr-cls-this-uninit.js",
	]},

	// buble does not support super outside of class methods
	{ level: 3, desc: "superOutsideClass", files: [
		'language/expressions/object/getter-super-prop.js',
		'language/expressions/object/method.js',
		'language/expressions/object/setter-super-prop.js',
		'language/expressions/super/prop-dot-cls-ref-strict.js',
		'language/expressions/super/prop-dot-obj-null-proto.js',
		'language/expressions/super/prop-dot-obj-ref-strict.js',
		'language/expressions/super/prop-dot-obj-ref-this.js',
		'language/expressions/super/prop-dot-obj-val-from-arrow.js',
		'language/expressions/super/prop-dot-obj-val.js',
		'language/expressions/super/prop-expr-cls-err.js',
		'language/expressions/super/prop-expr-cls-key-err.js',
		'language/expressions/super/prop-expr-cls-ref-strict.js',
		'language/expressions/super/prop-expr-cls-unresolvable.js',
		'language/expressions/super/prop-expr-obj-err.js',
		'language/expressions/super/prop-expr-obj-key-err.js',
		'language/expressions/super/prop-expr-obj-null-proto.js',
		'language/expressions/super/prop-expr-obj-ref-strict.js',
		'language/expressions/super/prop-expr-obj-ref-this.js',
		'language/expressions/super/prop-expr-obj-unresolvable.js',
		'language/expressions/super/prop-expr-obj-val-from-arrow.js',
		'language/expressions/super/prop-expr-obj-val.js',
		'language/computed-property-names/object/accessor/getter-super.js',
		'language/computed-property-names/object/accessor/setter-super.js',
		'language/computed-property-names/object/method/super.js',
		'language/expressions/object/method-definition/name-super-prop-body.js',
		'language/expressions/object/method-definition/name-super-prop-param.js',
		'language/statements/class/syntax/class-body-method-definition-super-property.js',
		'language/expressions/object/method-definition/async-super-call-body.js',
		'language/expressions/object/method-definition/async-super-call-param.js',
	]},

	// buble bug: Various bugs around methods
	{ level: 1, desc: "methodsVarious", files: [
		"language/statements/class/definition/setters-prop-desc.js",
		"language/statements/class/definition/prototype-property.js",
		"language/statements/class/definition/methods.js",
		"language/statements/class/definition/getters-prop-desc.js",
		"language/statements/class/definition/accessors.js",
		"language/expressions/object/method-definition/name-prototype-prop.js",
		"language/expressions/object/method-definition/name-invoke-ctor.js",
		"language/computed-property-names/class/static/method-prototype.js",
		"language/statements/class/static-method-non-configurable-err.js",

		// class methods in Object.keys
		"language/computed-property-names/class/static/method-symbol.js",
		"language/computed-property-names/class/static/method-string.js",
		"language/computed-property-names/class/static/method-number.js",
		"language/computed-property-names/class/method/symbol.js",
		"language/computed-property-names/class/method/string.js",
		"language/computed-property-names/class/method/number.js",
	]},

	// buble bug: https://github.com/Rich-Harris/buble/issues/69
	{ level: 2, desc: "computedGetterSetter", files: [
		"*object/accessor-name-*",
		"built-ins/Function/prototype/toString/getter-object.js",
		"built-ins/Function/prototype/toString/setter-object.js",
		"built-ins/Object/fromEntries/uses-keys-not-iterator.js",
		"built-ins/RegExp/prototype/Symbol.matchAll/isregexp-called-once.js",
		"built-ins/RegExp/prototype/Symbol.matchAll/isregexp-this-throws.js",
		"built-ins/RegExp/prototype/Symbol.matchAll/species-constructor-get-species-throws.js",
		"built-ins/String/prototype/trimEnd/this-value-object-toprimitive-meth-priority.js",
		"built-ins/String/prototype/trimEnd/this-value-object-tostring-meth-priority.js",
		"built-ins/String/prototype/trimEnd/this-value-object-valueof-meth-priority.js",
		"built-ins/String/prototype/trimStart/this-value-object-toprimitive-meth-priority.js",
		"built-ins/String/prototype/trimStart/this-value-object-tostring-meth-priority.js",
		"built-ins/String/prototype/trimStart/this-value-object-valueof-meth-priority.js",
		"language/computed-property-names/object/accessor/getter-duplicates.js",
		"language/computed-property-names/object/accessor/getter.js",
		"language/computed-property-names/object/accessor/setter-duplicates.js",
		"language/computed-property-names/object/accessor/setter.js",
		"language/expressions/object/accessor-name-literal-string-empty.js",
		"language/expressions/object/fn-name-accessor-get.js",
		"language/expressions/object/fn-name-accessor-set.js",
	]},

	// Computed accessors in classes at least throw an error on transformation
	{ level: 3, desc: "computedGetterSetterClass", files: [
		"*class/accessor-name-*",
		"built-ins/Function/prototype/toString/getter-class-expression-static.js",
		"built-ins/Function/prototype/toString/getter-class-expression.js",
		"built-ins/Function/prototype/toString/getter-class-statement-static.js",
		"built-ins/Function/prototype/toString/getter-class-statement.js",
		"built-ins/Function/prototype/toString/setter-class-expression-static.js",
		"built-ins/Function/prototype/toString/setter-class-expression.js",
		"built-ins/Function/prototype/toString/setter-class-statement-static.js",
		"built-ins/Function/prototype/toString/setter-class-statement.js",
		"built-ins/Promise/prototype/finally/species-symbol.js",
		"built-ins/Promise/prototype/finally/subclass-species-constructor-(reject|resolve)-count.js",
		"language/computed-property-names/class/accessor/getter-duplicates.js",
		"language/computed-property-names/class/accessor/getter.js",
		"language/computed-property-names/class/accessor/setter-duplicates.js",
		"language/computed-property-names/class/accessor/setter.js",
		"language/computed-property-names/class/method/constructor-can-be-(g|s)etter.js",
		"language/computed-property-names/class/static/(g|s)etter-(constructor|prototype).js",
		"language/statements/class/definition/getters-non-configurable-err.js",
		"language/statements/class/definition/fn-name-accessor-get.js",
		"language/statements/class/definition/fn-name-accessor-set.js",
		"language/statements/class/definition/numeric-property-names.js",
		"language/statements/class/definition/setters-non-configurable-err.js",
	]},

	// buble bug: get/set after computed?
	{ level: 2, desc: "getterSetterAfterComputed", files: [
		"built-ins/String/prototype/trimStart/this-value-object-tostring-call-err.js",
		"built-ins/String/prototype/trimStart/this-value-object-valueof-call-err.js",
		"built-ins/String/prototype/trimStart/this-value-object-toprimitive-call-err.js",
		"built-ins/String/prototype/trimEnd/this-value-object-tostring-call-err.js",
		"built-ins/String/prototype/trimEnd/this-value-object-valueof-call-err.js",
		"built-ins/String/prototype/trimEnd/this-value-object-toprimitive-call-err.js",
		"language/expressions/object/__proto__-permitted-dup.js",
	]},

	// buble bug: Method with symbol as key has no name
	{ level: 1, desc: "methodSymbolName", files: [
		"language/statements/class/definition/fn-name-method.js",
		"language/expressions/object/method-definition/name-name-prop-symbol.js",
		"language/expressions/object/method-definition/fn-name-fn.js",
		"language/expressions/object/fn-name-arrow.js",
		"language/expressions/object/fn-name-cover.js",
		"language/expressions/object/fn-name-fn.js",
	]},

	// buble bug: Transpiled default value function access function body's scope
	{ level: 1, desc: "defaultValueScope", files: [
		"*paramsbody-var-open.js"
	]},

	// buble bug: transpiled arrow functions have a prototype
	{ level: 1, desc: "arrowPrototype", files: [
		"language/expressions/arrow-function/prototype-rules.js",
	]},

	// buble bug: transpiled arrow functions allow new
	{ level: 1, desc: "arrowNew", files: [
		"language/expressions/arrow-function/throw-new.js",
	]},

	// buble bug: dotAll is not supported
	{ level: 2, desc: "dotAll", files: [
		"built-ins/RegExp/dotall/with-dotall-unicode.js",
		"built-ins/RegExp/dotall/with-dotall.js",
		"built-ins/RegExp/prototype/dotAll/this-val-regexp.js",
		"built-ins/RegExp/prototype/flags/this-val-regexp.js",
	]},

	// buble bug: rest and spread properties executes getters instead of copying them
	{ level: 1, desc: "restSpreadGetters", files: [
		// Object.assign
		"*spread-obj-getter-init.js",
		// rest
		"language/expressions/assignment/dstr/obj-rest-order.js",
	]},

	// buble bug: characters which are valid in template literal but not string literal need to be transpiled
	{ level: 2, desc: "templateLiteralLineContinuationAndTerminator", files: [
		"language/expressions/template-literal/tv-line-terminator-sequence.js",
	]},

	// buble bug: Does not transpile unicode escapes
	// https://github.com/Rich-Harris/buble/issues/75
	{ level: 2, desc: "unicodeEscapes", files: [
		"*escape-hex.js",
		"annexB/built-ins/escape/escape-above-astral.js",
		"built-ins/RegExp/dotall/without-dotall-unicode.js",
		"built-ins/RegExp/dotall/without-dotall.js",
		"built-ins/Function/prototype/toString/unicode.js",
	]},

	{ level: 1, desc: "taggedTemplateOperatorPrecedence", files: [
		"language/expressions/tagged-template/constructor-invocation.js"
	]},

	// buble bug: Creating a static element with a computed name `prototype` should be a runtime error
	{ level: 1, desc: "staticPrototypeElement", files: [
		"language/statements/class/static-method-non-configurable-err.js"
	]},

	// buble bug: for-of String iteration by byte
	{ level: 1, desc: "stringByte", files: [
		"language/statements/for-of/string-astral.js",
	]},

	// buble bug: allows constructors to return !== undefined
	{ level: 1, desc: "returnNotUndefined", files: [
		"built-ins/Function/internals/Construct/derived-return-val.js",
		"language/statements/class/subclass/derived-class-return-override-with-number.js",
		"language/statements/class/subclass/derived-class-return-override-with-string.js",
		"language/statements/class/subclass/derived-class-return-override-with-boolean.js",
		"language/statements/class/subclass/derived-class-return-override-with-null.js",
		"language/statements/class/subclass/derived-class-return-override-with-symbol.js",
	]},

	// buble bug: allows constructors to be called without new
	{ level: 1, desc: "noNewConstructor", files: [
		"language/statements/class/subclass/default-constructor.js",
		"language/statements/class/subclass/default-constructor-2.js",
		"language/statements/class/subclass/binding.js",
		"language/statements/class/arguments/default-constructor.js",
		"built-ins/Function/internals/Call/class-ctor.js",
	]},

	// buble bug: instantiating a class extending null should throw
	{ level: 1, desc: "extendsNull", files: [
		"language/statements/class/subclass/class-definition-null-proto-this.js"
	]},

	// buble bug: lexically scoped variables have no temporal dead zone
	{ level: 1, desc: "tdz", files: [
		"*before-initialization*", "*(init|put)-let*", "*bound-names-fordecl-tdz.js"
	]},

	// buble bug: lexically scoped destructuring declarations in for-of heads
	// s2: for ({x} of []) a.push(() => x)
	{ level: 2, desc: "lexicalDestructuringForOf", files: [
		"language/statements/for-of/scope-body-lex-boundary.js",
		"language/statements/for/scope-body-lex-boundary.js",
		"language/statements/for-in/scope-body-lex-boundary.js",
	]},

	// buble bug: lexically scoped destructuring declarations in for-of heads
	// 'var a = []; for (let [x] of []) a.push(() => x)'
	// buble bug: scope with classes
	{ level: 1, desc: "lexicalScopingWithLoopsAndClassesAndStuff", files: [
		"language/statements/for-of/dstr/array-rest-nested-array-null.js",
		"language/statements/for-of/dstr/array-rest-nested-obj-null.js",
		"language/statements/for-of/dstr/array-rest-nested-obj-undefined-hole.js",
		"language/statements/for-of/dstr/array-rest-nested-obj-undefined-own.js",
		"language/statements/for-of/dstr/array-rest-nested-obj-undefined.js",

		"language/expressions/class/scope-name-lex-open-heritage.js",
		"language/expressions/class/scope-name-lex-open-no-heritage.js",
		//"language/expressions/call/scope-lex-open.js",
		"language/statements/switch/scope-lex-open-case.js",
		"language/statements/switch/scope-lex-open-dflt.js",
		"language/statements/for-in/scope-head-lex-open.js",
		"language/statements/for-in/scope-body-lex-open.js",
		//"language/statements/for/scope-head-lex-open.js",
		"language/statements/for/scope-body-lex-open.js",
		"language/statements/class/scope-name-lex-open-heritage.js",
		"language/statements/class/scope-name-lex-open-no-heritage.js",
		//"language/statements/block/scope-lex-open.js",
		"language/statements/for-of/scope-head-lex-open.js",
		"language/statements/for-of/scope-body-lex-open.js",
		"language/statements/try/scope-catch-param-lex-open.js",
		//"language/statements/try/scope-catch-block-lex-open.js",
		//"language/expressions/class/scope-name-lex-close.js",
		//"language/expressions/call/scope-lex-close.js",
		"language/statements/switch/scope-lex-close-dflt.js",
		"language/statements/switch/scope-lex-close-case.js",
		"language/statements/for-in/scope-head-lex-close.js",
		"language/statements/for-in/scope-body-lex-close.js",
		//"language/statements/for/scope-head-lex-close.js",
		"language/statements/class/scope-name-lex-close.js",
		//"language/statements/block/scope-lex-close.js",
		"language/statements/for-of/scope-head-lex-close.js",
		"language/statements/for-of/scope-body-lex-close.js",
		//"language/statements/try/scope-catch-block-lex-close.js",
		//"language/statements/try/scope-catch-param-lex-close.js",
	]},

	// buble bug: allows classes to extend itself
	{ level: 1, desc: "superClassSelf", files: [
		"language/statements/class/name-binding/in-extends-expression-assigned.js",
		"language/statements/class/name-binding/in-extends-expression.js",
	]},

	// buble bug: allows classes to be redefined
	{ level: 1, desc: "classDeclarationConst", files: [
		"language/statements/class/name-binding/const.js"
	]},

	// buble bug: Does not invalidate earlier references to lexically-scoped bindings
	{ level: 1, desc: "invalidReferencesToLexicalBindings", files: [
		"language/module-code/instn-local-bndng-cls.js",
		"language/module-code/instn-local-bndng-let.js"
	]},

	// buble bug: complicated destructuring
	{ level: 2, desc: "complicatedDestructuring", files: [
		"language/statements/for-of/dstr/array-elem-iter-thrw-close-err.js",
		"language/statements/for-of/dstr/array-elem-iter-thrw-close.js",
		"language/statements/for-of/dstr/array-elem-trlg-iter-list-thrw-close-err.js",
		"language/statements/for-of/dstr/array-elem-trlg-iter-list-thrw-close.js",
		"language/statements/for-of/dstr/array-elem-trlg-iter-rest-thrw-close-err.js",
		"language/statements/for-of/dstr/array-elem-trlg-iter-rest-thrw-close.js",
		"language/statements/for-of/dstr/array-rest-iter-thrw-close-err.js",
		"language/statements/for-of/dstr/array-rest-iter-thrw-close.js",
		"language/statements/for-of/dstr/array-rest-lref-err.js",
		"language/statements/for-of/dstr/array-rest-nested-array-iter-thrw-close-skip.js",
	]},

	// buble bug: does not close over let in for head
	{ level: 1, desc: "letClosureForHead", files: [
		"*let-closure-inside-*"
	]},

	// buble bug: lexical declarations should shadow globals
	{ level: 1, desc: "lexicalShadowGlobals", files: [
		"language/global-code/decl-lex-configurable-global.js",
	]},

	// buble bug: does not support member or parenthesized expressions in for-of head
	{ level: 3, desc: "moreTypesForOfHead", files: [
		"language/statements/for-of/head-lhs-cover.js",
		"language/statements/for-of/head-lhs-member.js",
		"language/statements/for-of/body-put-error.js",
	]},

	{ level: 1, desc: "forOfNonArray", files: [
		"*for-of/(map|set)*"
	]},

	// 'for (let[x] of a){x()}'
	{ level: 1, desc: "destructuringLetForOfHeadNoSpace", files: [
		"language/statements/for-of/head-let-destructuring.js"
	]},

	{ level: 2, desc: "destructuringArrayElidedElements", files: [
		"*assignment/dstr/array-elision-*"
	]},

	{ level: 1, desc: "destructuringArrayElidedElements", files: [
		"*dstr/array-(elision|empty)-(iter|val-(bool|null|num|symbol|undef))*"
	]},

	{ level: 1, desc: "destructuringNullUndefined", files: [
		"language/expressions/assignment/dstr/obj-rest-val-null.js",
		"language/expressions/assignment/dstr/obj-rest-val-undefined.js",
	]},

	{ level: 2, desc: "destructuringEmptyVal", files: [
		"*assignment/dstr/(array|obj)-empty*"
	]},

	{ level: 4, desc: "generators", files: [
		"*Generator*", "*generator*", "*gen-meth-*", "*gen-func-*",
		"*gen-named-func-expr-*", "*gen-method*", "*async-gen-*",
		"*fn-name-gen.js",
		"*for-await-resolution-and-error-agen*",
		"*async-func-dstr-const-async-*",
		"*async-func-dstr-let-async-*",
		"*async-func-dstr-var-async-*",
		"*AsyncIteratorPrototype*", "*AsyncFromSyncIteratorPrototype*",
		"built-ins/Object/prototype/toString/proxy-function.js",
		'language/expressions/dynamic-import/assignment-expression/yield-(assign-expr|expr|star).js',
		"built-ins/TypedArrayConstructors/ctors/object-arg/iterating-throws.js",
		"harness/isConstructor.js",
		"language/expressions/await/for-await-of-interleaved.js",
		"language/module-code/instn-iee-bndng-gen.js",
		"language/module-code/instn-uniq-env-rec.js",
		"annexB/built-ins/RegExp/RegExp-control-escape-russian-letter.js",
		"annexB/built-ins/RegExp/RegExp-invalid-control-escape-character-class.js",
		"language/expressions/array/spread-err-mult-err-expr-throws.js",
		"language/expressions/array/spread-err-sngl-err-expr-throws.js",
		"*(ary-elision-init|ary-elision-iter|ary-empty-init|elision-exhausted|elision-step-err|ptrn-elision|dstr/(meth-|const-|let-|var-)?(static-)?(dflt-)?ary-ptrn(-rest-ary)?-empty|rest-ary-elision|rest-ary-empty|rest-id-elision-next-err|rest-id-iter-step-err).js",
		"*for*(elision|id)-iter-close.js",
		"language/statements/for/dstr/let-ary-init-iter-close.js",
		"language/statements/for/dstr/const-ary-init-iter-close.js",
		"language/statements/for-await-of/async-func-dstr-const-async-ary-init-iter-close.js",
		"language/statements/for-await-of/async-func-dstr-var-async-ary-init-iter-close.js",
		"language/statements/for-await-of/async-func-dstr-let-async-ary-init-iter-close.js",
		"language/expressions/assignment/dstr/array-elem-init-yield-expr.js",
		"language/expressions/assignment/dstr/array-elem-iter-rtrn-close-err.js",
		"language/expressions/assignment/dstr/array-elem-iter-rtrn-close-null.js",
		"language/expressions/assignment/dstr/array-elem-iter-rtrn-close.js",
		"language/expressions/assignment/dstr/array-elem-nested-array-yield-expr.js",
		"language/expressions/assignment/dstr/array-elem-nested-obj-yield-expr.js",
		"language/expressions/assignment/dstr/array-elem-target-yield-expr.js",
		"language/expressions/assignment/dstr/array-elem-trlg-iter-list-rtrn-close-null.js",
		"language/expressions/assignment/dstr/array-elem-trlg-iter-list-rtrn-close-err.js",
		"language/expressions/assignment/dstr/array-elem-trlg-iter-list-rtrn-close.js",
		"language/expressions/assignment/dstr/array-elem-trlg-iter-rest-rtrn-close-err.js",
		"language/expressions/assignment/dstr/array-elem-trlg-iter-rest-rtrn-close-null.js",
		"language/expressions/assignment/dstr/array-elem-trlg-iter-rest-rtrn-close.js",
		"language/expressions/assignment/dstr/array-iteration.js",
		"language/expressions/assignment/dstr/array-rest-iter-rtrn-close-err.js",
		"language/expressions/assignment/dstr/array-rest-iter-rtrn-close-null.js",
		"language/expressions/assignment/dstr/array-rest-iter-rtrn-close.js",
		"language/expressions/assignment/dstr/array-rest-iteration.js",
		"language/expressions/assignment/dstr/array-rest-nested-array-yield-expr.js",
		"language/expressions/assignment/dstr/array-rest-nested-obj-yield-expr.js",
		"language/expressions/assignment/dstr/array-rest-yield-expr.js",
		"language/expressions/assignment/dstr/obj-id-init-yield-expr.js",
		"language/expressions/assignment/dstr/obj-prop-elem-init-yield-expr.js",
		"language/expressions/assignment/dstr/obj-prop-elem-target-yield-expr.js",
		"language/expressions/assignment/dstr/obj-prop-nested-array-yield-expr.js",
		"language/expressions/assignment/dstr/obj-prop-nested-obj-yield-expr.js",
		"language/expressions/call/spread-err-mult-err-expr-throws.js",
		"language/expressions/call/spread-err-sngl-err-expr-throws.js",
		"language/expressions/new/spread-err-mult-err-expr-throws.js",
		"language/expressions/new/spread-err-sngl-err-expr-throws.js",
		"language/expressions/object/accessor-name-computed-yield-expr.js",
		"language/expressions/super/call-spread-err-mult-err-expr-throws.js",
		"language/expressions/super/call-spread-err-sngl-err-expr-throws.js",
		"language/expressions/yield/arguments-object-attributes.js",
		"language/expressions/yield/captured-free-vars.js",
		"language/expressions/yield/formal-parameters-after-reassignment-strict.js",
		"language/expressions/yield/formal-parameters.js",
		"language/expressions/yield/from-catch.js",
		"language/expressions/yield/from-try.js",
		"language/expressions/yield/in-rltn-expr.js",
		"language/expressions/yield/iter-value-specified.js",
		"language/expressions/yield/iter-value-unspecified.js",
		"language/expressions/yield/rhs-iter.js",
		"language/expressions/yield/rhs-omitted.js",
		"language/expressions/yield/rhs-primitive.js",
		"language/expressions/yield/rhs-regexp.js",
		"language/expressions/yield/rhs-template-middle.js",
		"language/expressions/yield/rhs-unresolvable.js",
		"language/expressions/yield/rhs-yield.js",
		"language/expressions/yield/star-array.js",
		"language/expressions/yield/star-in-rltn-expr.js",
		"language/expressions/yield/star-iterable.js",
		"language/expressions/yield/star-rhs-iter-get-call-err.js",
		"language/expressions/yield/star-rhs-iter-get-call-non-obj.js",
		"language/expressions/yield/star-rhs-iter-get-get-err.js",
		"language/expressions/yield/star-rhs-iter-nrml-next-call-err.js",
		"language/expressions/yield/star-rhs-iter-nrml-next-call-non-obj.js",
		"language/expressions/yield/star-rhs-iter-nrml-next-get-err.js",
		"language/expressions/yield/star-rhs-iter-nrml-next-invoke.js",
		"language/expressions/yield/star-rhs-iter-nrml-res-done-err.js",
		"language/expressions/yield/star-rhs-iter-nrml-res-done-no-value.js",
		"language/expressions/yield/star-rhs-iter-nrml-res-value-err.js",
		"language/expressions/yield/star-rhs-iter-nrml-res-value-final.js",
		"language/expressions/yield/star-rhs-iter-rtrn-no-rtrn.js",
		"language/expressions/yield/star-rhs-iter-rtrn-res-done-err.js",
		"language/expressions/yield/star-rhs-iter-rtrn-res-done-no-value.js",
		"language/expressions/yield/star-rhs-iter-rtrn-res-value-err.js",
		"language/expressions/yield/star-rhs-iter-rtrn-res-value-final.js",
		"language/expressions/yield/star-rhs-iter-rtrn-rtrn-call-err.js",
		"language/expressions/yield/star-rhs-iter-rtrn-rtrn-call-non-obj.js",
		"language/expressions/yield/star-rhs-iter-rtrn-rtrn-get-err.js",
		"language/expressions/yield/star-rhs-iter-rtrn-rtrn-invoke.js",
		"language/expressions/yield/star-rhs-iter-thrw-res-done-err.js",
		"language/expressions/yield/star-rhs-iter-thrw-res-done-no-value.js",
		"language/expressions/yield/star-rhs-iter-thrw-res-value-err.js",
		"language/expressions/yield/star-rhs-iter-thrw-res-value-final.js",
		"language/expressions/yield/star-rhs-iter-thrw-thrw-call-err.js",
		"language/expressions/yield/star-rhs-iter-thrw-thrw-call-non-obj.js",
		"language/expressions/yield/star-rhs-iter-thrw-thrw-get-err.js",
		"language/expressions/yield/star-rhs-iter-thrw-thrw-invoke.js",
		"language/expressions/yield/star-rhs-iter-thrw-violation-no-rtrn.js",
		"language/expressions/yield/star-rhs-iter-thrw-violation-rtrn-call-err.js",
		"language/expressions/yield/star-rhs-iter-thrw-violation-rtrn-call-non-obj.js",
		"language/expressions/yield/star-rhs-iter-thrw-violation-rtrn-get-err.js",
		"language/expressions/yield/star-rhs-iter-thrw-violation-rtrn-invoke.js",
		"language/expressions/yield/star-rhs-unresolvable.js",
		"language/expressions/yield/star-string.js",
		"language/expressions/yield/then-return.js",
		"language/expressions/yield/within-for.js",
		"language/statements/class/static-method-gen-non-configurable-err.js",
		"language/statements/for-await-of/async-func-decl-dstr-array-rest-iteration.js",
		"language/statements/for-of/break-from-catch.js",
		"language/statements/for-of/break-from-finally.js",
		"language/statements/for-of/break-from-try.js",
		"language/statements/for-of/break-label-from-catch.js",
		"language/statements/for-of/break-label-from-finally.js",
		"language/statements/for-of/break-label-from-try.js",
		"language/statements/for-of/break-label.js",
		"language/statements/for-of/break.js",
		"language/statements/for-of/continue-from-catch.js",
		"language/statements/for-of/continue-from-finally.js",
		"language/statements/for-of/continue-from-try.js",
		"language/statements/for-of/continue-label-from-catch.js",
		"language/statements/for-of/continue-label-from-finally.js",
		"language/statements/for-of/continue-label-from-try.js",
		"language/statements/for-of/continue-label.js",
		"language/statements/for-of/continue.js",
		"language/statements/for-of/dstr/array-elem-init-yield-expr.js",
		"language/statements/for-of/dstr/array-elem-iter-rtrn-close-err.js",
		"language/statements/for-of/dstr/array-elem-iter-rtrn-close-null.js",
		"language/statements/for-of/dstr/array-elem-iter-rtrn-close.js",
		"language/statements/for-of/dstr/array-elem-nested-array-yield-expr.js",
		"language/statements/for-of/dstr/array-elem-nested-obj-yield-expr.js",
		"language/statements/for-of/dstr/array-elem-target-yield-expr.js",
		"language/statements/for-of/dstr/array-elem-trlg-iter-list-rtrn-close-err.js",
		"language/statements/for-of/dstr/array-elem-trlg-iter-list-rtrn-close-null.js",
		"language/statements/for-of/dstr/array-elem-trlg-iter-list-rtrn-close.js",
		"language/statements/for-of/dstr/array-elem-trlg-iter-rest-rtrn-close-err.js",
		"language/statements/for-of/dstr/array-elem-trlg-iter-rest-rtrn-close-null.js",
		"language/statements/for-of/dstr/array-elem-trlg-iter-rest-rtrn-close.js",
		"language/statements/for-of/dstr/array-iteration.js",
		"language/statements/for-of/dstr/array-rest-iter-rtrn-close-err.js",
		"language/statements/for-of/dstr/array-rest-iter-rtrn-close-null.js",
		"language/statements/for-of/dstr/array-rest-iter-rtrn-close.js",
		"language/statements/for-of/dstr/array-rest-iteration.js",
		"language/statements/for-of/dstr/array-rest-nested-array-yield-expr.js",
		"language/statements/for-of/dstr/array-rest-nested-obj-yield-expr.js",
		"language/statements/for-of/dstr/array-rest-yield-expr.js",
		"language/statements/for-of/dstr/obj-id-init-yield-expr.js",
		"language/statements/for-of/dstr/obj-prop-elem-init-yield-expr.js",
		"language/statements/for-of/dstr/obj-prop-elem-target-yield-expr.js",
		"language/statements/for-of/dstr/obj-prop-nested-array-yield-expr.js",
		"language/statements/for-of/dstr/obj-prop-nested-obj-yield-expr.js",
		"language/statements/for-of/nested.js",
		"language/statements/for-of/return-from-catch.js",
		"language/statements/for-of/return-from-finally.js",
		"language/statements/for-of/return-from-try.js",
		"language/statements/for-of/return.js",
		"language/statements/for-of/throw-from-catch.js",
		"language/statements/for-of/throw-from-finally.js",
		"language/statements/for-of/throw.js",
		"language/statements/for-of/yield-from-catch.js",
		"language/statements/for-of/yield-from-finally.js",
		"language/statements/for-of/yield-from-try.js",
		"language/statements/for-of/yield-star-from-catch.js",
		"language/statements/for-of/yield-star-from-finally.js",
		"language/statements/for-of/yield-star-from-try.js",
		"language/statements/for-of/yield-star.js",
		"language/statements/for-of/yield.js",
		"annexB/language/expressions/yield/star-iterable-return-emulates-undefined-throws-when-called.js",
		"language/expressions/object/method-definition/gen-yield-spread-arr-multiple.js",
		"language/expressions/object/method-definition/gen-yield-spread-arr-single.js",
		"language/expressions/object/method-definition/gen-yield-spread-obj.js",
		"language/expressions/object/method-definition/yield-as-expression-with-rhs.js",
		"language/expressions/object/method-definition/yield-as-expression-without-rhs.js",
		"language/expressions/object/method-definition/yield-as-literal-property-name.js",
		"language/expressions/object/method-definition/yield-as-property-name.js",
		"language/expressions/object/method-definition/yield-as-statement.js",
		"language/expressions/object/method-definition/yield-as-yield-operand.js",
		"language/expressions/object/method-definition/yield-newline.js",
		"language/expressions/object/method-definition/yield-return.js",
		"language/expressions/object/method-definition/yield-star-before-newline.js",
		"language/statements/class/definition/fn-name-static-precedence.js",
		"language/statements/class/definition/methods-gen-*",
	]},

	{ level: 3, desc: "unicodeFeatures", files: [
		'built-ins/RegExp/property-escapes/generated/Extended_Pictographic.js',
		'built-ins/RegExp/property-escapes/generated/Script_-_Dogra.js',
		'built-ins/RegExp/property-escapes/generated/Script_-_Gunjala_Gondi.js',
		'built-ins/RegExp/property-escapes/generated/Script_-_Hanifi_Rohingya.js',
		'built-ins/RegExp/property-escapes/generated/Script_-_Makasar.js',
		'built-ins/RegExp/property-escapes/generated/Script_-_Medefaidrin.js',
		'built-ins/RegExp/property-escapes/generated/Script_-_Old_Sogdian.js',
		'built-ins/RegExp/property-escapes/generated/Script_-_Sogdian.js',
		'built-ins/RegExp/property-escapes/generated/Script_Extensions_-_Dogra.js',
		'built-ins/RegExp/property-escapes/generated/Script_Extensions_-_Gunjala_Gondi.js',
		'built-ins/RegExp/property-escapes/generated/Script_Extensions_-_Hanifi_Rohingya.js',
		'built-ins/RegExp/property-escapes/generated/Script_Extensions_-_Makasar.js',
		'built-ins/RegExp/property-escapes/generated/Script_Extensions_-_Medefaidrin.js',
		'built-ins/RegExp/property-escapes/generated/Script_Extensions_-_Old_Sogdian.js',
		'built-ins/RegExp/property-escapes/generated/Script_Extensions_-_Sogdian.js',
	]},

	{ level: 3, desc: "unsupportedFeatureExportNsAsFrom", files: [
		"language/module-code/instn-once.js",
	]},

	// buble bug: cannot transpile static method called name
	{ level: 1, desc: "staticName", files: [
		"*/(dstr/(array-elem|(|const-|dflt-|let-|meth-|meth-dflt-|meth-static-|meth-static-dflt-)(ary-ptrn-elem|obj-ptrn)-id|obj-id|obj-prop-elem|var-ary-ptrn-elem-id|var-obj-ptrn-id)-init-)?fn-name-class.js",
	]},

	{ level: 1, desc: "spreadForOfIterators", files: [
		"annexB/language/statements/for-of/iterator-close-return-emulates-undefined-throws-when-called.js",
		"language/expressions/assignment/dstr/array-rest-lref-err.js",
		"language/statements/for-of/head-expr-to-obj.js",
		"language/statements/for-of/head-expr-primitive-iterator-method.js",
		"language/statements/for-of/head-expr-obj-iterator-method.js",
		"language/statements/for-of/dstr/obj-empty-undef.js",
		"language/statements/for-of/dstr/obj-empty-null.js",
		"built-ins/ArrayIteratorPrototype/next/detach-typedarray-in-progress.js",
		"language/statements/for-of/Array.prototype.(entries|keys|Symbol.iterator).js",
		"language/statements/for-of/body-dstr-assign-error.js",
		"*call-spread-err-(mult|sngl)-err-i*",
		"*call-spread-(mult|sngl)-iter*",
		"language/statements/class/constructor-inferred-observable-iteration.js",
		"*dstr/(array|(const-|dflt-|let-|meth-|meth-dflt-|meth-static-|meth-static-dflt-|var-)?ary)-((elem-(|trlg-)|elision-|empty-|rest-(elision-)?|*-)iter-(val-err|step-err|close|get-err|(list-|rest-)?(nrml-|thrw-|)close(-err|-null|-skip|)|abpt)|rest-lref).js",
		"language/statements/for-of/generic-iterable.js",
		"language/statements/for-of/iterator-*",
		"*spread-err-(mult|sngl)-err-it*",
		"*spread-(mult|sngl)-it*",
		"language/statements/class/subclass/default-constructor-spread-override.js",
	]},

	// buble bug: emits code with invalid runtime behavior for rest properties in for-of loop heads
	// https://github.com/Rich-Harris/buble/issues/110
	{ level: 1, desc: "invalidRestPropertiesForOf", files: [
		"*/for-of/dstr/obj-rest-(c|d|e|n|o|p|s|t|v)*",
		"*/for-of/dstr/obj-rest-getter.js",
	]},

	// buble bug: subclassing of builtins does not work
	{ level: 1, desc: "subclassingBuiltins", files: [
		"built-ins/ArrayBuffer/isView/arg-is-(dataview|typedarray)-subclass-instance.js",
		"built-ins/Promise/(all|race|reject|resolve)/ctx-ctor.js",
		"built-ins/Promise/prototype/then/capability-executor-called-twice.js",
		"built-ins/Promise/prototype/then/capability-executor-not-callable.js",
		"built-ins/Promise/prototype/then/ctor-custom.js",
		"built-ins/Promise/prototype/then/deferred-is-resolved-value.js",
		"language/statements/class/subclass/builtins.js",
		"language/statements/class/subclass/builtin-objects/Array/contructor-calls-super-multiple-arguments.js",
		"language/statements/class/subclass/builtin-objects/Array/contructor-calls-super-single-argument.js",
		"language/statements/class/subclass/builtin-objects/Array/length.js",
		"language/statements/class/subclass/builtin-objects/(Array(Buffer)?|Boolean|DataView|Date|Error|Function|Map|Number|Promise|RegExp|Set|String|TypedArray|WeakMap|WeakSet)/(regular-subclassing|super-must-be-called).js",
		"language/statements/class/subclass/builtin-objects/Error/message-property-assignment.js",
		"language/statements/class/subclass/builtin-objects/Function/instance-length.js",
		"language/statements/class/subclass/builtin-objects/Function/instance-name.js",
		"language/statements/class/subclass/builtin-objects/NativeError/*Error-(message|super).js",
		"language/statements/class/subclass/builtin-objects/Object/constructor-return-undefined-throws.js",
		"language/statements/class/subclass/builtin-objects/Object/constructor-returns-non-object.js",
		"language/statements/class/subclass/builtin-objects/RegExp/lastIndex.js",
		"language/statements/class/subclass/builtin-objects/String/length.js",
		"language/statements/class/subclass/builtin-objects/Symbol/new-symbol-with-super-throws.js",
		"built-ins/Promise/prototype/finally/species-constructor.js",
		"built-ins/Promise/prototype/finally/subclass-reject-count.js",
		"built-ins/Promise/prototype/finally/subclass-resolve-count.js",
	]},

	{ level: 4, desc: "modules", files: [
		"language/expressions/dynamic-import/imported-self-update.js",
		"language/expressions/dynamic-import/reuse-namespace-object-from-import.js",
		"*/eval-export-*",
		"*/eval-gtbndng-indirect-*",
		"*/instn-iee-bndng-(cls|const|fun|let|var).js",
		"*/instn-iee-err-*",
		"*/instn-local-bndng-export-*",
		"*/instn-named-*",
		"*/instn-resolve-*",
		"*/instn-star-*",
		"language/module-code/namespace/*",
		"language/module-code/eval-rqstd-*",
		"language/module-code/eval-self-once.js",
		"language/module-code/instn-local-bndng-gen.js",
		"language/module-code/instn-iee-iee-cycle.js",
		"language/module-code/instn-iee-star-cycle.js",
		"language/module-code/instn-iee-trlng-comma.js",
		"language/module-code/instn-same-global.js",
		"language/module-code/parse-export-empty.js",
	]},

	{ level: 4, desc: "sticky", files: [
		"*/y-*", "*-y-*",
		"built-ins/RegExp/prototype/(flags/coercion-sticky.js|sticky/*)",
		"built-ins/RegExp/prototype/Symbol.match/builtin-coerce-lastindex.js",
		"built-ins/RegExp/prototype/Symbol.split/coerce-flags.js",
		"built-ins/RegExp/prototype/Symbol.split/species-ctor-y.js",
		"built-ins/RegExp/prototype/Symbol.split/species-ctor.js",
		'built-ins/RegExp/prototype/dotAll/this-val-regexp.js',
		'built-ins/RegExp/prototype/flags/this-val-regexp.js',
	]},

	// Contrary to what I argued in https://github.com/Rich-Harris/buble/pull/67
	// and what V8 does, the template cache is keyed based on node, not content.
	{ level: 1, desc: "taggedTemplateRegistry", files: [
		"language/expressions/tagged-template/cache-(differing-expressions|identical-source).js",
		"language/expressions/tagged-template/template-object-template-map.js",
	]},

	{ level: 2, desc: "codePointEscapes", files: [
		"built-ins/RegExp/property-escapes/character-class.js",
	]},
].map(i => ({ config: i.config, desc: i.desc, level: i.level, pattern: mapFilePatterns(i.files) }));

exports.skip_list = [
	// FIXME: Do we skip these (instead of expect fail) because they work in some nodejs versions?
	{ desc: "matchAll", files: [
		"built-ins/RegExpStringIteratorPrototype/*",
		"built-ins/RegExp/prototype/Symbol.matchAll/*",
		"built-ins/String/prototype/matchAll/*"
	] },
	{ desc: "dotall", files: [
		"annexB/built-ins/RegExp/prototype/flags/order-after-compile.js",
		"built-ins/RegExp/prototype/flags/rethrow.js",
		"built-ins/RegExp/prototype/flags/get-order.js",
	]},

	// Runtime behaviour
	{ desc: 'runtimeRegexp', files: [
		'built-ins/RegExp/duplicate-flags.js',
	] },
	{ desc: "tco", files: [ "language/(expressions/tagged-template|statements/for)/tco-*" ] },
	{ desc: "runtimeBigInt", files: [
		"built-ins/BigInt/asIntN/bigint-tobigint-errors.js",
		"built-ins/BigInt/asUintN/bigint-tobigint-errors.js",
		"built-ins/DataView/prototype/(g|s)etBig(Ui|I)nt64/*",
		"built-ins/JSON/stringify/bigint-cross-realm.js",
		"built-ins/Object/prototype/toString/symbol-*-bigint.js",
		"built-ins/TypedArrayConstructors/ctors-bigint/*",
		"built-ins/TypedArrayConstructors/from/BigInt/*",
	] },
	{ desc: "runtimeRegexpNamedGroups", files: [
		"built-ins/RegExp/named-groups/(f|groups-object-(undefined|subclass(-sans)?)|string-replace-(e|g|m|n|u)|unicode-match)*",
	]},
	{ desc: "trim", files: [ "built-ins/String/prototype/trim(End|Start)/*" ] },
	{ desc: "Symbol.prototype.description", files: [ "built-ins/Symbol/prototype/description/*" ] },
	// Not available in Node 4
	{ desc: "Symbol.match", files: [ "built-ins/RegExp/prototype/Symbol.match/*" ] },
	{ desc: "Symbol.replace", files: [ "built-ins/RegExp/prototype/Symbol.replace/*" ] },
	{ desc: "Symbol.search", files: [ "built-ins/RegExp/prototype/Symbol.search/*" ] },
	{ desc: "Symbol.split", files: [ "built-ins/RegExp/prototype/Symbol.split/*" ] },

	// Don't know how to detach an ArrayBuffer in node 4
	{ desc: "detach", files: [
		"built-ins/TypedArray/prototype/sort/sort-tonumber.js",
		"built-ins/TypedArrayConstructors/ctors/buffer-arg/byteoffset-to-number-detachbuffer.js",
		"built-ins/TypedArrayConstructors/ctors/buffer-arg/detachedbuffer.js",
		"built-ins/TypedArrayConstructors/ctors/buffer-arg/length-to-number-detachbuffer.js",
	] },

	// Non-syntax
	{ desc: "intl402", files: [ "intl402/*" ] },
	{ desc: "Atomics", files: [ "built-ins/Atomics/*" ] },
	{ desc: "Object.fromEntries", files: [ "built-ins/Object/fromEntries/*" ] },
	{ desc: "Object.keys", files: [ "built-ins/Object/keys/property-traps-order-with-proxied-array.js" ] },
	{ desc: "Array.prototype.flat(Map)", files: [ "built-ins/Array/prototype/flat*" ] },
	{ desc: "SharedArrayBuffer", files: [
		"built-ins/DataView/custom-proto-access-throws-sab.js",
		"built-ins/TypedArrayConstructors/ctors/buffer-arg/custom-proto-access-throws-sab.js",
		"built-ins/TypedArrayConstructors/ctors/buffer-arg/length-access-throws-sab.js",
	]},
	{ desc: "Object.values", files: [ "built-ins/JSON/stringify/string-escape-ascii.js", "built-ins/Object/values/*" ]},
	{ desc: "Object.entries", files: [ "built-ins/Object/entries/*" ]},
	{ desc: "Proxy", files: [
		"built-ins/Object/keys/proxy-keys.js",
		"built-ins/Proxy/enumerate/removed-does-not-trigger.js",
		"built-ins/Proxy/get/trap-is-undefined-receiver.js",
		"built-ins/Proxy/set/trap-is-undefined-receiver.js",
		"built-ins/Array/prototype/slice/length-exceeding-integer-limit-proxied-array.js:",
	]},
	{ desc: "Symbol.species", files: [
		"built-ins/Symbol/species/subclassing.js",
		"built-ins/TypedArrayConstructors/ctors/typedarray-arg/same-ctor-buffer-ctor-species-not-ctor.js",
		"built-ins/TypedArrayConstructors/ctors/typedarray-arg/same-ctor-buffer-ctor-species-prototype-throws.js",
		"built-ins/TypedArrayConstructors/ctors/typedarray-arg/same-ctor-buffer-ctor-species-throws.js",
	] },
	{ desc: "Reflect", files: [
		"built-ins/DataView/custom-proto-access-detaches-buffer.js",
		"built-ins/DataView/custom-proto-access-throws.js",
		"language/expressions/super/realm.js",
		"built-ins/TypedArrayConstructors/ctors/*/custom-proto-access-throws.js",
		"built-ins/RegExp/CharacterClassEscapes/character-class-digit-class-escape-flags-u.js",
		"built-ins/RegExp/CharacterClassEscapes/character-class-digit-class-escape-plus-quantifier-flags-u.js",
		"built-ins/RegExp/CharacterClassEscapes/character-class-digit-class-escape-plus-quantifier.js",
		"built-ins/RegExp/CharacterClassEscapes/character-class-digit-class-escape.js",
		"built-ins/RegExp/CharacterClassEscapes/character-class-non-digit-class-escape-flags-u.js",
		"built-ins/RegExp/CharacterClassEscapes/character-class-non-digit-class-escape-plus-quantifier-flags-u.js",
		"built-ins/RegExp/CharacterClassEscapes/character-class-non-digit-class-escape-plus-quantifier.js",
		"built-ins/RegExp/CharacterClassEscapes/character-class-non-digit-class-escape.js",
		"built-ins/RegExp/CharacterClassEscapes/character-class-non-whitespace-class-escape-flags-u.js",
		"built-ins/RegExp/CharacterClassEscapes/character-class-non-whitespace-class-escape-plus-quantifier-flags-u.js",
		"built-ins/RegExp/CharacterClassEscapes/character-class-non-whitespace-class-escape-plus-quantifier.js",
		"built-ins/RegExp/CharacterClassEscapes/character-class-non-whitespace-class-escape.js",
		"built-ins/RegExp/CharacterClassEscapes/character-class-non-word-class-escape-flags-u.js",
		"built-ins/RegExp/CharacterClassEscapes/character-class-non-word-class-escape-plus-quantifier-flags-u.js",
		"built-ins/RegExp/CharacterClassEscapes/character-class-non-word-class-escape-plus-quantifier.js",
		"built-ins/RegExp/CharacterClassEscapes/character-class-non-word-class-escape.js",
		"built-ins/RegExp/CharacterClassEscapes/character-class-whitespace-class-escape-flags-u.js",
		"built-ins/RegExp/CharacterClassEscapes/character-class-whitespace-class-escape-plus-quantifier-flags-u.js",
		"built-ins/RegExp/CharacterClassEscapes/character-class-whitespace-class-escape-plus-quantifier.js",
		"built-ins/RegExp/CharacterClassEscapes/character-class-whitespace-class-escape.js",
		"built-ins/RegExp/CharacterClassEscapes/character-class-word-class-escape-flags-u.js",
		"built-ins/RegExp/CharacterClassEscapes/character-class-word-class-escape-plus-quantifier-flags-u.js",
		"built-ins/RegExp/CharacterClassEscapes/character-class-word-class-escape-plus-quantifier.js",
		"built-ins/RegExp/CharacterClassEscapes/character-class-word-class-escape.js",
		"built-ins/RegExp/property-escapes/generated/*",
	] },
	{ desc: "Symbol.toPrimitive", files: [
		"language/expressions/equals/to-prim-hint.js",
		"built-ins/Date/prototype/Symbol.toPrimitive/*",
		"built-ins/String/prototype/indexOf/position-tointeger-errors.js",
		"built-ins/String/prototype/indexOf/position-tointeger-toprimitive.js",
		"built-ins/String/prototype/indexOf/position-tointeger-wrapped-values.js",
		"built-ins/String/prototype/indexOf/searchstring-tostring-errors.js",
		"built-ins/String/prototype/indexOf/searchstring-tostring-toprimitive.js",
		"built-ins/String/prototype/indexOf/searchstring-tostring-wrapped-values.js",
	] },
	{ desc: "Symbol.hasInstance", files: [ "built-ins/Function/prototype/Symbol.hasInstance/this-val-poisoned-prototype.js" ] },
	{ desc: "Array.prototype.includes", files: [ "built-ins/Function/prototype/toString/built-in-function-object.js" ] },
	{ desc: "regexpucoreIssue?", files: [
		// This produces an S1 on Node < 8, but passes on Node >= 8
		"built-ins/RegExp/property-escapes/generated/Assigned.js",
	] },

	{ desc: "nodeBug_asyncEscapedLineTerminator", files: [ "language/expressions/async-arrow-function/escaped-async-line-terminator.js" ] },
	{ desc: "nodeBug_keyOrder", files: [ "built-ins/Reflect/ownKeys/return-on-corresponding-order-large-index.js" ] },
	{ desc: "nodeBug", files: [
		"built-ins/Array/prototype/reverse/length-exceeding-integer-limit-with-proxy.js",
		"built-ins/Array/prototype/sort/comparefn-nonfunction-call-throws.js",
		"built-ins/Array/prototype/splice/create-species-length-exceeding-integer-limit.js",
		"built-ins/Array/prototype/splice/property-traps-order-with-species.js",
		"built-ins/Array/prototype/splice/throws-if-integer-limit-exceeded.js",
		"built-ins/Array/prototype/unshift/throws-if-integer-limit-exceeded.js",
		"built-ins/Function/prototype/toString/function-expression.js",
		"built-ins/Function/prototype/toString/proxy-bound-function.js",
		"built-ins/Function/prototype/toString/proxy-function-expression.js",
		"built-ins/Function/prototype/toString/proxy-arrow-function.js",
		"built-ins/Function/prototype/toString/proxy-class.js",
		"built-ins/Function/prototype/toString/proxy-method-definition.js",
		"built-ins/Promise/prototype/finally/this-value-non-promise.js",
		"language/expressions/assignment/destructuring/iterator-destructuring-property-reference-target-evaluation-order.js",
		"language/expressions/assignment/destructuring/keyed-destructuring-property-reference-target-evaluation-order.js",
		"language/statements/class/subclass/builtin-objects/Proxy/no-prototype-throws.js",
		"built-ins/TypedArray/prototype/fill/fill-values-conversion-once.js",
		"built-ins/TypedArrayConstructors/from/set-value-abrupt-completion.js",
		"built-ins/RegExp/prototype/Symbol.split/str-result-get-length-err.js",
		"built-ins/Date/prototype/toDateString/format.js",
		"built-ins/Date/prototype/toString/format.js",
		"built-ins/Date/prototype/toUTCString/format.js",
		"built-ins/Function/prototype/toString/well-known-intrinsic-object-functions.js",
		"built-ins/Number/prototype/toExponential/range.js",
		"built-ins/Number/prototype/toFixed/range.js",
		"built-ins/Number/prototype/toPrecision/range.js",
		"built-ins/RegExp/prototype/Symbol.match/g-match-empty-set-lastindex-err.js",
		"built-ins/RegExp/prototype/Symbol.search/lastindex-no-restore.js",
		"built-ins/RegExp/prototype/Symbol.search/set-lastindex-init-err.js",
		"built-ins/RegExp/prototype/Symbol.search/set-lastindex-restore-err.js",
		"built-ins/RegExp/prototype/Symbol.split/str-coerce-lastindex.js",
		"language/expressions/arrow-function/strict.js",
		"language/expressions/async-arrow-function/try-return-finally-throw.js",
		"language/expressions/async-arrow-function/try-throw-finally-throw.js",
		"built-ins/Date/prototype/toString/non-date-receiver.js",
		"built-ins/Promise/prototype/then/context-check-on-entry.js",
		"built-ins/TypedArrayConstructors/ctors/typedarray-arg/other-ctor-buffer-ctor-access-throws.js",
	] },
	{ desc: "node4Bug_arrayLength", files: [ "built-ins/Array/prototype/*integer-limit*" ] },

	{ desc: "node4Bug_anonFunctionName", files: [ "*fn-name-(arrow|cover|fn).js" ] },

	// Node < 11
	{ desc: "nodeBug_unstableSort", files: [ "built-ins/Array/prototype/sort/stability-(11|513|2048)*" ] },
].map(i => ({ desc: i.desc, pattern: mapFilePatterns(i.files) }));
