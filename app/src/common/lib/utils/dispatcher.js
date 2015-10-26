/*global KF04RZ211, require, module*/
/*jslint browser: true, devel:true, nomen:true */

/*  
	dispatcher

	usage: 
	
	
	
*/

module.exports = (function () {
	"use strict";
	
	var callback = [];

	return {
		register: function (cb) {
			callback.push(cb);
			return callback.length;
		},
		unregister: function (index) {
			delete callback[index];
		},
		dispatch: function (payload) {
			callback.forEach(function (cb) {
				cb(payload);
			});
		}
	};
}());