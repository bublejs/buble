export default function extractNames(node) {
	const names = [];
	extractors[node.type](names, node);
	return names;
}

const extractors = {
	Identifier(names, node) {
		names.push(node);
	},
};
