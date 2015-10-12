/*global KF04RZ211, AdssSentEvent, KF04RZ211Adsparam, mraid, require, module*/
/*jslint browser: true, devel:true, nomen:true */
/*control*/
module.exports = (function () {
	"use strict";
	window.DOMCTRL = (window.DOMCTRL || (function () {
		var addRemoveClass = require('./utils/addremoveclass'),
			create = require('./utils/create'),
			events = require('./utils/events'),
			domready = require('./utils/domready'),
			aspectHeight = require('./utils/aspectheight'),
			nodetree = require('./utils/nodetree'),
			imagesize = require('./utils/imagesize');

		return {
			addClass: function (elm, classname) {
				return addRemoveClass.add(elm, classname);
			},
			removeClass: function (elm, classname) {
				return addRemoveClass.remove(elm, classname);
			},
			create: function (type_or_config, classname, id) {
				return create.basicElement(type_or_config, classname, id);
			},
			domready: function (init_function) {
				return domready.run(init_function);
			},
			addListener: function (parentElm, eventType, eventHandler) {
				return events.add(parentElm, eventType, eventHandler);
			},
			handle: function (event, classSelectorFilter, sendFkn, checkParentFilterHit) {
				return events.handle(event, classSelectorFilter, sendFkn, checkParentFilterHit);
			},
			nodetree: function (opt_node_or_arr_of_nodes) {
				if (arguments.length > 1) {
					console.warn('control:nodetree: arguments must be sent as an array or only the first argument will be used');
				}
				return nodetree.fragment(opt_node_or_arr_of_nodes);
			},
			aspectHeight: function (w, refH, refW) {
				return aspectHeight.scaledHeight(w, refH, refW);
			},
			onResize: function (cb) {
				//TODO the resize listener.
				//addListener = function () {
				// window.addEventListener("resize", function () {cb()});
				// };
			},
			onimagesize: function (src, cb_h_w) {
				/* returns the size {'w':#, 'h':#} */
				return imagesize.onsize(src, cb_h_w);
			}
		};
	}()));
}());
