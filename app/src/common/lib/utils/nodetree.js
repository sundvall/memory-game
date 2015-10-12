/*global require, module*/
/*jslint browser: true, devel:true, nomen:true */



/*
	usage: 
	array-argument:
	window.CORE.nodetree.fragment([nodeA,nodeB,...,nodeN])

	or 
	window.CORE.nodetree.fragment(nodeA]);

	or 
	window.CORE.nodetree.fragment();

	return:
	a document-fragment
*/

module.exports = (function () {
	"use strict";
	var isArray = function (o) {
		return Object.prototype.toString.call(o) === '[object Array]';
	},
		createTree = function (nodes) {
			var docf = document.createDocumentFragment();
			try {
				if (nodes && isArray(nodes)) {
					nodes.forEach(function (elm) {
						docf.appendChild(elm);
					});
				} else if (nodes) {
					docf.appendChild(nodes);
				}
			} catch (e) {
				console.log(e);
			}
			return docf;
		};

	/*api*/
	return {
		fragment: function (nodes) {
			if (arguments.length > 1) {
				console.warn('nodetree: arguments must be sent as an array or only the first argument will be used');
			}
			return createTree(nodes);
		}
	};

}());
