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
