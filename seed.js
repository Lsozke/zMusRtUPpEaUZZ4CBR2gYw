'use strict';

const co = require('co');
const config = require('./lib/job_config');
const JobProducer = require('./lib/job_producer');

let producer = new JobProducer(config.beanstalk);

function onError(err) {
	// log any uncaught errors
	console.error(err.stack);
}

// default parameters
var from = process.argv[2] || 'USD';
var to = process.argv[3] || 'HKD';

co(function* () {
	yield producer.connect(config.beanstalk);
	console.log('Service connected');
	let job_model = {
		from: from,
		to: to
	};
	console.log('Try to put a job', job_model);
	yield producer.putJob(job_model, config.beanstalk.tube, config.beanstalk.delay);
	console.log('Done');
}).then(() => {
	process.exit(1);
}).catch(onError);

