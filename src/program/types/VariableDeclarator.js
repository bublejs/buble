import Node from '../Node.js';
import CompileError from '../../utils/CompileError.js';

export default class VariableDeclarator extends Node {
	initialise ( transforms ) {
		let kind = this.parent.kind;
		if ( kind === 'let' && this.parent.parent.type === 'ForStatement' ) {
			kind = 'for.let'; // special case...
		}

		this.parent.scope.addDeclaration( this.id, kind );
		super.initialise( transforms );
	}

	transpile ( code, transforms ) {
		if ( !this.init && transforms.letConst && this.parent.kind !== 'var' ) {
			let inLoop = this.findNearest( /Function|^ForStatement|^(?:Do)?WhileStatement/ );
			if ( inLoop && ! /Function/.test( inLoop.type ) ) {
				code.insertLeft( this.id.end, ' = void 0' );
			}
		}

		if ( this.init ) this.init.transpile( code, transforms );
	}
}
