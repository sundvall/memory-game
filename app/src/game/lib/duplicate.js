/*global require, module*/
/*jslint browser: true, devel:true*/

/*
	duplicate

	usage: 
	var orig = [a,b,c,d,e]
	partOfArray(orig,3);

	return:
	[a,b,c,a,b,c]
*/

module.exports = (function () {
	"use strict";
	var duplicateArray = function (values, numOfDifferentValues) {
		/*double part or parts of array*/
		/*Return a array of values, where each value is repeated twice. The number of unique values are equal to the 'numOfDifferentValues' argument.*/
		var L = values.length,
			i,
			copy_1 = [],
			copy_2 = [],
			result = [];
		if (numOfDifferentValues < (L + 1)) {
			for (i = 0; i < L; i += 1) {
				copy_1.push(values[i]);
				copy_2.push(values[i]);
			}
			result = copy_1.concat(copy_2);
		} else {
			console.error('duplicate:duplicateArray:can not copy values. Input: ' + numOfDifferentValues + ' is more than available:' + L);
		}
		return result;
	};

	return {
		partOfArr: function (arr, numOfDifferentValues) {
			return duplicateArray(arr, numOfDifferentValues);
		}
	};

}());
