/*global require, module*/
/*jslint browser: true, devel:true*/

/*
	score


	usage: 

	return:
	
*/

module.exports = (function () {
	"use strict";
	var view = require('./view'),
		dataflow = window.DATAFLOW,
		register = dataflow.register,
		constants = dataflow.constants(),
		state = {
			'round_win': 5,
			'round_loose': -1,
			'current': 0
		},
		viewUpdate = function () {
			view.update({
				'score': state
			});
		},
		registerActions = function () {
			register(function (payload) {
				if (payload.type === constants.GAME_RESET) {
					state.current = 0;
					viewUpdate();
				}
				if (payload.type === constants.GAME_SCORE) {
					state.current += state.round_win;
					viewUpdate();
				}
				if (payload.type === constants.GAME_NOSCORE) {
					state.current += state.round_loose;
					viewUpdate();
				}
			});
		};

	return {
		init: function () {
			registerActions();
		}
	};

}());
