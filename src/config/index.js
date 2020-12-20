'use strict';

var init = function () {

	if(process.env.NODE_ENV === 'production') {
		return {
			db: {
				username: process.env.dbUsername,
				password: process.env.dbPassword,
				host: process.env.dbHost,
				name: process.env.dbName
			}
		}
	}
	else {
		return require('./config.json');
	}
}

module.exports = init();
