export default function unsupported ( node, description ) {
	// TODO show offending snippet
	throw new Error( `${description}. See TK for more information` );
}
