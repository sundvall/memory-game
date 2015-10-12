/*global KF04RZ211, require, module*/
/*jslint browser: true, devel:true */

/*

	create 

	usage: 
	object-argument:
	window.CORE.control.create( {
		type: 'div',
		class: 'an_example other_class',
		id: null,
		other: 'other_attribute',
		other2: 'yet_other'
	});
	
	list-argument:
	window.CORE.control.create('div','some classes','some_id')

	return:
	a dom node with attributes
*/

module.exports = (function () {
	"use strict";
	var node,
		createNode = function (type) {
			return document.createElement(type);
		},
		addProperties = function (p, classname, id) {
			if (typeof p === 'object') {
				Object.keys(p).forEach(function (key) {
					if (key !== 'type') {
						node.setAttribute(key, p[key]);
					}
				});
			} else {
				if (classname) {
					node.setAttribute('class', classname);
				}
				if (id) {
					node.setAttribute('id', id);
				}
			}
		};

	return {
		basicElement: function (p, classname, id) {
			var type = (p.type || p);
			node = createNode(type);
			addProperties(p, classname, id);
			return node;
		}
	};
}());
