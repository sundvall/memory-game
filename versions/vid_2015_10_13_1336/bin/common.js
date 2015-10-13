var KF04RZ211_version_common = "vid_2015_10_13_1336";
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*global require, module*/
/*jslint browser: true, devel:true */
require('./lib/control');
require('./lib/dataflow');

},{"./lib/control":2,"./lib/dataflow":3}],2:[function(require,module,exports){
/*global KF04RZ211, AdssSentEvent, KF04RZ211Adsparam, mraid, require, module*/
/*jslint browser: true, devel:true, nomen:true */
/*control*/
module.exports = (function () {
	"use strict";
	window.DOMCTRL = (window.DOMCTRL || (function () {
		var addRemoveClass = require('./utils/addremoveclass'),
			create = require('./utils/create'),
			events = require('./utils/events'),
			domready = require('./utils/domready'),
			aspectHeight = require('./utils/aspectheight'),
			nodetree = require('./utils/nodetree'),
			imagesize = require('./utils/imagesize');

		return {
			addClass: function (elm, classname) {
				return addRemoveClass.add(elm, classname);
			},
			removeClass: function (elm, classname) {
				return addRemoveClass.remove(elm, classname);
			},
			create: function (type_or_config, classname, id) {
				return create.basicElement(type_or_config, classname, id);
			},
			domready: function (init_function) {
				return domready.run(init_function);
			},
			addListener: function (parentElm, eventType, eventHandler) {
				return events.add(parentElm, eventType, eventHandler);
			},
			handle: function (event, classSelectorFilter, sendFkn, checkParentFilterHit) {
				return events.handle(event, classSelectorFilter, sendFkn, checkParentFilterHit);
			},
			nodetree: function (opt_node_or_arr_of_nodes) {
				if (arguments.length > 1) {
					console.warn('control:nodetree: arguments must be sent as an array or only the first argument will be used');
				}
				return nodetree.fragment(opt_node_or_arr_of_nodes);
			},
			aspectHeight: function (w, refH, refW) {
				return aspectHeight.scaledHeight(w, refH, refW);
			},
			onResize: function (cb) {
				//TODO the resize listener.
				//addListener = function () {
				// window.addEventListener("resize", function () {cb()});
				// };
			},
			onimagesize: function (src, cb_h_w) {
				/* returns the size {'w':#, 'h':#} */
				return imagesize.onsize(src, cb_h_w);
			}
		};
	}()));
}());

},{"./utils/addremoveclass":4,"./utils/aspectheight":5,"./utils/create":7,"./utils/domready":9,"./utils/events":10,"./utils/imagesize":11,"./utils/nodetree":13}],3:[function(require,module,exports){
/*global KF04RZ211, AdssSentEvent, KF04RZ211Adsparam, mraid, require, module*/
/*jslint browser: true, devel:true, nomen:true */
/*

dataflow 
build from the Flux pattern.

usage:
register, dispatch

Any module registers functions that then are invoked with any payload as argument.

someFunctionWhichFiltersBehaviourFromPayloadType = function(payload) {
	if(payload.type === selected_type) {
		dosomething(payload.data);
	}
}

window.DATAFLOW.register(someFunctionWhichFiltersBehaviourFromPayloadType);
window.DATAFLOW.dispatch({
		'type': 'action_type',
		'data_1': 'some_data',
		'data_2': 'some other data'
	}
});


*/
module.exports = (function () {
	"use strict";
	window.DATAFLOW = (window.DATAFLOW || (function () {
		var constants = require('./utils/constants'),
			dispatcher = require('./utils/dispatcher'),
			ajax_jquery_crossdomain = require('./utils/jqajx_crossdomain');

		return {
			register: function (cb) {
				dispatcher.register(cb);
			},
			unregister: function (cb) {
				dispatcher.unregister(cb);
			},
			dispatch: function (payload) {
				dispatcher.dispatch(payload);
			},
			constants: function () {
				return constants;
			},
			request: function (url, successhandler, errorhandler) {
				console.log('dataflow:request:');
				if (!(successhandler && typeof successhandler === 'function')) {
					console.error('dataflow:request:provide a successhandler: function(data){}');
				}
				if (!(errorhandler && typeof errorhandler === 'function')) {
					console.error('dataflow:request:provide a errorhandler: function(){}');
				}
				ajax_jquery_crossdomain.getAsString(url, successhandler, errorhandler);
			}
		};
	}()));
}());

},{"./utils/constants":6,"./utils/dispatcher":8,"./utils/jqajx_crossdomain":12}],4:[function(require,module,exports){
/*global KF04RZ211, require, module*/
/*jslint browser: true, devel:true */

/*

	addremoveclass 

	usage: 
	add a class if it is not already there
	remove a class if it is there

	return:
	the modified input dom node
*/

module.exports = (function () {
	"use strict";
	var containsWord = function (string, word) {
		return new RegExp('\\b' + word + '\\b').test(string);
	},
		addClass = function (elm, classname) {
			if (!containsWord(elm.className, classname)) {
				elm.className += ' ' + classname;
			}
			return elm;
		},
		removeClass = function (elm, classname) {
			/*classname must be word characters and not å,ä,ö
			All extra spaces are removed.*/
			var reg = new RegExp(classname, 'g');
			if (containsWord(elm.className, classname)) {
				elm.className = elm.className.replace(reg,' ').replace(/\s{1,}/g, ' ');
			}
			return elm;
		};
	return {
		add: function (elm, classname) {
			return addClass(elm, classname);
		},
		remove: function (elm, classname) {
			return removeClass(elm, classname);
		}
	};
}());


/*
TEST
var containsWord = function (string, word) {
	return new RegExp('\\b' + word + '\\b').test(string);
},
	addClass = function (elm, classname) {
		if (!containsWord(elm.className, classname)) {
			elm.className += ' ' + classname;
		}
		return elm;
	},
	removeClass = function (elm, classname) {
		var reg = new RegExp(classname, 'g');
		if (containsWord(elm.className, classname)) {
			elm.className = elm.className.replace(reg,' ').replace(/\s{1,}/g, ' ');
		}
		return elm;
	};
	var elm = document.createElement('div');
	elm.className = 'ett tva tre fyra fem';
	removeClass(elm,'tre');*/
},{}],5:[function(require,module,exports){
/*global KF04RZ211, require, module*/
/*jslint browser: true, devel:true */

/*

	aspectheight 

	usage: 
	
	the height is calculated to preserve the aspect ratio from a provided image or given value

	return:
	height 
*/

module.exports = (function () {
	"use strict";
	var refSize = {
		'w': 160,
		'h': 90
	},
		MATHROUND = Math.round,
		heightFromAspectRatio = function (w, refW, refH) {
			var rw = (refW || refSize.w),
				rh = (refH || refSize.h);
			return MATHROUND((rh / rw) * w);
		};

	return {
		refSize: function () {
			return refSize;
		},
		scaledHeight: function (w, refH, refW) {
			/*optional refH, refW - If not provided the preset format is used*/
			refSize.w = (refW || refSize.w);
			refSize.h = (refH || refSize.h);
			return heightFromAspectRatio(w, refW, refH);
		}

	};
}());

},{}],6:[function(require,module,exports){
/*global KF04RZ211, require, module*/
/*jslint browser: true, devel:true, nomen:true */

/*
	constants

	usage: 
	
	return:
*/

module.exports = (function (object) {
	'use strict';
	var constants = {
		BOARD_SELECT: 'board_select',
		GAMETYPE_MEMORY: 'gametype_memory',
		GAME_RESET: 'game_reset',
		GAME_CONFIRM_RESET: 'game_reset_confirm',
		GAME_RESET_CANCEL: 'game_reset_cancel',
		GAME_NOSCORE: 'game_noscore',
		GAME_SCORE: 'game_score',
		GAME_WIN: 'game_win',
		CARD_SHOW: 'card_show',
		CARD_REMOVE: 'card_remove',
		CLICK_BOARD: 'click_board',
		KEY_RETURN: 'key_return',
		KEY_ESC: 'key_escape',
		KEY_STROKE: 'key_stroke',
		KEY_DOWN: 'key_down',
		KEY_UP: 'key_up',
		KEY_LEFT: 'key_left',
		KEY_RIGHT: 'key_right',
		KEY_TAB: 'key_tab',
		KEY_SPACE: 'key_space'
	},
		process = function () {
			Object.keys(constants).forEach(function (elm) {
				object[elm] = constants[elm];
			});
		};

	process();

	return object;

}({}));

},{}],7:[function(require,module,exports){
/*global KF04RZ211, require, module*/
/*jslint browser: true, devel:true */

/*

	create 

	usage: 
	object-argument:
	window.CORE.control.create( {
		type: 'div',
		class: 'an_example other_class',
		id: null,
		other: 'other_attribute',
		other2: 'yet_other'
	});
	
	list-argument:
	window.CORE.control.create('div','some classes','some_id')

	return:
	a dom node with attributes
*/

module.exports = (function () {
	"use strict";
	var node,
		createNode = function (type) {
			return document.createElement(type);
		},
		addProperties = function (p, classname, id) {
			if (typeof p === 'object') {
				Object.keys(p).forEach(function (key) {
					if (key !== 'type') {
						node.setAttribute(key, p[key]);
					}
				});
			} else {
				if (classname) {
					node.setAttribute('class', classname);
				}
				if (id) {
					node.setAttribute('id', id);
				}
			}
		};

	return {
		basicElement: function (p, classname, id) {
			var type = (p.type || p);
			node = createNode(type);
			addProperties(p, classname, id);
			return node;
		}
	};
}());

},{}],8:[function(require,module,exports){
/*global KF04RZ211, require, module*/
/*jslint browser: true, devel:true, nomen:true */

/*  
	dispatcher

	usage: 
	
	
	
*/

module.exports = (function () {
	"use strict";
	
	var callback = [];

	return {
		register: function (cb) {
			callback.push(cb);
			return callback.length;
		},
		unregister: function (cb) {
			delete callback[cb];
		},
		dispatch: function (payload) {
			callback.forEach(function (cb) {
				cb(payload);
			});
		}
	};
}());
},{}],9:[function(require,module,exports){
/*global KF04RZ211, require, module, mraid*/
/*jslint browser: true, devel:true, nomen:true */

/*
	usage: 
	domready(app_init);
	
	The 'app_init' will execute when dom state is 'interactive' or 'complete'.
	if mraid is enabled the initial load has to be done after readyState is ok.
	If the mraid configuration does not dispatch 'loading' the 'isViewable' check is used as fallback.
	
*/

module.exports = (function () {
	"use strict";
	var applyWhenDomIsReady = function (func) {

		(function pollCheck() {
			var state = document.readyState;
			if (state === 'interactive' || state === 'complete') {
				func();
			} else {
				setTimeout(pollCheck, 400);
			}
		}());
	};

	return {
		run: function (func) {
			if (typeof func === 'function') {
				applyWhenDomIsReady(func);
			} else {
				console.error('domready: argument must be a function:' + func);
			}
		}
	};
}());

},{}],10:[function(require,module,exports){
/*global KF04RZ211, require, module*/
/*jslint browser: true, devel:true, nomen:true */

/*
	events
	usage: 
	
	return:
*/

/*
//Usage of the events-module
var fetch_child_4_click_same,
	fetch_child_4_click_below,
	html = '';
html += '<div id="parent" class="fkn_parent" name="ADD LISTENER TO THIS" val="0">';
html += ' <div id="child_1" class="fkn_child_1" val="1">';
html += ' 	<div id="child_2" class="fkn_child_2" val="2">';
html += ' 		<div id="child_3" class="fkn_child_3" val="3">';
html += ' 			<div id="child_4" class="fkn_child_4" val="4" name="CATCH THIS ELEMENT WITH THE FILTER CLASS NAME">';
html += '				<p id="content_A" class="fkn_content_A" val="5" name="CLICK ON THIS ELEMENT"></p>';
html += '				<p id="content_B" class="fkn_content_A" val="6" name="OR CLICK ON THIS ELEMENT">';
html += '					<span id="inner_content" class="fkn_inner_content" val="7" name="OR CLICK ON THIS ELEMENT"></span>';
html += '				</p>';
html += '				<p id="content_C" name="OR CLICK ON THIS ELEMENT" val="8"></p>';
html += '				<p id="content_D" name="OR CLICK ON THIS ELEMENT" val="9"></p>';
html += '			</div>';
html += '		</div>';
html += '	</div>';
html += '</div>';

document.querySelector('body').innerHTML += html;*/

//This custom eventhandling system allows attachment of an eventlistener to a common parent, and at the same time fetch any of its children. For example click inside a containers child elements is registered higher up in the hierarchy, but still fetching the child element. If the last argument is set to 'false' in handle.(eventobject,'.filterclass',callback, false|true) only the precise click on the child element is registered.

/*fetch_child_4_click_same = function (e) {
	console.log('fetch_child_4_click_same handler');
	var cb = function (p) {
		// p.e gets the event object
		p.e.stopPropagation();
		var elm = p.elm,
			id = (elm.getAttribute('id'));
		console.log('clickCB handler:id:',id);
	};
	// This handler function runs the callback only if the .fkn_child_4 element is clicked
	core.handle(e, '.fkn_child_4', cb, false);
};

fetch_child_4_click_below = function (e) {
	console.log('fetch_child_4_click_below handler');
	var cb = function (p) {
		//p.e gets the event object
		p.e.stopPropagation();
		var elm = p.elm,
			id = (elm.getAttribute('id'));
		console.log('clickCB handler:id:',id);
	};
	
	//If the last argument is set to 'true', the handler function runs the callback if the .fkn_filter element or any of its children (#content_A,#content_B,#inner_content) is clicked
	core.handle(e, '.fkn_child_4', cb, true);
};


// Listener is added to the parent element, the handler-function determines the result
core.addListener(document.querySelector('#parent'), 'click', fetch_child_4_click_same);
core.addListener(document.querySelector('#parent'), 'click', fetch_child_4_click_below);


// Click is invoked on the innermost element

setTimeout(function () {
	$('#inner_content').click();
}, 600);
*/

module.exports = (function () {
	"use strict";

	var containsWord = function (string, word) {
		return new RegExp('\\b' + word + '\\b').test(string);
	},
		checkParentForFilterHit = function (element, filter, addFilter) {
			var node = element,
				additionalFilterHit = false,
				parentNode = node.parentNode,
				className = element.className,
				wrapFilterHit = false,
				wrapFilter = 'KF04RZ211adcont',
				seq = 0,
				parentTargetHit = false;
			while (parentNode !== null && !(seq > 15 || wrapFilterHit || parentTargetHit)) {
				node = parentNode;
				className = parentNode.className;
				parentTargetHit = containsWord(className, filter);
				wrapFilterHit = containsWord(className, wrapFilter);
				if (!additionalFilterHit) {
					additionalFilterHit = containsWord(className, addFilter);
				}
				seq += 1;
				parentNode = node.parentNode;
			}
			return {
				'filterHit': parentTargetHit,
				'targetElem': node,
				'className': className
			};
		},
		handle = function (e, classSelectorFilter, sendFkn, checkParent) {
			var handle = (function () {
				e = e || window.event;
				var targetElem = e.target || e.srcElement,
					filterHit = false,
					className = targetElem.className,
					data = e.detail,
					checkParentObj,
					filterClassName = classSelectorFilter.slice(1);
				filterHit = containsWord(className, filterClassName);
				if (!filterHit && checkParent) {
					checkParentObj = checkParentForFilterHit(targetElem, filterClassName);
					filterHit = checkParentObj.filterHit;
					className = checkParentObj.className;
					targetElem = checkParentObj.targetElem;
				}
				if (filterHit && sendFkn) {
					sendFkn({
						'elm': targetElem,
						'data': data,
						'e': e
					});
				}
				return {
					getEventObj: function () {
						return {
							'className': className,
							'data': data,
							'filterHit': filterHit,
							'filter': filterClassName
						};
					}
				};
			}());
			return handle;
		},
		startListening = function (parentElement, eventType, eventHandler) {
			try {
				if (parentElement.addEventListener) {
					parentElement.addEventListener(eventType, eventHandler, false);
				} else if (parentElement.attachEvent) {
					eventType = "on" + eventType;
					parentElement.attachEvent(eventType, eventHandler);
				} else {
					parentElement["on" + eventType] = eventHandler;
				}
			} catch (e) {
				console.log('events:' + e);
				if (console.trace) {
					console.trace();
				}
			}
		};

	return {
		add: function (parentElm, eventType, eventHandler) {
			startListening(parentElm, eventType, eventHandler);
		},
		handle: function (event, classSelectorFilter, sendFkn, checkParentFilterHit) {
			return handle(event, classSelectorFilter, sendFkn, checkParentFilterHit);
		}
	};









}());

},{}],11:[function(require,module,exports){
/*global KF04RZ211, require, module*/
/*jslint browser: true, devel:true */

/*

	imagesize 

	usage: 
	
	the height is calculated to preserve the aspect ratio from a provided image or given value

	return:
	height 
*/

module.exports = (function () {
	"use strict";
	var sizeFromImage = function (src, cb) {
		var img = new Image(),
			size = {};
		img.onload = function () {
			size.w = this.width;
			size.h = this.height;
			cb(this.height, this.width);
		};
		img.onerror = function () {
			console.warn('aspectheight:onerror:can not use image:' + src);
			cb();
		};
		img.src = src;
		return size;
	};

	return {
		onsize: function (src, cb) {
			return sizeFromImage(src, cb);
		}
	};
}());

},{}],12:[function(require,module,exports){
/*global require, module, jQuery, $*/
/*jslint browser: true, devel:true*/
/*
	Build from example found at
	http://stackoverflow.com/questions/10642289/return-html-content-as-a-string-given-url-javascript-function
	http://james.padolsey.com/snippets/cross-domain-requests-with-jquery/
	
	jqajx_crossdomain

	creates data for a grid, and navigates trough this

	usage: 

	return:
	
*/

module.exports = (function () {
	"use strict";

	jQuery.ajax = (function (ajx) {
		var protocol = location.protocol,
			hostname = location.hostname,
			exRegex = new RegExp(protocol + '//' + hostname),
			YQL = 'http' + (/^https/.test(protocol) ? 's' : '') + '://query.yahooapis.com/v1/public/yql?callback=?',
			query = 'select * from html where url="{URL}" and xpath="*"';

		function isExternal(url) {
			return !exRegex.test(url) && /:\/\//.test(url);
		}

		return function (ajxConf) {
			console.dir(ajxConf);
			var url = ajxConf.url;

			//if a crossdomain get request not asking for json
			if (/get/i.test(ajxConf.type) && !/json/i.test(ajxConf.dataType) && isExternal(url)) {

				// Manipulate options so that JSONP-x request is made to YQL
				ajxConf.url = YQL;
				ajxConf.dataType = 'json';
				ajxConf.data = {
					q: query.replace(
						'{URL}',
						url + (ajxConf.data ?
							(/\?/.test(url) ? '&' : '?') + jQuery.param(ajxConf.data) : '')
					),
					format: 'xml'
				};

				// Since it's a JSONP request
				// complete === success
				if (!ajxConf.success && ajxConf.complete) {
					ajxConf.success = ajxConf.complete;
					delete ajxConf.complete;
				}

				ajxConf.success = (function (ok) {
					return function (data) {

						if (ok) {
							// Fake XHR callback.
							ok.call(this, {
								responseText: data.results[0]
								// YQL does not work with <script>s
								// Get rid of them
								.replace(/<script[^>]+?\/>|<script(.|\s)*?\/script>/gi, '')
							}, 'success');
						}

					};
				}(ajxConf.success));

			}

			return ajx.apply(this, arguments);

		};

	}(jQuery.ajax));






	return {
		getAsString: function (the_url, successhandler, errorhandler) {
			// console.log('jqajx_crossdomain:getAsString:', the_url);
// 			console.log('jqajx_crossdomain:getAsString:', successhandler);
// 			console.log('jqajx_crossdomain:getAsString:', errorhandler);
			$.ajax({
				url: the_url,
				type: 'GET',
				success: function (res) {
					var text = res.responseText;
					/* then you can manipulate your text as you wish*/
					if (successhandler && typeof successhandler === 'function') {
						successhandler(text);
					} else {
						console.log('jqajx_crossdomain:provide a successhandler: function(text){}')
					}
				},
				error: function () {
					if (errorhandler && typeof errorhandler === 'function') {
						errorhandler();
					} else {
						console.log('jqajx_crossdomain:provide a errorhandler: function(){}');
					}
					/*Here's where you handle an error response.
					Note that if the error was due to a CORS issue,
					this function will still fire, but there won't be any additional
					information about the error.*/
				}
			});
		}
	};


}());

},{}],13:[function(require,module,exports){
/*global require, module*/
/*jslint browser: true, devel:true, nomen:true */



/*
	usage: 
	array-argument:
	window.CORE.nodetree.fragment([nodeA,nodeB,...,nodeN])

	or 
	window.CORE.nodetree.fragment(nodeA]);

	or 
	window.CORE.nodetree.fragment();

	return:
	a document-fragment
*/

module.exports = (function () {
	"use strict";
	var isArray = function (o) {
		return Object.prototype.toString.call(o) === '[object Array]';
	},
		createTree = function (nodes) {
			var docf = document.createDocumentFragment();
			try {
				if (nodes && isArray(nodes)) {
					nodes.forEach(function (elm) {
						docf.appendChild(elm);
					});
				} else if (nodes) {
					docf.appendChild(nodes);
				}
			} catch (e) {
				console.log(e);
			}
			return docf;
		};

	/*api*/
	return {
		fragment: function (nodes) {
			if (arguments.length > 1) {
				console.warn('nodetree: arguments must be sent as an array or only the first argument will be used');
			}
			return createTree(nodes);
		}
	};

}());

},{}]},{},[1]);
