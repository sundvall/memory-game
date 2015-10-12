/*jslint browser: true, devel:true */
/*global module,require*/
/*

actions

usage: 
var actions = require('./actions');

actions.prev(some,data);

When the action is invoked the dispatcher invokes all callbacks with the provided 'type' and arguments. 
 
 */

module.exports = (function () {
	"use strict";
	var dataflow = window.DATAFLOW,
		dispatch = dataflow.dispatch,
		constants = dataflow.constants();

	return {
		clickboard: function (row, col) {
			dispatch({
				'type': constants.CLICK_BOARD,
				'row': row,
				'col': col
			});
		},
		keystroke: function (value) {
			dispatch({
				'type': constants.KEY_STROKE,
				'value': value
			});
		},
		boardselect: function (row, col) {
			dispatch({
				'type': constants.BOARD_SELECT,
				'row': row,
				'col': col
			});
		},
		remove: function (row, col) {
			dispatch({
				'type': constants.CARD_REMOVE,
				'row': row,
				'col': col
			});
		},
		reset: function () {
			dispatch({
				'type': constants.GAME_RESET
			});
		},
		confirmReset : function () {
			dispatch({
				'type': constants.GAME_CONFIRM_RESET
			});
		},
		cancelReset :function () {
			dispatch({
				'type': constants.GAME_RESET_CANCEL
			});
		},
		win: function (player) {
			dispatch({
				'type': constants.GAME_WIN,
				'player': player
			});
		},
		noscore: function (player) {
			dispatch({
				'type': constants.GAME_NOSCORE,
				'player': player
			});
		},
		score: function (player) {
			dispatch({
				'type': constants.GAME_SCORE
			});
		}
	};
}());
