'use strict';

const Promise = require('bluebird');
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
	 *
	 * @param {object} config - http.get.options of currency exchange service
	 * @param {string} config.host
	 * @param {number} config.port
	 * @param {string} config.path
	 *
	 * @retun {Promise<{string rate, string timestamp}>} A promise result
	 */
	getRate(from, to, config) {
		let instance = this;
		//console.log('getRate', from, ':', to);
		let p = new Promise(function (resolve, reject) {

			http.get(config, function (res) {
				//console.log("Got response: " + res.statusCode);
				var body = '';

				res.on('data', function (chunk) {
					body += chunk;
				});

				res.on('end', function () {
					instance.getRateFromResponseBody(body, from, to).then(resolve, reject);
				});


			}).on('error', function (e) {
				console.log("Got error: " + e.message);
				reject(e);
			});
		});
		return p;
	}

	/**
	 * To parse RatesXML (http://rates.fxcm.com/RatesXML) and get the correct Bid price of the currency pair
	 * Sample:
	 *  <Rates>
	 *    <Rate Symbol="EURUSD">
	 *      <Bid>1.10332</Bid>
	 *      <Ask>1.10354</Ask>
	 *      <High>1.10502</High>
	 *      <Low>1.10193</Low>
	 *      <Direction>1</Direction>
	 *      <Last>02:37:31</Last>
	 *    </Rate>
	 *    <Rate Symbol="USDJPY">
	 *      <Bid>112.146</Bid>
	 *      <Ask>112.17</Ask>
	 *      <High>113.066</High>
	 *      <Low>111.957</Low>
	 *      <Direction>-1</Direction>
	 *      <Last>02:37:31</Last>
	 *    </Rate>
	 *  </Rates>
	 *
	 * @param {string} body - the xml string, originally come from http response body
	 * @param {string} from currency
	 * @param {string} to currency
	 * @retun {Promise<{string rate, string timestamp}>} A promise result
	 */
	getRateFromResponseBody(body, from, to) {
		return new Promise((resolve, reject) => {
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
	}
}

module.exports = Forex;
