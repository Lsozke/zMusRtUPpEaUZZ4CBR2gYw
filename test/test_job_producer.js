'use strict';

const JobProducer = require('../lib/job_producer');
const config = require('../lib/job_config');
const co = require('co');
const chai = require('chai');
const should = chai.should();
// const expect = chai.expect;
// const assert = chai.assert;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

describe('JobProducer', function () {
	describe('#connect()', function () {
		it('Should be connected', function () {
			let producer = new JobProducer();
			let result = producer.connect(config.beanstalk);
			return result.should.eventually.be.fulfilled;
		});
		it('Is expected to be rejected with wrong config', function () {
			let producer = new JobProducer();
			let dummy_config = {
				host: '0.0.10.10',
				port: 999,
				tube: ''
			};
			let result = producer.connect(dummy_config);
			return result.should.eventually.be.rejected;
		});
	});

	describe('#putJob', function () {
		it('Is expected to be failed without connection', function () {
			let producer = new JobProducer();
			let job_model = {
				from: 'USD',
				to: 'HKD'
			};
			let result = producer.putJob(job_model, config.beanstalk.tube, config.beanstalk.delay);
			return result.should.eventually.be.rejected;
		});

		it('A job should be put into beanstalk tube', function () {
			let producer = new JobProducer();
			let result = co(function* () {
				yield producer.connect(config.beanstalk);
				let job_model = {
					from: 'USD',
					to: 'HKD'
				};
				return yield producer.putJob(job_model, config.beanstalk.tube, config.beanstalk.delay);
			});
			return result.should.eventually.be.a('string');
		});
	});
});
