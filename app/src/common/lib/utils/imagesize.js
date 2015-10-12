/*global KF04RZ211, require, module*/
/*jslint browser: true, devel:true */

/*

	imagesize 

	usage: 
	
	the height is calculated to preserve the aspect ratio from a provided image or given value

	return:
	height 
*/

module.exports = (function () {
	"use strict";
	var sizeFromImage = function (src, cb) {
		var img = new Image(),
			size = {};
		img.onload = function () {
			size.w = this.width;
			size.h = this.height;
			cb(this.height, this.width);
		};
		img.onerror = function () {
			console.warn('aspectheight:onerror:can not use image:' + src);
			cb();
		};
		img.src = src;
		return size;
	};

	return {
		onsize: function (src, cb) {
			return sizeFromImage(src, cb);
		}
	};
}());
