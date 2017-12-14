import mongoose from 'mongoose';

let Schema = mongoose.Schema;
let MsgSchema = new Schema({
	author:		{ type: String },
	message:	{ type: String },
	date:		{ type: Date, default: Date.now }
});

mongoose.model('MsgSchema', MsgSchema);
