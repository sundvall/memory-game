/*global require, module*/
/*jslint browser: true, devel:true*/

/*
	shuffle

	usage: 
	shuffle.arr(the_array);

	return:
	the_array

*/

module.exports = (function () {
	"use strict";
	var shuffleArray = function (array) {
		/*Fisher-Yates shuffle algorithm.*/
		var i, j, temp,
			MATHFLOOR = Math.floor,
			MATHRAND = Math.random,
			shuffled = [];
		for (i = array.length - 1; i > 0; i -= 1) {
			j = MATHFLOOR(MATHRAND() * (i + 1));
			temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}
		return array;
	};

	return {
		arr: function (d) {
			return shuffleArray(d);
		}
	};

}());
