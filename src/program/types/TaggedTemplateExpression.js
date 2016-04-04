import Node from '../Node.js';
import unsupported from '../../utils/unsupported.js';

export default class TaggedTemplateExpression extends Node {
	initialise () {
		unsupported( this, 'Tagged template expressions' );
	}
}
