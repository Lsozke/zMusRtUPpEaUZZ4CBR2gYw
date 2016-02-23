'use strict';

const co = require('co');
const MongoRateStore = require('../lib/mongo_rate_store');
const chai = require('chai');
const should = chai.should();
//const expect = chai.expect;
const assert = chai.assert;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

describe('MongoRateStore', () => {
	const MONGO_URL = 'mongodb://challenge:12()qwOP@ds013898.mongolab.com:13898/challenge';
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
			let result = store.connect(MONGO_URL);
			return result.should.eventually.be.fulfilled;
		});
	});

	describe('#persist', function() {
		this.timeout(10000);

		it('should save the value', () => {
			let result = co(function* () {
				// make connection
				yield store.connect(MONGO_URL);
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
