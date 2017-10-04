'use strict';

const
	Amqp = require('./shared/amqp'),

	send = ({ eventName, buffer, config }) => {
		return Amqp.apply(channel => channel.sendToQueue(eventName, buffer), config);
	};

module.exports = {
	send
};
