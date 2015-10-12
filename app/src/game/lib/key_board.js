/*global require, module, Node*/
/*jslint browser: true, devel:true*/

/*
	usage: 

	return:

	TODO move to common-library

*/

module.exports = (function () {
	"use strict";

	var dataflow = window.DATAFLOW,
		actions = require('./actions'),
		// dispatch = dataflow.dispatch,
		// register = dataflow.register,
		constants = dataflow.constants(),
		// returnCallbacks = [],
		// core = window.DOMCTRL,
		cDown = 40,
		cEscape = 27,
		cReturn = 13,
		cUp = 38,
		cLeft = 37,
		cRight = 39,
		cTab = 9,
		cSpace = 32,
		codes = [{
			'val': cDown,
			'name': constants.KEY_DOWN
		}, {
			'val': cEscape,
			'name': constants.KEY_ESC
		}, {
			'val': cUp,
			'name': constants.KEY_UP
		}, {
			'val': cLeft,
			'name': constants.KEY_LEFT
		}, {
			'val': cRight,
			'name': constants.KEY_RIGHT
		}, {
			'val': cReturn,
			'name': constants.KEY_RETURN
		}, {
			'val': cTab,
			'name': constants.KEY_TAB
		}, {
			'val': cSpace,
			'name': constants.KEY_SPACE
		}],
		keyHandler = function (e) {
			var code = (e.keyCode || e.which);
			codes.forEach(function (keyb) {
				if (code === keyb.val) {
					if (code !== cTab || code !== cSpace) {
						e.preventDefault();
					}
					actions.keystroke(keyb.name);
				}
			});
		},
		addListener = function () {
			window.addEventListener('keydown', keyHandler);
		};

	return {
		init: function () {
			addListener();
		},
		onreturn: function (elm, cb) {
			elm.addEventListener('keydown', function (e) {
				console.log('key_board:onretrurn:run handler');
				var code = (e.keyCode || e.which);
				if (code === cReturn) {
					console.log('key_board:run callback');
					cb();
				}
			});
		}
	};

}());
