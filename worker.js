'use strict';
const co = require('co');
const config = require('./lib/job_config');
const JobConsumer = require('./lib/job_consumer');
const JobProducer = require('./lib/job_producer');
const ExitStrategy = require('./lib/job_exit_strategy');
const Forex = require('./lib/forex_service');
const MongoRateStore = require('./lib/mongo_rate_store');

let consumer = new JobConsumer(config.beanstalk);
let producer = new JobProducer(config.beanstalk);
let forex = new Forex(config.forex);
let data_store = new MongoRateStore(config.mongodb);

const MAX_SUCCESS = 10;
const MAX_FAIL = 3;
const DELAY_SUCCESS = 60; // seconds
const DELAY_FAIL = 3; // seconds

co(function* () {
	// init all connections in parallel
	let res = yield [
		consumer.connect(config.beanstalk),
		producer.connect(config.beanstalk),
		data_store.connect(config.mongodb.url)
	];
	console.log(res.length + ' services connected');

	// run
	while (true) {
		// blocking until a job is returned
		console.log('Waiting for a job...');
		let job = yield consumer.consumeJob(config.beanstalk.tube);
		console.log('Job received', job);
		// rate to store the retrieved exchange rate
		let rate = null;
		try {
			// retrieve exchange rate
			console.log('Try get Exchange Rate ' + job.payload.from + ':' + job.payload.to);
			rate = yield forex.getRate(job.payload.from, job.payload.to, config.forex);
			console.log('Exchange Rate received', rate);
		} catch (err) {
			// a null object indicates that it is failed to retrieve
			rate = null;
			console.log('Fail to get Exchange Rate', err);
		}
		if (rate) {
			// store exchange rate data if exists
			let rateModel = {
				from: job.payload.from,
				to: job.payload.to,
				rate: rate.rate.toFixed(2),	// requirement, round to 2 d.p.
				created_at: rate.timestamp
			};
			console.log('Try save to DB');
			yield data_store.persist(rateModel);
			console.log('Saved');
			// increase success attempts
			job.payload.successAttempts = (job.payload.successAttempts || 0) + 1;
		} else {
			// increase failure attempts
			job.payload.failAttempts = (job.payload.failAttempts || 0) + 1;
		}
		console.log('Job Attempts Success/Fail = ' + job.payload.successAttempts + '/' + job.payload.failAttempts);

		let exitCode = ExitStrategy.shouldExit(MAX_SUCCESS, MAX_FAIL, job.payload.successAttempts, job.payload.failAttempts);
		switch (exitCode) {
			case -1: // error
				console.log('Job failed with failAttempts=' + job.payload.failAttempts);
				console.log('Bury the job', job.job_id);
				// bury the job
				yield consumer.buryJob(job.job_id);
				break;
			case 1:	// normal exit
				console.log('Job failed with successAttempts=' + job.payload.successAttempts);
				// nothing more for this job
				// clean up
				yield consumer.cleanUpJob(job.job_id);
				break;
			case 0: // not exit
				console.log('Re-put the Job, queue for next attempt', job.payload);
				// clean up
				yield consumer.cleanUpJob(job.job_id);
				// re-put the job with delay
				// delay depends on rate data existence
				producer.putJob(job.payload, config.beanstalk.tube, rate ? DELAY_SUCCESS : DELAY_FAIL);
				break;
		}
		// iterate to next watching loop
	}
}).catch((err) => {
	console.error(err.stack);
});
