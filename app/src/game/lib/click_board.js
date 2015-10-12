/*global require, module, Node*/
/*jslint browser: true, devel:true*/

/*
	usage: 

	return:

*/

module.exports = (function () {
	"use strict";

	var core = window.DOMCTRL,
		dataflow = window.DATAFLOW,
		actions = require('./actions'),
		clickListenerHandler = function (e) {
			var cb = function (p) {
				p.e.stopPropagation();
				var elm = p.elm,
					row = elm.getAttribute('row'),
					col = elm.getAttribute('col');
				actions.clickboard(row,col);
			};
			//If the last argument is set to 'true', the handler function runs the callback if the .fkn_filter element or any of its children (#content_A,#content_B,#inner_content) is clicked
			core.handle(e, '.board_item', cb, true);
		},
		addListener = function (parent) {

			core.addListener(parent, 'click', clickListenerHandler);
		};

	return {
		init: function (board) {
			if (board.nodeType === Node.ELEMENT_NODE) {
				addListener(board);
			} else {
				console.error('click_board:init: call with an element: ' + board);
			}
		}
	};

}());
