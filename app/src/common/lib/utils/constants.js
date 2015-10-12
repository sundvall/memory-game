/*global KF04RZ211, require, module*/
/*jslint browser: true, devel:true, nomen:true */

/*
	constants

	usage: 
	
	return:
*/

module.exports = (function (object) {
	'use strict';
	var constants = {
		BOARD_SELECT: 'board_select',
		GAMETYPE_MEMORY: 'gametype_memory',
		GAME_RESET: 'game_reset',
		GAME_CONFIRM_RESET: 'game_reset_confirm',
		GAME_RESET_CANCEL: 'game_reset_cancel',
		GAME_NOSCORE: 'game_noscore',
		GAME_SCORE: 'game_score',
		GAME_WIN: 'game_win',
		CARD_SHOW: 'card_show',
		CARD_REMOVE: 'card_remove',
		CLICK_BOARD: 'click_board',
		KEY_RETURN: 'key_return',
		KEY_ESC: 'key_escape',
		KEY_STROKE: 'key_stroke',
		KEY_DOWN: 'key_down',
		KEY_UP: 'key_up',
		KEY_LEFT: 'key_left',
		KEY_RIGHT: 'key_right',
		KEY_TAB: 'key_tab',
		KEY_SPACE: 'key_space'
	},
		process = function () {
			Object.keys(constants).forEach(function (elm) {
				object[elm] = constants[elm];
			});
		};

	process();

	return object;

}({}));
