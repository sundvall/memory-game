/*global require, module*/
/*jslint browser: true, devel:true*/

/*
	values

	usage: 

	return:

*/

module.exports = (function () {
	"use strict";
	var dataflow = window.DATAFLOW,
		shuffle = require('./shuffle'),
		duplicate = require('./duplicate'),
		defaultvalues = ['#3be6c4', '#e6e03b', '#6f3be6', '#4fe63b', '#e63b3b', '#ff5a00', '#ff00de', '#3b8fe6'],
		values = defaultvalues,
		valuesFitToSize = [],
		duplicatePartOfArray = function (values, numOfDifferentValues) {
			/*duplicate part or parts of array to fit a game of memory*/
			return duplicate.partOfArr(values, numOfDifferentValues);
		},
		parseToValues = function (text) {
			var hex = new RegExp('#[a-fA-f0-9]{6}', 'g');
			return text.match(hex);
		},
		on_recieve = function (cb, indexesToCopy) {
			var url = 'http://worktest.accedo.tv/colours.conf',
				onsuccess = function (text) {
					/*parse text to defaultvalues-format above, text-format is found at 'http://worktest.accedo.tv/colours.conf'*/
					values = parseToValues(text);
					valuesFitToSize = shuffle.arr(duplicatePartOfArray(values, indexesToCopy));
					return cb(valuesFitToSize);
				},
				onerror = function () {
					console.log('values on_recieve - error');
					values = defaultvalues;
					valuesFitToSize = shuffle.arr(duplicatePartOfArray(values, indexesToCopy));
					return cb(valuesFitToSize);
				};
			dataflow.request(url, onsuccess, onerror);
		};

	return {
		onRecieve: function (cb, indexesToCopy) {
			on_recieve(cb, indexesToCopy);
		},
		shuffle: function (cb, indexesToCopy) {
			if (values) {
				cb(shuffle.arr(valuesFitToSize));
			} else {
				on_recieve(cb, indexesToCopy);
			}
		}
	};

}());
