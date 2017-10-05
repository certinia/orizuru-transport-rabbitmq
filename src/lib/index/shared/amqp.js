'use strict';

const
	amqp = require('amqplib'),
	{ validate } = require('./configValidator');

let connection;

class Amqp {

	static apply(action, config) {
		validate(config);

		return Promise.resolve()
			.then(() => {
				// Use the connection if created earlier
				// (lazy loading)
				if (connection) {
					return connection;
				}

				// Create a new RabbitMQ connection
				return amqp.connect(config.cloudamqpUrl)
					.then(newConnection => {
						connection = newConnection;
						return connection;
					});
			})
			.then(connection => {
				// Create a RabbitMQ channel
				return connection.createChannel();
			})
			.then(channel => {
				// Invoke the action callback on the
				// new channel 
				return action(channel);
			});
	}

}

module.exports = Amqp;
