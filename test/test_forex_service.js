'use strict';

const Forex = require('../lib/forex_service');
const chai = require('chai');
const should = chai.should();
//const expect = chai.expect;
//const assert = chai.assert;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

describe('Forex', function () {
	describe('#getRate()', function () {
		it('Rate should be return', function () {
			let service = new Forex(null);
			let result = service.getRate('USD', 'HKD');
			return result.should.eventually.have.all.keys(['rate', 'timestamp']);
		});
	});
});
