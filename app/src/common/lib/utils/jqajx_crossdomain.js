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
