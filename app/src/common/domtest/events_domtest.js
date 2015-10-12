/*jslint browser: true, devel:true */
/*global module, require, QUnit, Node*/

QUnit.module('DOMCTRL.events api');

(function () {
	'use strict';
	var core = window.DOMCTRL;

	QUnit.test('addListener is defined', function (assert) {
		assert.ok(typeof core.addListener === 'function');
	});

	QUnit.test('handle is defined', function (assert) {
		assert.ok(typeof core.handle === 'function');
	});

}());
