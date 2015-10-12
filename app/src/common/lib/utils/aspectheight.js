/*global KF04RZ211, require, module*/
/*jslint browser: true, devel:true */

/*

	aspectheight 

	usage: 
	
	the height is calculated to preserve the aspect ratio from a provided image or given value

	return:
	height 
*/

module.exports = (function () {
	"use strict";
	var refSize = {
		'w': 160,
		'h': 90
	},
		MATHROUND = Math.round,
		heightFromAspectRatio = function (w, refW, refH) {
			var rw = (refW || refSize.w),
				rh = (refH || refSize.h);
			return MATHROUND((rh / rw) * w);
		};

	return {
		refSize: function () {
			return refSize;
		},
		scaledHeight: function (w, refH, refW) {
			/*optional refH, refW - If not provided the preset format is used*/
			refSize.w = (refW || refSize.w);
			refSize.h = (refH || refSize.h);
			return heightFromAspectRatio(w, refW, refH);
		}

	};
}());
