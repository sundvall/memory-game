/*jslint browser: true, devel:true */
/*global module, require, QUnit, Node*/



(function () {
	'use strict';
	var core = window.DATAFLOW,
		api = ['register',
			'unregister',
			'constants',
			'dispatch'
		],
		shallExist = function (elements) {
			elements.forEach(function (elm) {
				QUnit.test(elm + ' exists', function (assert) {
					assert.ok(typeof core[elm] === 'function');
				});
			});
		};

	QUnit.module('DOMCTRL.dispatcher api');
	
	shallExist(api);

	QUnit.test('constants returns object', function (assert) {
		assert.ok(typeof core.constants() === 'object');
	});

}());
