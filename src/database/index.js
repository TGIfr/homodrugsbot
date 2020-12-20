'use strict';

var config 		= require('../config');
var Mongoose 	= require('mongoose');


// Connect to the database
// construct the database URI and encode username and password.

var dbURI = "mongodb+srv://" +
			encodeURIComponent(config.db.username) + ":" +
			encodeURIComponent(config.db.password) + "@" +
			config.db.host + "/" +
			config.db.name + "?retryWrites=true&w=majority";

Mongoose.connect(dbURI, { useNewUrlParser: true , useUnifiedTopology: true} );

// Throw an error if the connection fails
Mongoose.connection.on('error', function(err) {
	if(err) throw err;
});

// mpromise (mongoose's default promise library) is deprecated,
// Plug-in your own promise library instead.
// Use native promises
Mongoose.Promise = global.Promise;


module.exports = { Mongoose,
	models: {
		phone: require('./schemas/phone.js'),
	}
};
