'use strict';

const http = require('http');
const XmlStream = require("xml-stream");
const Readable = require('stream').Readable || require('readable-stream');

/**
 * Forex constructor
 * To get currency exchange rate from service provider
 */
class Forex {
	/**
	 * @constructor
	 */
	constructor() {

	}

	/**
	 * Get an Exchange Rate according to the currency
	 * @param {string} from - Currency From
	 * @param {string} to - Currency To
	 * @retun {Promise<{string rate, string timestamp}>} A promise result in ExRate type
	 */
	getRate(from, to) {
		//console.log('getRate', from, ':', to);
		let p = new Promise(function (resolve, reject) {

			var options = {
				host: 'rates.fxcm.com',
				port: 80,
				path: '/RatesXML'
			};

			http.get(options, function (res) {
				//console.log("Got response: " + res.statusCode);
				var body = '';

				res.on('data', function(chunk) {
					body += chunk;
				});

				res.on('end', function() {
					var rs = new Readable();
					rs.push(body);
					rs.push(null);
					//console.log(chunk);
					var xml = new XmlStream(rs);

					var rateVal;
					xml.preserve('Rate');
					xml.on('endElement: Rate', function (item) {
						//console.log(item.$.Symbol);
						if (item.$.Symbol == from + to) {
							rateVal = Number(item.Bid.$text);
							//console.log('Bid value found:', rateVal);
						}
					});
					xml.on('end', function () {
						if (rateVal) {
							let result = {
								rate: rateVal,
								timestamp: new Date()
							};
							//console.log('getRate done', JSON.stringify(result));
							resolve(result);
						} else {
							reject('No value for the pair ' + from + ':' + to);
						}
					});
				});


			}).on('error', function (e) {
				console.log("Got error: " + e.message);
				reject(e);
			});
		});
		return p;
	}
}

module.exports = Forex;
