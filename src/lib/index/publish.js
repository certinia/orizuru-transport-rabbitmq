'use strict';

const
	Amqp = require('./shared/amqp'),

	send = ({ eventName, buffer }) => {
		return Amqp.apply(channel => channel.sendToQueue(eventName, buffer));
	};

module.exports = {
	send
};
