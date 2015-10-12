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
