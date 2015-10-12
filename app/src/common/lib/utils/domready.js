/*global KF04RZ211, require, module, mraid*/
/*jslint browser: true, devel:true, nomen:true */

/*
	usage: 
	domready(app_init);
	
	The 'app_init' will execute when dom state is 'interactive' or 'complete'.
	if mraid is enabled the initial load has to be done after readyState is ok.
	If the mraid configuration does not dispatch 'loading' the 'isViewable' check is used as fallback.
	
*/

module.exports = (function () {
	"use strict";
	var applyWhenDomIsReady = function (func) {

		(function pollCheck() {
			var state = document.readyState;
			if (state === 'interactive' || state === 'complete') {
				func();
			} else {
				setTimeout(pollCheck, 400);
			}
		}());
	};

	return {
		run: function (func) {
			if (typeof func === 'function') {
				applyWhenDomIsReady(func);
			} else {
				console.error('domready: argument must be a function:' + func);
			}
		}
	};
}());
