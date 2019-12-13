module.exports = [
	{
		description: 'transpiles for statement without init and update',
		input: `
		for (;idx < sw.tabs.length;) {
			let t = sw.tabs[idx];
			if (!newTabs.find(nt => nt._id === t._id)) {
				updateWindowFromBg({action: 'tabRemoved', tid: t._id, wid: sw._id, id: ++eventId});
			} else {
				idx++;
			}
		}`,
		output: `
		var loop = function (  ) {
			var t = sw.tabs[idx];
			if (!newTabs.find(function (nt) { return nt._id === t._id; })) {
				updateWindowFromBg({action: 'tabRemoved', tid: t._id, wid: sw._id, id: ++eventId});
			} else {
				idx++;
			}
		};

		for (;idx < sw.tabs.length;) loop(  );`
	},

	{
		description: 'for in with member expression',
		input: `
			for (a[0] in a) {
			}
		`,
		output: `
			for (a[0] in a) {
			}
		`
	}
];
