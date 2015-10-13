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
