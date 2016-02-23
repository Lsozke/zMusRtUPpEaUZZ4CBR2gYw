'use strict';

const MongoClient = require('mongodb').MongoClient;

/**
 * To store exchange rate into MongoDB
 */
class MongoRateStore {
	/**
	 * @constructor
	 */
	constructor() {
		this.db = null;
	}

	/**
	 * To connect to a MongoDB
	 * @param url MongoDB URL
	 * @returns {Promise} A promise to return when connected
	 */
	connect(url) {
		let instance = this;
		let p = new Promise((resolve, reject) => {
			MongoClient.connect(url, (err, db) => {
				if(err) {
					reject(err);
				} else {
					instance.db = db;
					resolve();
				}
			}); // connect
		});
		return p;
	}

	/**
	 *
	 * @param {object} rate_model
	 * @param {string} rate_model.from
	 * @param {string} rate_model.to
	 * @param {string} rate_model.rate
	 * @param {Date} rate_model.created_at
	 * @returns {Promise}
	 */
	persist(rate_model) {
		let instance = this;
		let p = new Promise((resolve, reject) => {
			let collection = instance.db.collection('rates');
			collection.insertOne(rate_model, null, (err, result) => {
				if (err) {
					//console.log('rates.insert failed', err);
					reject(err);
				} else {
					//console.log('rates.insert done');
					resolve(result);
				}
			});
		});
		return p;
	}

	/**
	 * Close connection
	 */
	close() {
		if (this.db) {
			this.db.close();
			this.db = null;
			console.log('closed');
		}
	}
}

module.exports = MongoRateStore;
