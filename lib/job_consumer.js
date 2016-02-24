'use strict';

const fivebeans = require('fivebeans');
const Promise = require('bluebird');

/**
 * Watch and reserve a job from beanstalkd server
 */
class BeanstalkJobConsumer {
	/**
	 * @constructor
	 */
	constructor() {
		this.client = null;
	}

	/**
	 * Make connection to beanstalkd
	 * @param {Object} beanstalk_config
	 * @param {string} beanstalk_config.host
	 * @param {number} beanstalk_config.port
	 * @param {string} beanstalk_config.tube
	 * @returns {Promise<null>} A promise to return when connected
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
	 * Consume a job payload in beanstalk
	 * @return Promise A promise to resolve with
	 */
	consumeJob(tube_name) {
		let instance = this;
		let p = new Promise((resolve, reject) => {
			if (instance.client) {
				instance.client.watch(tube_name, (err_watch, num_watched) => {
					if (err_watch) {
						console.log('err_watch', err_watch);
						reject(err_watch);
					} else {
						//console.log('start reserve @' + tube_name);
						instance.client.reserve((err_reserve, job_id, payload) => {
							//console.log('Job ' + job_id + ' in progress');
							if (err_reserve) {
								console.log('err_reserve', err_reserve);
								reject(err_reserve);
							} else {
								var parsed = JSON.parse(payload);
								//console.log('parsed payload', parsed);
								resolve({job_id: job_id, payload: parsed});
							}
						});
					}
				});
			} else {
				console.log('not connected');
				reject('Not yet connected');
			}
		});

		return p;
	}

	/**
	 * Clean up a job, i.e. beanstalkd.destroy
	 * @param job_id
	 * @returns {Promise} A promise
	 */
	cleanUpJob(job_id) {
		let instance = this;
		let p = new Promise((resolve, reject) => {
			if (instance.client) {
				// clean up
				instance.client.destroy(job_id, (err) => {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				});
			} else {
				reject('Not yet connected');
			}
		});

		return p;
	}

	/**
	 * Bury a job
	 * @param job_id
	 * @returns {Promise}
	 */
	buryJob(job_id) {
		let instance = this;
		let p = new Promise((resolve, reject) => {
			if (instance.client) {
				// bury
				instance.client.bury(job_id, 0, (err) => {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				});
			} else {
				reject('Not yet connected');
			}
		});

		return p;
	}
}

module.exports = BeanstalkJobConsumer;
