'use strict';

var Mongoose  = require('mongoose');


var RoomSchema = new Mongoose.Schema({
    tgId: { type: String, required: true},
    phone: { type: String, required: true},
});

var phoneModel = Mongoose.model('phone', RoomSchema);

module.exports = phoneModel;
