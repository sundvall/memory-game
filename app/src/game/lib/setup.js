/*global require, module*/
/*jslint browser: true, devel:true*/

/*
	usage: 

	return:

*/

module.exports = (function () {
	"use strict";
	var core = window.DOMCTRL,
		dataflow = window.DATAFLOW,
		constants = dataflow.constants(),
		board = require('./board'),
		cards = require('./cards'),
		clickBoard = require('./click_board'),
		keyBoard = require('./key_board'),
		score = require('./score'),
		view = require('./view'),
		conf = {
			'rows': 4,
			'cols': 4,
			'gameType': constants.GAMETYPE_MEMORY,
			'backofcardSrc': './img/back_of_card.png',
			'logoSrc': './img/logo.png'
		},
		initialization = function () {
			var elements = view.init(conf).getElements();
			cards.init(conf);
			score.init();
			clickBoard.init(elements.board);
			keyBoard.init();
			board.init(conf);
		};

	return {
		init: function () {
			core.domready(initialization);
		}
	};

}());
