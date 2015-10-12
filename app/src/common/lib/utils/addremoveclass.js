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