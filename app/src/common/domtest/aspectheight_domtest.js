/*jslint browser: true, devel:true */
/*global module, require, QUnit, Node*/



(function () {
	'use strict';

	QUnit.module('DOMCTRL.aspectheight api');

	var core = window.DOMCTRL,
		api = ['aspectHeight'],
		shallExist = function (elements) {
			elements.forEach(function (elm) {
				QUnit.test(elm + ' exists', function (assert) {
					assert.ok(typeof core[elm] === 'function');
				});
			});
		};
	shallExist(api);

	QUnit.test('Height is scaled according to format', function (assert) {
		var format, sample, actual;
		format = {
			'w': 100,
			'h': 200
		};
		sample = core.aspectHeight(200, format.h, format.w);
		actual = 400;
		assert.ok(core.aspectHeight(sample === actual));
		
		format = {
			'w': 200,
			'h': 100
		};
		sample = core.aspectHeight(200, format.h, format.w);
		actual = 100;
		assert.ok(core.aspectHeight(sample === actual));
		
		
	});


}());
