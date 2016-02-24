'use strict';

const co = require('co');
const Forex = require('../lib/forex_service');
const sinon = require('sinon');
const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const assert = chai.assert;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);


describe('Forex', () => {
	let forex;

	before(() => {
		forex = new Forex();
	});

	describe('#getRateFromRsponseBody()', function () {
		const mock_xml =
				'<Rates>' +
				'<Rate Symbol="EURUSD"><Bid>1.10332</Bid><Ask>1.10354</Ask><High>1.10502</High><Low>1.10193</Low><Direction>1</Direction><Last>02:37:31</Last></Rate>' +
				'<Rate Symbol="USDJPY"><Bid>112.146</Bid> <Ask>112.17</Ask> <High>113.066</High> <Low>111.957</Low> <Direction>-1</Direction> <Last>02:37:31</Last></Rate>' +
				'</Rates>';

		it('Should get rate in first entry', function () {
			let result = forex.getRateFromResponseBody(mock_xml, 'EUR', 'USD');
			return result.should.eventually.have.all.keys(['rate', 'timestamp']).then((data) => {
				expect(data.rate).equal(1.10332);
			});
		});

		it('Should get rate in second entry', function () {
			let result = forex.getRateFromResponseBody(mock_xml, 'USD', 'JPY');
			return result.should.eventually.have.all.keys(['rate', 'timestamp']).then((data) => {
				expect(data.rate).equal(112.146);
			});
		});

		it('Should be rejected with non-exist currency pair', function () {
			let result = forex.getRateFromResponseBody(mock_xml, 'ABC', 'DEF');
			return result.should.eventually.be.rejected;
		});
	});

});