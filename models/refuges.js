const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const RefugeeSchema = new Schema({
    username: { type: String, required: true, unique: [ true, 'ID Number already exist' ] },
    fullName: { type: String, required: true},
    gender: { type: String, required: true},
    dob: { type: String, required: true},
    typeOfOrphan: { type: String, required: true},
    stateOfOrigin: { type: String, required: true},
    lga: { type: String, required: true},
    mothersName: { type: String, required: true},
    fathersName: { type: String, required: true},
    address: { type: String},
    image: { type: String, default: 'null' },
    admin: { type: Boolean, default: false },

}, { timestamps: true });

//plugin passport-local-mongoose to enable password hashing and salting and other things
RefugeeSchema.plugin(passportLocalMongoose);

//connect the schema with user table
const Refugee = mongoose.model('refugee', RefugeeSchema);

//export the model 
module.exports = Refugee;