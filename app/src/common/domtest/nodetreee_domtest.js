/*jslint browser: true, devel:true */
/*global module, require, QUnit, Node*/

/*test of the common/create api */
QUnit.module('DOMCTRL.nodetree api');

(function () {
	'use strict';
	var core = window.DOMCTRL,
		nodetree = core.nodetree,
		nodesToAppend = [document.createElement('div'), document.createElement('ul'), document.createElement('li')],
		testElm = document.createElement('div');

	testElm.id = 'test_elm';
	document.querySelector('body').appendChild(testElm);

	nodesToAppend[0].id = 'test_div';
	nodesToAppend[1].id = 'test_ul';
	nodesToAppend[2].id = 'test_li';

	QUnit.test('nodetree is defined', function (assert) {
		assert.ok(typeof nodetree === 'function');
	});

	QUnit.test('nodetree returns document fragment', function (assert) {
		var sample = nodetree();
		assert.ok(sample.nodeType === Node.DOCUMENT_FRAGMENT_NODE);
	});

	QUnit.test('nodetree(node) append single node', function (assert) {
		var sample = nodetree(nodesToAppend[0]);
		assert.ok(sample.children[0] === nodesToAppend[0]);
	});

	QUnit.test('nodetree(node) append list of nodes', function (assert) {
		var sample = nodetree(nodesToAppend);
		assert.ok(sample.children[0] === nodesToAppend[0]);
		assert.ok(sample.children[1] === nodesToAppend[1]);
		assert.ok(sample.children[2] === nodesToAppend[2]);
	});

	QUnit.test('nodetree(node) append fragment to body', function (assert) {
		var sample = nodetree(nodesToAppend);
		testElm.appendChild(sample);
		assert.ok(sample.nodeType === Node.DOCUMENT_FRAGMENT_NODE);
		assert.ok(document.querySelector('#test_div').nodeType === Node.ELEMENT_NODE);
		assert.ok(document.querySelector('#test_ul').nodeType === Node.ELEMENT_NODE);
		assert.ok(document.querySelector('#test_li').nodeType === Node.ELEMENT_NODE);
	});
	
	QUnit.test('nodetree(node) remove inserted test element', function (assert) {
		testElm.parentNode.removeChild(testElm);
		assert.ok(!document.querySelector('#test_div'));
		assert.ok(!document.querySelector('#test_ul'));
		assert.ok(!document.querySelector('#test_li'));
	});

}());
