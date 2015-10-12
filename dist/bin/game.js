(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*global KF04RZ211, AdssSentEvent, KF04RZ211Adsparam, mraid, require, module*/
/*jslint browser: true, devel:true, nomen:true */
window.MEMORYGAME = (window.MEMORYGAME || (function () {
	"use strict";

	var setupAndInit = require('./lib/setup').init();
		
}()));

},{"./lib/setup":9}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
/*global require, module*/
/*jslint browser: true, devel:true*/

/*
	board

	creates and navigates through data for a grid

	usage: 
		state = {
			'currentpos': {
				'r': 0,
				'c': 0
			},
			'size': {
				'r': null,
				'c': null
			},
			'positions': [{
							'r': i,
							'c': j,
							'active': true,
							'gate_to_reset':false
						}],
			'grid':[[{pos},{pos},{pos},{pos}],[{pos},{pos},{pos},{pos}],...[{pos},{pos},{pos},{pos}]]
			'reset': {
				'selected': false,
				'before':{'r':i,'c':j},
				'confirm':false
			}
	return:
	
*/

module.exports = (function () {
	"use strict";
	var actions = require('./actions'),
		view = require('./view'),
		dataflow = window.DATAFLOW,
		register = dataflow.register,
		constants = dataflow.constants(),
		configuration,
		gates = {
			'to_reset': {
				'r': null,
				'c': null
			}
		},
		state = {
			'currentpos': {
				'r': 0,
				'c': 0
			},
			'size': {
				'r': null,
				'c': null
			},
			'reset': {
				'selected': false,
				'confirm': false,
				'before': {
					'r': null,
					'c': null
				}
			}
		},
		updateView = function () {
			view.update({
				'board': state
			});
		},
		createPositions = function (conf) {
			/*store position y row-col-index*/
			var i, j,
				position,
				positions = [],
				rows = conf.rows,
				cols = conf.cols;
			state.grid = [];
			for (i = 0; i < rows; i += 1) {
				state.grid[i] = [];
				for (j = 0; j < cols; j += 1) {
					position = {
						'r': i,
						'c': j,
						'active': true,
						'gate_to_reset': ((i === gates.to_reset.r) || (j === gates.to_reset.c))
					};
					positions.push(position);
					state.grid[i][j] = position;
				}
			}
			return positions;
		},
		applyToPositions = function (fkn) {
			state.grid.forEach(function (row, index, arr) {
				row.forEach(function (pos, i) {
					fkn(pos);
				});
			});
		},
		applyToLastActiveInColumn = function (col, fkn) {
			var row_max = state.size.r - 1,
				i,
				applied = false;
			for (i = row_max; i >= 0; i -= 1) {
				if (state.grid[i][col].active) {
					fkn(state.grid[i][col]);
					applied = true;
					break;
				}
			}
			return applied;
		},
		moveToFirstActive = function () {
			var firstActive = 'not_found',
				isActive = function (pos) {
					if (pos.active && firstActive !== 'found') {
						firstActive = 'found';
						state.currentpos.r = pos.r;
						state.currentpos.c = pos.c;
					}
				};
			applyToPositions(isActive);
		},
		onCardRemove = function (row, col) {
			/*inactivate and replace gate to reset*/
			var inactivate = function (pos) {
				if (pos.r === row && pos.c === col) {
					pos.active = false;
					if (pos.gate_to_reset) {
						applyToLastActiveInColumn(col, function (pos) {
							pos.gate_to_reset = true;
						});
					}
				}
			};
			applyToPositions(inactivate);
			moveToFirstActive();
			updateView();
		},
		isActive = function (row, col) {
			return state.grid[row][col].active;
		},
		isCurrentPos = function (row, col) {
			return (state.currentpos.r === row && state.currentpos.c === col);
		},
		selectPos = function (row, col) {
			state.reset.selected = false;
			if (isActive(row, col)) {
				state.currentpos.r = parseInt(row, 10);
				state.currentpos.c = parseInt(col, 10);
				updateView();
				actions.boardselect(state.currentpos.r, state.currentpos.c);
				/*TODO wait for animation to finish*/
			}
		},
		onClickBoard = function (row, col) {
			selectPos(row, col);
		},
		activeElementToBoardPosition = function () {
			/*If the current focused element is in the board*/
			var r, c, attr = {};
			if (view.focusElementIs('board_item')) {
				attr = view.getAttributesActiveElement(['row', 'col']);
				try {
					r = parseInt(attr.row, 10);
					c = parseInt(attr.col, 10);
				} catch (err) {
					console.error('board:activeElementToBoardPosition:' + err);
				}
			}
			return {
				'r': r,
				'c': c
			};
		},
		moveToReset = function () {
			console.log('moveToReset:current:', state.currentpos);
			console.log('moveToReset:before:', state.reset.before);
			if (!state.reset.selected) {
				state.reset.before = {
					'r': state.currentpos.r,
					'c': state.currentpos.c
				};
				state.currentpos.r = null;
				state.currentpos.c = null;
				state.reset.selected = true;
			}
		},
		moveFromReset = function () {
			if (state.reset.selected) {
				console.log('moveFromReset:before:', state.reset.before);
				state.currentpos.r = state.reset.before.r;
				state.currentpos.c = state.reset.before.c;
				state.reset.selected = false;
			}
		},
		onGameReset = function () {
			state.currentpos.r = 0;
			state.currentpos.c = 0;
			moveToReset();
			createPositions(configuration);
			moveFromReset();
		},
		isGateToReset = function (row, col) {
			try {
				return Boolean(state.grid[row][col].gate_to_reset);
			} catch (err) {
				console.log('board:isGateToReset:' + err, arguments);
			}
		},
		moveToNextActive = function (row, col) {
			console.log('moveToNextActive', arguments);
			/*move to next active column position starting from the given position. Continue searching the grid
			from left to right and restart from the top left corner if no no position is found*/
			var pos = {
				'r': null,
				'c': null
			},
				found = function () {
					return (pos.r !== null && pos.c !== null);
				},
				storeIfUniqueActive = function (r, c) {
					if (isActive(r, c) && !(r === row && c === col)) {
						pos.r = r;
						pos.c = c;
					}
				},
				col_max = state.size.c - 1,
				row_max = state.size.r - 1,
				i, j,
				start = {
					'r': row,
					'c': col
				};

			for (i = start.r; i <= row_max; i += 1) {
				for (j = start.c; j <= col_max; j += 1) {
					storeIfUniqueActive(i, j);
					if (found()) {
						break;
					}
				}
				if (found()) {
					break;
				}
				start.c = 0;
			}
			/*restart the search from position 0,0*/
			if (!found()) {
				for (i = 0; i <= start.r; i += 1) {
					for (j = 0; j <= col_max; j += 1) {
						storeIfUniqueActive(i, j);
						if (found()) {
							break;
						}
					}
					if (found()) {
						break;
					}
				}
			}

			if (found()) {
				state.currentpos.r = pos.r;
				state.currentpos.c = pos.c;
			}
			return found();
		},
		moveToPrevActive = function (row, col) {
			/*read backwards from the currentposition*/
			/*move to next active column position starting from the given position. Continue searching the grid
			from left to right and restart from the top left corner if no no position is found*/
			var pos = {
				'r': null,
				'c': null
			},
				found = function () {
					return (pos.r !== null && pos.c !== null);
				},
				storeIfUniqueActive = function (r, c) {
					if (isActive(r, c) && !(r === row && c === col)) {
						pos.r = r;
						pos.c = c;
					}
				},
				col_max = state.size.c - 1,
				row_max = state.size.r - 1,
				i, j,
				start = {
					'r': row,
					'c': col
				};

			for (i = start.r; i >= 0; i -= 1) {
				for (j = start.c; j >= 0; j -= 1) {
					storeIfUniqueActive(i, j);
					if (found()) {
						break;
					}
				}
				if (found()) {
					break;
				}
				start.c = col_max;
			}
			/*restart the search from position lower right*/
			if (!found()) {
				for (i = row_max; i >= start.r; i -= 1) {
					for (j = col_max; j >= 0; j -= 1) {
						storeIfUniqueActive(i, j);
						if (found()) {
							break;
						}
					}
					if (found()) {
						break;
					}
				}
			}

			if (found()) {
				state.currentpos.r = pos.r;
				state.currentpos.c = pos.c;
			}
			return found();
		},
		moveToNextActivePosInCol = function (row, col) {
			var pos = {
				'r': null,
				'c': null
			},
				found = function () {
					return (pos.r !== null && pos.c !== null);
				},
				row_max = state.size.r - 1,
				next_row = (((row + 1) <= row_max) ? row + 1 : row_max),
				i;
			for (i = next_row; i <= row_max; i += 1) {
				if (isActive(i, col)) {
					pos.r = i;
					pos.c = col;
				}
				if (found()) {
					break;
				}
			}
			if (found()) {
				state.currentpos.r = pos.r;
				state.currentpos.c = pos.c;
			}
			return found();
		},
		moveToPrevActivePosInCol = function (row, col) {
			/*move up from the given position*/
			var pos = {
				'r': null,
				'c': null
			},
				found = function () {
					return (pos.r !== null && pos.c !== null);
				},
				prev_row = (((row - 1) >= 0) ? row - 1 : 0),
				i;
			for (i = prev_row; i >= 0; i -= 1) {
				if (isActive(i, col)) {
					pos.r = i;
					pos.c = col;
				}
				if (found()) {
					break;
				}
			}
			if (found()) {
				state.currentpos.r = pos.r;
				state.currentpos.c = pos.c;
			}
			return found();

		},
		moveDown = function () {
			var row = state.currentpos.r,
				col = state.currentpos.c;
			if (!state.reset.selected) {
				if (isGateToReset(row, col) && isActive(row, col)) {
					moveToReset();
				} else if (!moveToNextActivePosInCol(row, col)) {
					moveToNextActive(row, col);
				}
			}
		},
		moveUp = function () {
			if (state.reset.selected) {
				moveFromReset();
			} else if (!moveToPrevActivePosInCol(state.currentpos.r, state.currentpos.c)) {
				moveToNextActivePosInCol(state.currentpos.r, state.currentpos.c);
			}
		},
		moveRight = function () {
			console.log('moveRight');
			if (state.reset.selected) {
				moveFromReset();
			} else {
				moveToNextActive(state.currentpos.r, state.currentpos.c);
			}
		},
		moveLeft = function () {
			console.log('moveLeft');
			if (state.reset.selected) {
				moveFromReset();
			} else {
				moveToPrevActive(state.currentpos.r, state.currentpos.c);
			}
		},
		moveByTab = function () {
			/*get position from focused element,
			advance to next position.
			If next step by column is far right switch row.
			If next step by row is lowest go to reset button (next tabindex), resetbutton.focus()*/
			/*var posFromActive = activeElementToBoardPosition(),
				row_current = state.currentpos.r,
				col_current = state.currentpos.c,
				row_max = state.size.r - 1,
				col_max = state.size.c - 1;
			state.currentpos.r = (posFromActive.r || state.currentpos.r);
			state.currentpos.c = (posFromActive.c || state.currentpos.c);

			if ((col_current) >= col_max) {
				state.currentpos.c = 0;
				state.currentpos.r = (row_current + 1);
				if (row_current === row_max) {
					state.reset.selected = true;
				} else {
					state.reset.selected = false;
				}
			} else {
				state.currentpos.c += 1;
			}*/
			// moveRight();
			moveToReset();
		},
		disabledByConfirmBox = false,
		hilitedCancel = false,
		cancelConfirmReset = function () {
			if (disabledByConfirmBox) {
				view.confirmReset(false);
				state.reset.confirm = false;
				disabledByConfirmBox = false;
			}
		},
		onGameConfirmReset = function () {
			disabledByConfirmBox = true;
		},
		onKeyStroke = function (keyb) {
			/*if arrow keys are used for navigation,update the focused element*/
			/*if tab keys are used for navigation, update the state from the active element*/
			/*if mouse was used, the state and focuesed element updates from the selected element*/
			if (keyb === constants.KEY_LEFT) {
				if (disabledByConfirmBox) {
					view.hiliteCancel();
					hilitedCancel = true;
				} else {
					moveLeft();
				}
			} else if (keyb === constants.KEY_RIGHT) {
				if (disabledByConfirmBox) {
					view.hiliteAccept();
					hilitedCancel = false;
				} else {
					moveRight();
				}
			} else if (keyb === constants.KEY_UP) {
				if (disabledByConfirmBox) {

				} else {
					moveUp();
				}
			} else if (keyb === constants.KEY_DOWN) {
				if (disabledByConfirmBox) {

				} else {
					moveDown();
				}
			} else if (keyb === constants.KEY_TAB) {
				if (disabledByConfirmBox) {

				} else {
					moveByTab();
				}
			} else if (keyb === constants.KEY_ESC) {
				cancelConfirmReset();
			} else if (keyb === constants.KEY_RETURN) {
				if (state.reset.selected && !state.reset.confirm) {
					state.reset.confirm = true;
					view.confirmReset(true);
					disabledByConfirmBox = true;
				} else if (disabledByConfirmBox) {
					if (hilitedCancel) {
						cancelConfirmReset();
					} else {
						actions.reset();
						state.reset.confirm = false;
						view.confirmReset(false);
						disabledByConfirmBox = false;
					}
				} else {
					selectPos(state.currentpos.r, state.currentpos.c);
				}
			}
			updateView();
		},
		registerActions = function () {
			register(function (payload) {
				if (payload.type === constants.CLICK_BOARD) {
					onClickBoard(payload.row, payload.col);
				}
				if (payload.type === constants.KEY_STROKE) {
					onKeyStroke(payload.value);
				}
				if (payload.type === constants.CARD_REMOVE) {
					onCardRemove(payload.row, payload.col);
				}
				if (payload.type === constants.GAME_CONFIRM_RESET) {
					onGameConfirmReset();
				}
				if (payload.type === constants.GAME_RESET) {
					onGameReset();
				}
				if (payload.type === constants.GAME_RESET_CANCEL) {
					cancelConfirmReset();
				}
			});
		};

	return {
		init: function (conf) {
			if (conf && (conf.rows && conf.cols)) {
				configuration = conf;
				state.size.r = conf.rows;
				state.size.c = conf.cols;
				/*Make bottom row entry point to reset*/
				gates.to_reset.r = conf.rows - 1;
				createPositions(conf);
			} else {
				console.error('board:init lacks correct input. Invoke with argument {row:number,col:number]}');
			}
			registerActions();
		}
	};

}());

},{"./actions":2,"./view":12}],4:[function(require,module,exports){
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

},{"./actions":2,"./values":11,"./view":12}],5:[function(require,module,exports){
/*global require, module, Node*/
/*jslint browser: true, devel:true*/

/*
	usage: 

	return:

*/

module.exports = (function () {
	"use strict";

	var core = window.DOMCTRL,
		dataflow = window.DATAFLOW,
		actions = require('./actions'),
		clickListenerHandler = function (e) {
			var cb = function (p) {
				p.e.stopPropagation();
				var elm = p.elm,
					row = elm.getAttribute('row'),
					col = elm.getAttribute('col');
				actions.clickboard(row,col);
			};
			//If the last argument is set to 'true', the handler function runs the callback if the .fkn_filter element or any of its children (#content_A,#content_B,#inner_content) is clicked
			core.handle(e, '.board_item', cb, true);
		},
		addListener = function (parent) {

			core.addListener(parent, 'click', clickListenerHandler);
		};

	return {
		init: function (board) {
			if (board.nodeType === Node.ELEMENT_NODE) {
				addListener(board);
			} else {
				console.error('click_board:init: call with an element: ' + board);
			}
		}
	};

}());

},{"./actions":2}],6:[function(require,module,exports){
/*global require, module*/
/*jslint browser: true, devel:true*/

/*
	duplicate

	usage: 
	var orig = [a,b,c,d,e]
	partOfArray(orig,3);

	return:
	[a,b,c,a,b,c]
*/

module.exports = (function () {
	"use strict";
	var duplicateArray = function (values, numOfDifferentValues) {
		/*double part or parts of array*/
		/*Return a array of values, where each value is repeated twice. The number of unique values are equal to the 'numOfDifferentValues' argument.*/
		var L = values.length,
			i,
			copy_1 = [],
			copy_2 = [],
			result = [];
		if (numOfDifferentValues < (L + 1)) {
			for (i = 0; i < L; i += 1) {
				copy_1.push(values[i]);
				copy_2.push(values[i]);
			}
			result = copy_1.concat(copy_2);
		} else {
			console.error('duplicate:duplicateArray:can not copy values. Input: ' + numOfDifferentValues + ' is more than available:' + L);
		}
		return result;
	};

	return {
		partOfArr: function (arr, numOfDifferentValues) {
			return duplicateArray(arr, numOfDifferentValues);
		}
	};

}());

},{}],7:[function(require,module,exports){
/*global require, module, Node*/
/*jslint browser: true, devel:true*/

/*
	usage: 

	return:

	TODO move to common-library

*/

module.exports = (function () {
	"use strict";

	var dataflow = window.DATAFLOW,
		actions = require('./actions'),
		// dispatch = dataflow.dispatch,
		// register = dataflow.register,
		constants = dataflow.constants(),
		// returnCallbacks = [],
		// core = window.DOMCTRL,
		cDown = 40,
		cEscape = 27,
		cReturn = 13,
		cUp = 38,
		cLeft = 37,
		cRight = 39,
		cTab = 9,
		cSpace = 32,
		codes = [{
			'val': cDown,
			'name': constants.KEY_DOWN
		}, {
			'val': cEscape,
			'name': constants.KEY_ESC
		}, {
			'val': cUp,
			'name': constants.KEY_UP
		}, {
			'val': cLeft,
			'name': constants.KEY_LEFT
		}, {
			'val': cRight,
			'name': constants.KEY_RIGHT
		}, {
			'val': cReturn,
			'name': constants.KEY_RETURN
		}, {
			'val': cTab,
			'name': constants.KEY_TAB
		}, {
			'val': cSpace,
			'name': constants.KEY_SPACE
		}],
		keyHandler = function (e) {
			var code = (e.keyCode || e.which);
			codes.forEach(function (keyb) {
				if (code === keyb.val) {
					if (code !== cTab || code !== cSpace) {
						e.preventDefault();
					}
					actions.keystroke(keyb.name);
				}
			});
		},
		addListener = function () {
			window.addEventListener('keydown', keyHandler);
		};

	return {
		init: function () {
			addListener();
		},
		onreturn: function (elm, cb) {
			elm.addEventListener('keydown', function (e) {
				console.log('key_board:onretrurn:run handler');
				var code = (e.keyCode || e.which);
				if (code === cReturn) {
					console.log('key_board:run callback');
					cb();
				}
			});
		}
	};

}());

},{"./actions":2}],8:[function(require,module,exports){
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

},{"./view":12}],9:[function(require,module,exports){
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
			'backofcardSrc': '../img/back_of_card.png',
			'logoSrc': '../img/logo.png'
		},
		initialization = function () {
			var elements = view.init(conf).getElements();
			// console.log('setup:elements', elements);
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

},{"./board":3,"./cards":4,"./click_board":5,"./key_board":7,"./score":8,"./view":12}],10:[function(require,module,exports){
/*global require, module*/
/*jslint browser: true, devel:true*/

/*
	shuffle

	usage: 
	shuffle.arr(the_array);

	return:
	the_array

*/

module.exports = (function () {
	"use strict";
	var shuffleArray = function (array) {
		/*Fisher-Yates shuffle algorithm.*/
		var i, j, temp,
			MATHFLOOR = Math.floor,
			MATHRAND = Math.random,
			shuffled = [];
		for (i = array.length - 1; i > 0; i -= 1) {
			j = MATHFLOOR(MATHRAND() * (i + 1));
			temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}
		return array;
	};

	return {
		arr: function (d) {
			return shuffleArray(d);
		}
	};

}());

},{}],11:[function(require,module,exports){
/*global require, module*/
/*jslint browser: true, devel:true*/

/*
	values

	usage: 

	return:

*/

module.exports = (function () {
	"use strict";
	var dataflow = window.DATAFLOW,
		shuffle = require('./shuffle'),
		duplicate = require('./duplicate'),
		defaultvalues = ['#3be6c4', '#e6e03b', '#6f3be6', '#4fe63b', '#e63b3b', '#ff5a00', '#ff00de', '#3b8fe6'],
		values = defaultvalues,
		valuesFitToSize = [],
		duplicatePartOfArray = function (values, numOfDifferentValues) {
			/*duplicate part or parts of array to fit a game of memory*/
			return duplicate.partOfArr(values, numOfDifferentValues);
		},
		parseToValues = function (text) {
			var hex = new RegExp('#[a-fA-f0-9]{6}', 'g');
			return text.match(hex);
		},
		on_recieve = function (cb, indexesToCopy) {
			var url = 'http://worktest.accedo.tv/colours.conf',
				onsuccess = function (text) {
					/*parse text to defaultvalues-format above, text-format is found at 'http://worktest.accedo.tv/colours.conf'*/
					values = parseToValues(text);
					valuesFitToSize = shuffle.arr(duplicatePartOfArray(values, indexesToCopy));
					return cb(valuesFitToSize);
				},
				onerror = function () {
					console.log('values on_recieve - error');
					values = defaultvalues;
					valuesFitToSize = shuffle.arr(duplicatePartOfArray(values, indexesToCopy));
					return cb(valuesFitToSize);
				};
			dataflow.request(url, onsuccess, onerror);
		};

	return {
		onRecieve: function (cb, indexesToCopy) {
			on_recieve(cb, indexesToCopy);
		},
		shuffle: function (cb, indexesToCopy) {
			if (values) {
				cb(shuffle.arr(valuesFitToSize));
			} else {
				on_recieve(cb, indexesToCopy);
			}
		}
	};

}());

},{"./duplicate":6,"./shuffle":10}],12:[function(require,module,exports){
/*global require, module*/
/*jslint browser: true, devel:true*/

/*
	view
	create and handle all dom-nodes for the app

	usage: 
	elements.cards = {
		'0': {
			'0': card,bg,fg
			'1': card,bg,fg
			'2': card,bg,fg
			'3': card,bg,fg
			},
		'1':{
			'0': card,
			'1': card,
			'2': card,
			'3': card
			},
		
		'row: {'col':cardobject }
	}	

	elements[row][col] => card

	return:

*/

module.exports = (function () {
	"use strict";
	var actions = require('./actions'),
		keyBoard = require('./key_board'),
		core = window.DOMCTRL,
		create = core.create,
		backofcardSrc,
		cardsize,
		logoSrc,
		MATHROUND = Math.round,
		rows,
		cols,
		elements = {},
		tabindex,
		selectParent = function () {
			try {
				elements.parent = (elements.parent || document.querySelector('#memorygame'));
				tabindex = (parseInt(elements.parent.getAttribute('tabindex'), 10) || 0);
			} catch (e) {
				console.error('view:init:' + e);
			} finally {
				return elements.parent;
			}
		},
		containsWord = function (string, word) {
			return new RegExp('\\b' + word + '\\b').test(string);
		},
		createBoardItemsAndCards = function () {
			/*save references to each node in 'elements' object
			Number of cards and positions on the board are equal
			return an array of nodes:
			<li class='board_item' row='i' col='j' tabindex=''>
				<div class='board_item_content>
					<div class='card>
						<div class='card_bg>
						<div class='card_fg>
		
			elements.grid = {
				'i': {
					'j': {
						reference to board_item on position i j
					}
				}
			}
			elements.card = {
				'i': {
					'j': {
						reference to card on position i j
					}
				}
			}
		*/
			elements.grid = {};
			elements.cards = {};
			elements.board_item = [];
			elements.board_item_content = [];
			elements.card = [];
			elements.card_bg = [];
			elements.card_fg = [];
			var i, j, item, content, card, card_bg, card_fg;

			for (i = 0; i < rows; i += 1) {
				elements.cards[i] = {};
				elements.grid[i] = {};
				for (j = 0; j < cols; j += 1) {
					item = create({
						'type': 'li',
						'class': 'board_item',
						'row': i,
						'col': j,
						'tabindex': (tabindex += 1)
					});
					/*nodes*/
					content = create('div', 'board_item_content persp');
					card = create('div', 'card pres3d');
					card_bg = create('div', 'card_bg backhidden pres3d rot180');
					card_fg = create('div', 'card_fg backhidden pres3d rot0');
					/*node hierachy*/
					card.appendChild(card_fg);
					card.appendChild(card_bg);
					content.appendChild(card);
					item.appendChild(content);
					/*reference to card nodes*/
					elements.cards[i][j] = {
						'card': card,
						'bg': card_bg,
						'fg': card_fg
					};
					/*reference to board nodes*/
					elements.grid[i][j] = {
						'item': item,
						'content': content
					};
					elements.board_item.push(item);
					elements.board_item_content.push(content);
				}
			}
			return elements.board_item;
		},
		createScore = function () {
			elements.scoreWrap = create('div', 'score_wrap');
			elements.score = create('div', 'score');
			elements.scoreWrap.appendChild(elements.score);
			return elements.scoreWrap;
		},
		createLogo = function () {
			elements.logoWrap = create('div', 'logo_wrap');
			elements.logo = create('img', 'logo');
			elements.logo.src = logoSrc;
			elements.logoWrap.appendChild(elements.logo);
			return elements.logoWrap;
		},
		createRestart = function () {
			elements.restartWrap = create('div', 'reset_wrap');
			elements.restart = create({
				'type': 'button',
				'class': 'reset',
				'tabindex': (tabindex += 1)
			});
			elements.restartWrap.appendChild(elements.restart);
			return elements.restartWrap;
		},
		createConfirm = function () {
			elements.confirmWrap = create('div', 'confirm_wrap confirm_hide');
			elements.confirmBox = create('div', 'confirm_box');
			elements.confirmText = create('p', 'confirm_text');
			elements.confirmText.innerText = 'Reset game?';
			elements.confirmAccept = create('button', 'confirm_accept');
			elements.confirmCancel = create('button', 'confirm_cancel');
			elements.confirmAccept.innerText = 'yes';
			elements.confirmCancel.innerText = 'no';
			elements.confirmBox.appendChild(elements.confirmText);
			elements.confirmBox.appendChild(elements.confirmCancel);
			elements.confirmBox.appendChild(elements.confirmAccept);
			elements.confirmWrap.appendChild(elements.confirmBox);
			return elements.confirmWrap;
		},
		createBoard = function () {
			/*grid*/
			elements.board = create('div', 'board');
			elements.board_items = create('ul', 'board_items');
			elements.board_items.appendChild(core.nodetree(createBoardItemsAndCards()));
			elements.infoWrap = create('div', 'info_wrap');
			/*attach elements to document fragment*/
			var score_logo_restart_docf = core.nodetree([createScore(), createRestart()]);
			elements.infoWrap.appendChild(score_logo_restart_docf);
			elements.board.appendChild(createLogo());
			elements.board.appendChild(elements.board_items);
			elements.board.appendChild(elements.infoWrap);
			elements.board.appendChild(createConfirm());
			return elements.board;
		},
		applyToAllCards = function (fkn) {
			var i = 0,
				j = 0,
				card;
			while (elements.cards[i]) {
				while (elements.cards[i][j]) {
					card = elements.cards[i][j];
					fkn(card, i, j);
					j += 1;
				}
				j = 0;
				i += 1;
			}
		},
		applyToAllGrid = function (fkn) {
			var i = 0,
				j = 0,
				item;
			while (elements.grid[i]) {
				while (elements.grid[i][j]) {
					item = elements.grid[i][j].item;
					fkn(item, i, j);
					j += 1;
				}
				j = 0;
				i += 1;
			}
		},
		heightToAllCards = function (h, w) {
			var card = elements.cards[0][0].card,
				bordersize = 6,
				widthOfCard = card.getBoundingClientRect().width,
				card_aspectheight = core.aspectHeight(widthOfCard, h, w),
				setHeight = function (ref) {
					ref.card.style.marginTop = MATHROUND(0.10 * card_aspectheight) + 'px';
					ref.card.style.marginBottom = MATHROUND(0.10 * card_aspectheight) + 'px';
					ref.card.style.height = card_aspectheight + 'px';
					ref.bg.style.height = (card_aspectheight - bordersize) + 'px';
					ref.fg.style.height = (card_aspectheight - bordersize) + 'px';
				};
			applyToAllCards(setHeight);
		},
		confirmSize = function () {
			var parentHeight = elements.parent.getBoundingClientRect().height;
			elements.confirmWrap.style.height = 1.2 * parentHeight + 'px';
			elements.confirmBox.style.top = 0.5 * parentHeight + 'px';
		},
		sizeOfACardToAll = function () {
			if (cardsize) {
				heightToAllCards(cardsize.h, cardsize.w);
			} else {
				cardsize = core.onimagesize(backofcardSrc, heightToAllCards);
			}
		},
		setCardBackground = function (src) {
			applyToAllCards(function (card) {
				card.fg.style.backgroundImage = 'url(' + src + ')';
			});
		},
		setRestartElementTitleText = function (txt) {
			elements.restart.title = txt;
		},
		setScore = function (num) {
			elements.score.innerHTML = num;
		},
		resizeHandler = function (e) {
			e.stopPropagation();
			sizeOfACardToAll();
			confirmSize();
		},
		confirmHideClassname = 'confirm_hide',
		confirmShowClassname = 'confirm_show',
		showConfirm = function () {
			core.removeClass(elements.confirmWrap, confirmHideClassname);
			core.addClass(elements.confirmWrap, confirmShowClassname);
		},
		hideConfirm = function () {
			core.removeClass(elements.confirmWrap, confirmShowClassname);
			core.addClass(elements.confirmWrap, confirmHideClassname);
		},
		clickRestartHandler = function (e) {
			e.stopPropagation();
			showConfirm();
			actions.confirmReset();
		},
		addListeners = function () {
			window.addEventListener('resize', resizeHandler);
			elements.restart.addEventListener('click', clickRestartHandler);
			elements.confirmAccept.addEventListener('click', function () {
				actions.reset();
				hideConfirm();
			});
			elements.confirmCancel.addEventListener('click', function () {
				actions.cancelReset();
				hideConfirm();
			});
			// keyBoard.onreturn(elements.restart, function () {
			// 				restartButtonHandler();
			// 			});
		};


	return {
		init: function (p) {
			rows = p.rows || 6;
			cols = p.cols || 8;
			backofcardSrc = p.backofcardSrc;
			logoSrc = p.logoSrc;
			selectParent().appendChild(createBoard());
			setCardBackground(backofcardSrc);
			setRestartElementTitleText('Reset game');
			setTimeout(function () {
				confirmSize();
			}, 100);
			setScore(0);
			sizeOfACardToAll();
			addListeners();
			return this;
		},
		confirmReset: function (ok) {
			if (ok) {
				showConfirm();
			} else {
				hideConfirm();
			}
			console.log('confirmReset');
		},
		hiliteAccept: function () {
			elements.confirmAccept.style.background = '#F9E8AC';
			elements.confirmCancel.style.background = 'transparent';
		},
		hiliteCancel: function () {
			elements.confirmCancel.style.background = '#F9E8AC';
			elements.confirmAccept.style.background = 'transparent';
		},
		getElements: function () {
			return elements;
		},
		getAttributesActiveElement: function (types) {
			var actElm = document.activeElement,
				attr = {};
			types.forEach(function (type) {
				attr[type] = (actElm.getAttribute(type) || 'not_found');
			});
			return attr;
		},
		focusElementIs: function (class_name) {
			var actElm = document.activeElement;
			return (actElm && containsWord(actElm.className, class_name));
		},
		celebrate: function () {
			core.addClass(elements.score, 'celebrate');
			setTimeout(function () {
				core.removeClass(elements.score, 'celebrate');
			}, 4000);
		},
		update: function (state) {
			/*Main loop to update state of data modules*/
			var stylefkn, focusClassname = 'currentfocused';
			if (state.cards) {
				stylefkn = function (ref, i, j) {
					if (state.cards.card_at_position[i][j].selectable) {
						ref.card.style.opacity = '1.0';
					} else {
						ref.card.style.opacity = '0.2';
					}
					if (state.cards.card_at_position[i][j].selected) {

						core.addClass(ref.card, 'fronttoback');
						core.removeClass(ref.card, 'backtofront');
						// console.log('view:update')
						ref.fg.style.opacity = '1.0';

					} else {
						// setTimeout(function () {
						core.removeClass(ref.card, 'fronttoback');
						core.addClass(ref.card, 'backtofront');

						ref.fg.style.opacity = '1.0';
						// }, 700);
					}

					if (ref.fg.style.backgroundColor !== state.cards.card_at_position[i][j].value) {
						ref.bg.style.backgroundColor = state.cards.card_at_position[i][j].value;
					}

					/*test*/
					// core.addClass(elements.grid[i][j].content, 'flip_p');
					// core.addClass(ref.card, 'fronttoback');
					// 					core.addClass(ref.card, 'flip_p');
					//
					// 					core.addClass(ref.bg, 'flip_c');
					// 					core.addClass(ref.bg, 'backhidden');
					// 					core.addClass(ref.fg, 'backhidden');

				};
				applyToAllCards(stylefkn);
			}
			if (state.board) {
				stylefkn = function (elm, i, j) {
					if (i === state.board.currentpos.r && j === state.board.currentpos.c) {
						//show active/focused
						elm = core.addClass(elm, focusClassname);
						elm.focus();
					} else {
						//show not active/focuses
						elm = core.removeClass(elm, focusClassname);
					}
				};

				if (state.board.reset.selected) {
					/*hilite restart button*/
					elements.restart = core.addClass(elements.restart, focusClassname);
					elements.restart.focus();
					applyToAllGrid(stylefkn);
				} else {
					elements.restart = core.removeClass(elements.restart, focusClassname);
					applyToAllGrid(stylefkn);
				}

			}
			if (state.score) {
				setScore(state.score.current);
			}
		}
	};

}());

},{"./actions":2,"./key_board":7}]},{},[1]);
