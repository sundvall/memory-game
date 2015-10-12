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
