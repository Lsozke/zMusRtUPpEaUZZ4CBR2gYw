'use strict';

const co = require('co');
const MongoRateStore = require('../../lib/mongo_rate_store');
const config = require('../../lib/job_config');
const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const assert = chai.assert;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

describe('MongoRateStore', () => {
	let store;

	beforeEach(() => {
		store = new MongoRateStore();
	});

	describe('#connect', function() {
		this.timeout(5000);

		it('is expected to be rejected with invalid Mongodb url', () => {
			// invalid url
			let result = store.connect('xxxxxx://localhost:999999/xxxxxx');
			return result.should.eventually.be.rejected;
		});

		it('should connect', () => {
			let result = store.connect(config.mongodb.url);
			return result.should.eventually.be.fulfilled.then(() => {
				store.should.have.property('db');
			});
		});
	});

	describe('#persist', function() {
		this.timeout(10000);

		it('should save the value', () => {
			let result = co(function* () {
				// make connection
				yield store.connect(config.mongodb.url);
				// save record
				let payload = {test: true};
				yield store.persist(payload);
				// close connection
				store.close();
			});
			return result.should.eventually.be.fulfilled;
		});

		it('is expected to fail with duplicated key', () => {
			let result = co(function* () {
				// make connection
				yield store.connect('mongodb://localhost:27017/challenge');
				// save record with same id twice
				let payload = {_id: '56cae36589fadad62e83953a', test: true};
				yield store.persist(payload);
				yield store.persist(payload);
				// close connection
				store.close();
			});
			return result.should.eventually.be.rejected;
		});
	});
});
