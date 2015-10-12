/*global KF04RZ211, AdssSentEvent, KF04RZ211Adsparam, mraid, require, module*/
/*jslint browser: true, devel:true, nomen:true */
/*

dataflow 
build from the Flux pattern.

usage:
register, dispatch

Any module registers functions that then are invoked with any payload as argument.

someFunctionWhichFiltersBehaviourFromPayloadType = function(payload) {
	if(payload.type === selected_type) {
		dosomething(payload.data);
	}
}

window.DATAFLOW.register(someFunctionWhichFiltersBehaviourFromPayloadType);
window.DATAFLOW.dispatch({
		'type': 'action_type',
		'data_1': 'some_data',
		'data_2': 'some other data'
	}
});


*/
module.exports = (function () {
	"use strict";
	window.DATAFLOW = (window.DATAFLOW || (function () {
		var constants = require('./utils/constants'),
			dispatcher = require('./utils/dispatcher'),
			ajax_jquery_crossdomain = require('./utils/jqajx_crossdomain');

		return {
			register: function (cb) {
				dispatcher.register(cb);
			},
			unregister: function (cb) {
				dispatcher.unregister(cb);
			},
			dispatch: function (payload) {
				dispatcher.dispatch(payload);
			},
			constants: function () {
				return constants;
			},
			request: function (url, successhandler, errorhandler) {
				console.log('dataflow:request:');
				if (!(successhandler && typeof successhandler === 'function')) {
					console.error('dataflow:request:provide a successhandler: function(data){}');
				}
				if (!(errorhandler && typeof errorhandler === 'function')) {
					console.error('dataflow:request:provide a errorhandler: function(){}');
				}
				ajax_jquery_crossdomain.getAsString(url, successhandler, errorhandler);
			}
		};
	}()));
}());
