/*jslint browser: true, devel:true */
/*global module, require, QUnit, Node*/

/*test of the common/create api */


(function () {
	'use strict';

	var elements = ['#memorygame', '#memorygame .board', '#memorygame .board_items', '#memorygame .board_item', '#memorygame .board_item_content', '#memorygame .card', '#memorygame .card_bg', '#memorygame .card_fg', '#memorygame .logo', '#memorygame .reset', '#memorygame .score_wrap', '#memorygame .score_wrap .score'];

	setTimeout(function () {
		QUnit.module('Basic element setup');

		elements.forEach(function (elm) {

			QUnit.test(elm + ' exists', function (assert) {
				var sample = document.querySelector(elm);
				assert.ok(sample && sample.nodeType === Node.ELEMENT_NODE);
			});
		});

	}, 500);

}());
