'use strict';

const JobConsumer = require('../lib/job_consumer');
const JobProducer = require('../lib/job_producer');
const config = require('../lib/job_config');
const co = require('co');
const chai = require('chai');
const should = chai.should();
//const expect = chai.expect;
//const assert = chai.assert;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

describe('JobConsumer', function () {

	describe('#connect()', function () {
		it('Should be connected', function () {
			let consumer = new JobConsumer();
			let result = consumer.connect(config.beanstalk);
			return result.should.eventually.be.fulfilled;
		});

		it('Should be ok when connecting more than once', function () {
			let consumer = new JobConsumer();
			co(function* () {
				yield consumer.connect(config.beanstalk);
				yield consumer.connect(config.beanstalk);
			});
		});

		it('Is expected to be rejected with wrong config', function () {
			let consumer = new JobConsumer();
			let dummy_config = {
				host: '0.0.10.10',
				port: 999,
				tube: ''
			};
			let result = consumer.connect(dummy_config);
			return result.should.eventually.be.rejected;
		});
	});

	describe('#consumeJob()', function () {
		it('Is expected to be failed without connection', function () {
			let consumer = new JobConsumer();
			let result = consumer.consumeJob();
			return result.should.eventually.be.rejected;
		});

		//it('Is expected to be failed without putting job', function () {
		//	let consumer = new JobConsumer();
		//	let result = co(function* () {
		//		yield consumer.connect(config.beanstalk);
		//		return yield consumer.consumeJob(config.beanstalk.tube);
		//	});
		//	return result.should.eventually.be.rejected;
		//});

		it('Should be run successfully', function () {
			let consumer = new JobConsumer();
			let producer = new JobProducer();
			let result = co(function* () {
				// connect
				yield producer.connect(config.beanstalk);
				yield consumer.connect(config.beanstalk);

				const from_currency = 'USD', to_currency = 'HKD';
				// put
				let job_model = {
					from: from_currency,
					to: to_currency
				};
				yield producer.putJob(job_model, config.beanstalk.tube, config.beanstalk.delay);
				// consume
				let job = yield consumer.consumeJob(config.beanstalk.tube);
				// assert
				job.should.have.a.property('job_id');
				job.should.have.a.property('payload');
				job.should.have.a.deep.property('payload.from', from_currency);
				job.should.have.a.deep.property('payload.to', to_currency);
				yield consumer.cleanUpJob(job.job_id);
			});
			return result.should.eventually.be.fulfilled;
		});
	});
});
