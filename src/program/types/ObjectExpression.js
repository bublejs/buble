import Node from '../Node.js';
import CompileError from '../../utils/CompileError.js';

export default class ObjectExpression extends Node {
	transpile(code, transforms) {
		super.transpile(code, transforms);

		// The output of this transpilation takes one of three forms:
		//
		//  * An object expression
		//
		//  * A call to objectAssign which contains exactly one object expression
		//    as the initial argument, followed by one or more additional arguments
		//
		//  * A sequence of assignments, either as statements or a comma-joined
		//    expression, where a variable is initialized with one of the two
		//    previous forms and then mutated with property assignments and/or
		//    calls to objectAssign
		//
		// (Note that regardless of the specifics of the form, exactly one object
		// expression will be produced (not counting object expressions that
		// started out as children of this one). This is in contrast to an earlier
		// version of this function, which could produce output containing multiple
		// object expressions, such as `Object.assign({a: 1}, b, {c: 2})`.)
		//
		// To generate this output, the below loop transitions between three
		// states: an INITIAL state where simple properties are permitted to remain
		// in the original object expression as-is, a SPREAD state where
		// consecutive spread properties are appended to an objectAssign call, and
		// an ASSIGNMENTS state where properties of any non-spread type are
		// assigned to an object initialized by the previous states.
		//
		// Leaving the INITIAL state causes the closing `}` to be moved forward to
		// the current position, forming the (possibly empty) initial object
		// expression for whichever form is indicated by the new state. If INITIAL
		// transitions into SPREAD, a call to objectAssign is prepended to the
		// entire result fragment. The first time either INITIAL or SPREAD
		// transitions into ASSIGNMENTS, an `( obj = ` wrapper is prepended to the
		// entire result fragment. Transitioning from ASSIGNMENTS into SPREAD
		// starts an objectAssign call at the current position in the code, instead
		// of prepending it to the entire result. Transitioning from SPREAD to
		// ASSIGNMENTS closes the current objectAssign call, whether it was created
		// by a transition from INITIAL or from ASSIGNMENTS. Transititioning into
		// INITIAL is not possible.
		//
		// At the end of the loop, there will be at most one objectAssign call
		// open, and at most one `( obj = ` wrapper open, both of which will be
		// closed in that order.

		const STATE_INITIAL = 0, STATE_SPREAD = 1, STATE_ASSIGNMENTS = 2;
		let state = STATE_INITIAL;

		let hasAssignments = false;
		let assignmentSeparator;
		let isSimpleAssignment;
		let name;

		for (let i = 0; i < this.properties.length; ++i) {
			const prop = this.properties[i];
			const moveStart = i > 0 ? this.properties[i - 1].end : this.start + 1;
			const prevState = state;

			if (
				prevState === STATE_SPREAD ||
				prevState === STATE_INITIAL && prop.computed && transforms.computedProperty
			) {
				if (!hasAssignments) {
					hasAssignments = true;
					if (
						this.parent.type === 'VariableDeclarator' &&
						this.parent.parent.declarations.length === 1 &&
						this.parent.id.type === 'Identifier'
					) {
						isSimpleAssignment = true;
						name = this.parent.id.alias || this.parent.id.name; // TODO is this right?
					} else if (
						this.parent.type === 'AssignmentExpression' &&
						this.parent.parent.type === 'ExpressionStatement' &&
						this.parent.left.type === 'Identifier'
					) {
						isSimpleAssignment = true;
						name = this.parent.left.alias || this.parent.left.name; // TODO is this right?
					} else if (
						this.parent.type === 'AssignmentPattern' &&
						this.parent.left.type === 'Identifier'
					) {
						isSimpleAssignment = true;
						name = this.parent.left.alias || this.parent.left.name; // TODO is this right?
					}

					if (isSimpleAssignment) {
						// handle block scoping
						name = this.findScope(false).resolveName(name);

						assignmentSeparator = `;\n${this.getIndentation()}`;
					} else {
						name = this.findScope(true).createDeclaration('obj');

						assignmentSeparator = ', ';

						// Close `( obj = ...` expression
						code.prependRight(this.start, `( ${name} = `);
					}
				}

				state = STATE_ASSIGNMENTS;
			}


			if (prevState === STATE_SPREAD && state !== STATE_SPREAD) {
				// Close objectAssign call
				code.appendLeft(moveStart, ')');
			} else if (prevState === STATE_INITIAL && state !== STATE_INITIAL) {
				// Close the initial object literal by moving the end brace forward

				const lastPropertyEnd = this.properties[this.properties.length - 1].end;
				let beginEnd = i > 0 ? lastPropertyEnd : this.end - 1;

				// Trim trailing comma because it can easily become a leading comma which is illegal
				if (code.original[beginEnd] == ',') ++beginEnd;
				const closing = code.slice(beginEnd, this.end);
				code.prependLeft(moveStart, closing);
				code.remove(lastPropertyEnd, this.end);
			}

			if (
				state === STATE_SPREAD && i === 0 || // Remove initial whitespace if object is empty
				state === STATE_ASSIGNMENTS ||       // Remove property separators
				prevState === STATE_ASSIGNMENTS      // (to be replaced immediately below with normalized ones)
			) {
				code.remove(moveStart, prop.start);
			}

			if (state === STATE_ASSIGNMENTS || prevState === STATE_ASSIGNMENTS) {
				code.appendLeft(prop.start, assignmentSeparator);
			}

			if (state === STATE_SPREAD) {
				// Open objectAssign call
				if (prevState === STATE_INITIAL) {
					code.prependRight(this.start, `${this.program.options.objectAssign}(`);
					// For spreads that begin after a non-zero number of regular
					// properties, we can reuse the separator that immediately precedes
					// the spread. But if the spread is the first thing in the object, an
					// argument separator must be synthesized.
					if (i === 0) {
						code.appendRight(prop.argument.start, ', ');
					}
				} else if (prevState === STATE_ASSIGNMENTS) {
					code.appendRight(prop.argument.start, `${this.program.options.objectAssign}(${name}, `);
				}

				// Remove ellipsis on spread property
				code.remove(prop.start, prop.argument.start);

			} else if (state === STATE_ASSIGNMENTS) {
				code.appendLeft(prop.start, prop.key.type === 'Literal' || prop.computed ? name : `${name}.`);

				let c = prop.key.end;
				if (prop.computed) {
					while (code.original[c] !== ']') c += 1;
					c += 1;
				}
				if (prop.key.type === 'Literal' && !prop.computed) {
					code.overwrite(
						prop.start,
						prop.value.start,
						'[' + code.slice(prop.start, prop.key.end) + '] = '
					);
				} else if (prop.shorthand || (prop.method && !prop.computed && transforms.conciseMethodProperty)) {
					// Replace : with = if Property::transpile inserted the :
					code.overwrite(
						prop.key.start,
						prop.key.end,
						code.slice(prop.key.start, prop.key.end).replace(/:/, ' =')
					);
				} else {
					if (prop.value.start > c) code.remove(c, prop.value.start);
					code.prependLeft(c, ' = ');
				}

				// This duplicates behavior from Property::transpile which is disabled
				// for computed properties or if conciseMethodProperty is false
				if (prop.method && (prop.computed || !transforms.conciseMethodProperty)) {
					if (prop.value.generator) code.remove(prop.start, prop.key.start);
					code.prependRight(prop.value.start, `function${prop.value.generator ? '*' : ''} `);
				}
			}
		}

		if (state === STATE_SPREAD) {
			// Close objectAssign call
			code.appendLeft(this.end, ')');
		}

		if (hasAssignments && !isSimpleAssignment) {
			// If the last expression was an objectAssign call, we can do nothing and
			// use its return value; but otherwise, append the working object.
			if (state !== STATE_SPREAD) {
				code.appendLeft(this.end, `, ${name}`);
			}
			// Close `( obj = ...` expression
			code.appendLeft(this.end, ' )');
		}
	}
}

function safeToInline(obj) {
	for (let i = 0; i < obj.properties.length; i++) {
		if (obj.properties[i].kind !== 'init') {
			return false;
		}
	}
	return true;
}
