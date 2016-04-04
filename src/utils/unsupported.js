export default function unsupported ( node, description ) {
	// TODO show offending snippet
	throw new Error( `${description} are not supported. See TK for more information` );
}
