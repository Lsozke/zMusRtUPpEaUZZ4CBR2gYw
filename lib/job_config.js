'use strict';

let dev = {
	beanstalk: {
		host: 'challenge.aftership.net',
		port: 11300,
		tube: 'lsozke',	// github username
		delay: 0
	},
	mongodb: {
		//url: 'mongodb://localhost:27017/challenge'
		url: 'mongodb://challenge:12()qwOP@ds013898.mongolab.com:13898/challenge'
	},
	forex: {
		url: ''
	}
};


module.exports = dev;
