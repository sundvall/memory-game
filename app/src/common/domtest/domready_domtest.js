/*jslint browser: true, devel:true */
/*global module, require, QUnit, Node*/

(function () {
	'use strict';
	var core = window.DOMCTRL,
		testnum = 0,
		iterate = function () {
			testnum += 1;
		},
		runSequence = function (times) {
			var i;
			for (i = 0; i < times; i += 1) {
				core.domready(iterate);
			}
		},
		num = 19;

	runSequence(num);
	

	var testfkn = function () {
		QUnit.module('DOMCTRL.domready api');
		
		QUnit.test('domready is defined', function (assert) {
			assert.ok(typeof core.domready === 'function');
		});
		
		QUnit.test('domready executes several functions', function (assert) {
			assert.ok(testnum === num);
		});
	};
	
	setTimeout(function (){
		testfkn();
	},900);

}());
