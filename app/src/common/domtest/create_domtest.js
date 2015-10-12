/*jslint browser: true, devel:true */
/*global module, require, QUnit, Node*/

/*test of the common/create api */
QUnit.module('DOMCTRL.create api');

(function () {
	'use strict';
	var core = window.DOMCTRL,
		create = core.create,
		config = {
			'type': 'div',
			'class': 'some class',
			'id': 'some_id',
			'rel': 'the_rel_attribute',
			'num': 4,
			'str': "4",
			'custom': 'some_custom_attribute'
		};

	QUnit.test('create is defined', function (assert) {
		assert.ok(typeof create === 'function');
	});

	QUnit.test('create node from argument list', function (assert) {
		var sample = create(config.type, config.class, config.id);
		assert.ok(sample.nodeType === Node.ELEMENT_NODE);
		assert.ok(sample.className === config.class);
		assert.ok(sample.id === config.id);
	});

	QUnit.test('create node from argument object', function (assert) {
		var sample = create(config);
		assert.ok(sample.nodeType === Node.ELEMENT_NODE);
		assert.ok(sample.className === config.class);
		assert.ok(sample.id === config.id);
		assert.ok(sample.getAttribute('rel') === config.rel);
		assert.ok(sample.getAttribute('num') !== config.num);
		assert.ok(sample.getAttribute('str') === config.str);
		assert.ok(sample.getAttribute('custom') === config.custom);
	});

	QUnit.test('create node from argument list and object shall only use object', function (assert) {
		var sample = create(config, 'a', 'b', 'c');
		assert.ok(sample.nodeType === Node.ELEMENT_NODE);
		assert.ok(sample.className === config.class);
		assert.ok(sample.id === config.id);
	});

}());
