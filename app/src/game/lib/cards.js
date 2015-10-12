/*global require, module*/
/*jslint browser: true, devel:true*/

/*
	cards
	
	usage: 

	return:

*/

module.exports = (function () {
	"use strict";

	var actions = require('./actions'),
		view = require('./view'),
		dataflow = window.DATAFLOW,
		register = dataflow.register,
		constants = dataflow.constants(),
		values = require('./values'),
		conf = {
			'rows': -1,
			'cols': -1
		},
		state = {
			'cards': [],
			'card_at_position': {},
			'selected': [],
			'removed': [],
			'wait': false
		},
		game = {
			'selected': {
				'max': 2
			},
			'score': {
				'player1': 0
			},
			'condition': {
				'score': function () {
					return (state.selected[0].value === state.selected[1].value);
				}
			}
		},
		cycleArr = function (arr, i) {
			var L = arr.length,
				to = (((i + 1) < L) ? i + 1 : 0);
			return to;
		},
		updateView = function () {
			/*view.update({'modulename':stateobject})*/
			view.update({
				'cards': state
			});
		},
		createCards = function (p) {
			/*one card per position, each card-value is a duplicate of another*/
			var i, j, card,
				v = 0,
				items = [],
				rows = p.rows,
				cols = p.cols,
				values = p.values;
			state.card_at_position = {};
			for (i = 0; i < rows; i += 1) {
				state.card_at_position[i] = {};
				for (j = 0; j < cols; j += 1) {
					card = {
						'row': i,
						'col': j,
						'value': values[v],
						'selected': false,
						'selectable': true
					};
					/*store card in array and also by position*/
					items.push(card);
					state.card_at_position[i][j] = card;
					/*select new value for card by looping the array of possible values*/
					v = cycleArr(values, v);
				}
			}
			return items;
		},
		applyToCards = function (fkn) {
			state.cards.forEach(function (card, index) {
				fkn(card, index);
			});
		},
		selectCard = function (r, c) {
			if (state.wait) {
				console.log('card:waiting for round to complete');
			} else {
				var card = (state.card_at_position[r][c].selectable && state.card_at_position[r][c]);
				if (state.selected.length > 0 && (state.selected[0].row === r && state.selected[0].col === c)) {
					console.log('card:selectCard - card alreadye selected');
				} else {
					card.selected = true;
					state.selected.push(card);
					updateView();
				}
			}
		},
		shuffle = function () {
			values.shuffle(function (data) {
				state.cards = createCards({
					'rows': conf.rows,
					'cols': conf.cols,
					'values': data
				});
				updateView();
			}, (0.5 * conf.rows * conf.cols));
		},
		reset = function () {
			state.cards = [];
			state.selected = [];
			state.removed = [];
			shuffle();
		},
		victory = function () {
			//if no cards are selectable - the game is over
			var num = 0,
				vic = false,
				selectableExists = function (card) {
					if (card.selectable) {
						num += 1;
					}
				};
			applyToCards(selectableExists);
			vic = Boolean(num === 0);
			if (vic) {
				actions.win('player');
			}
			return (num === 0);
		},
		gameCheck = function () {
			if (!state.wait) {


				if (state.selected.length >= game.selected.max) {
					if (game.condition.score()) {
						state.selected[0].selectable = false;
						state.selected[1].selectable = false;
						state.removed.push(state.selected[0]);
						state.removed.push(state.selected[1]);
						actions.score('player1');
						actions.remove(state.selected[0].row, state.selected[0].col);
						actions.remove(state.selected[1].row, state.selected[1].col);
					} else {
						state.selected[0].selectable = true;
						state.selected[1].selectable = true;
						state.selected[0].selected = false;
						state.selected[1].selected = false;
						actions.noscore('player1');
					}
					/*wait before updating the game to be able to see the cards*/
					state.wait = true;
					setTimeout(function () {
						updateView();
						state.selected = [];
						state.wait = false;
					}, 1000);
				}
				if (victory()) {
					console.log('victory!');
					view.celebrate();
				}
			}
		},
		valuesObjectIsValid = function (data) {
			/*console.log('valuesObjectIsValid:ok', data);*/
			return Array.isArray(data);
		},
		registerActions = function () {
			register(function (payload) {
				if (payload.type === constants.BOARD_SELECT) {
					selectCard(payload.row, payload.col);
					gameCheck();
				}
				if (payload.type === constants.GAME_RESET) {
					reset();
				}

			});
		};

	return {
		init: function (p) {
			conf.rows = p.rows || 4;
			conf.cols = p.cols || 4;
			if (p.gameType === constants.GAMETYPE_MEMORY) {
				values.onRecieve(function (data) {
					if (valuesObjectIsValid(data)) {
						state.cards = createCards({
							'rows': conf.rows,
							'cols': conf.cols,
							'values': data
						});
						updateView();
						registerActions();
					} else {
						console.error('cards:init: values object must be an array, ["val_A","val_B"..."valN"]', data);
					}
				}, (0.5 * conf.rows * conf.cols));
			} else {
				console.error('cards:init:game type is not supported:' + p.gameType);
			}

		}
	};

}());
