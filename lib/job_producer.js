'use strict';

const fivebeans = require('fivebeans');
const Promise = require('bluebird');

/**
 * To put an exchange rate job into beanstalkd
 */
class JobProducer {
	/**
	 * @constructor
	 */
	constructor() {
		this.client = null;	// alternatives for class variable
	}

	/**
	 * Make connection to beanstalkd
	 * @param {Object} beanstalk_config
	 * @param {string} beanstalk_config.host
	 * @param {number} beanstalk_config.port
	 * @param {string} beanstalk_config.tube
	 * @returns {Promise} A promise to return when connected
	 */
	connect(beanstalk_config) {
		let instance = this;
		let p = new Promise((resolve, reject) => {
			if (instance.client) {
				// reuse existing connection
				resolve(instance.client);
			} else {
				// create beanstalk connection
				instance.client = new fivebeans.client(beanstalk_config.host, beanstalk_config.port);
				instance.client
					.on('connect', () => {
						// client can now be used
						//console.log('beanstalk connected');
						// use specific tube
						instance.client.use(beanstalk_config.tube, (err, tubename) => {
							if (err) {
								reject(err);
							} else {
								resolve();
							}
						});
					})
					.on('error', reject)	// connection fail
					.on('close', () => {
						instance.client = null;
					})	// underlying connection has closed
					.connect();
			}	// end if
		});

		return p;
	}

	/**
	 * Create a job payload in beanstalk
	 * @param {object} job - Job Model
	 * @param {string} job.from - From Currency
	 * @param {string} job.to - To Currency
	 * @param {number} [job.successAttempts] - Successful attempts previously
	 * @param {number} [job.failAttempts] - Failed attempts previously
	 *
	 * @param {string} tube_name - Beanstalk tube name
	 * @param {number} delay - Delay for job
	 * @return {Promise<string>} A promise with job_id if resolved
	 */
	putJob(job, tube_name, delay) {
		let instance = this;
		let p = new Promise((resolve, reject) => {
			if (instance.client) {
				instance.client.use(tube_name, (err_use, tubename) => {
					if (err_use) {
						reject(err_use);
					} else {
						// put job into queue
						instance.client.put(100, delay, 120, JSON.stringify(job), (err_put, job_id) => {
							if (err_put) {
								reject(err_put);
							} else {
								resolve(job_id);
							}
						});
					}
				});
			} else {
				reject('Not yet connected');
			}
		});

		return p;
	}
}

module.exports = JobProducer;
