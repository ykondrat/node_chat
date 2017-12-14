import mongoose from 'mongoose';
import './models/MsgSchema.js';
import config from '../config/config.json';

let MsgSchema = mongoose.model('MsgSchema');

export function setConnection() {
	mongoose.connect(`mongodb://${config.db.host}:${config.db.port}/${config.db.name}`);
}

export function listOfAllMsg() {
	return (MsgSchema.find());
}

export function saveMsg(data) {
	let msg = new MsgSchema({
		author:		data.author,
		message:	data.message,
		date:		new Date
	});

	return (msg.save());
}

export function getMsgById(id) {
	return (MsgSchema.findById(id));
}

export function getCount() {
	return (MsgSchema.count());
}

export function getMsglimit(index) {
	return (MsgSchema.find().skip(index * 10).limit(10));
}

export function updateMsg(id, data) {
	return (Film.findByIdAndUpdate(id, data, { new: true }));
}
