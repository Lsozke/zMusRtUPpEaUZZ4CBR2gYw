'use strict';

const ExitStrategy = require('../lib/job_exit_strategy');
const chai = require('chai');
const should = chai.should();
// const expect = chai.expect;
// const assert = chai.assert;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

describe('ExitStrategy', function () {
	describe('#shouldExit()', function () {
		it('Should exit with error when failCount >= maxFail', function () {
			ExitStrategy.shouldExit(10, 3, 0, 3).should.equal(-1);
			ExitStrategy.shouldExit(10, 3, 0, 4).should.equal(-1);
			ExitStrategy.shouldExit(10, 3, 10, 3).should.equal(-1);
			ExitStrategy.shouldExit(10, 3, 11, 3).should.equal(-1);
		});

		it('Should exit normally when successCount >= maxSuccess', function () {
			ExitStrategy.shouldExit(10, 3, 10, 0).should.equal(1);
			ExitStrategy.shouldExit(10, 3, 11, 0).should.equal(1);
			ExitStrategy.shouldExit(10, 3, 11, 2).should.equal(1);
		});

		it('Should not exit when successCount < maxSuccess && failCount < maxFail', function () {
			ExitStrategy.shouldExit(10, 3, 0, 0).should.equal(0);
			ExitStrategy.shouldExit(10, 3, 9, 0).should.equal(0);
			ExitStrategy.shouldExit(10, 3, 9, 2).should.equal(0);
			ExitStrategy.shouldExit(10, 3, 0, 2).should.equal(0);
		});

	});
});
