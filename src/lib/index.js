'use strict';
/**
 * The Index file for project.
 * Returns the publish and subscribe methods.
 * 
 * These define the API for a nozomi transport layer.
 * In this case, the transport uses rabbitmq.
 * 
 * @module index
 */

const
	publish = require('./index/publish'),
	subscribe = require('./index/subscribe');

module.exports = {
	/**
	 * Publish
	 * 
	 * @example
	 * let buffer = ...,
	 * 	config = {
	 * 		cloudamqpUrl: 'amqp://localhost'
	 * 	}
	 * index.publish({ eventName: 'test', buffer, config });
	 * 
	 * @param {object} message - { eventName, buffer, config }
	 * @returns {Promise}
	 */
	publish: config => publish.send(config),
	/**
	 * Subscribe
	 * 
	 * @example
	 * let handler = (buffer) => 
	 * 	{
	 * 		console.log(buffer);
	 * 	},
	 * 	config = {
	 * 		cloudamqpUrl: 'amqp://localhost'
	 * 	}
	 * index.subscribe({ eventName: 'test', handler, config });
	 * 
	 * @param {object} subscriberConfig - { eventName, handler, config }
	 * @returns {Promise}
	 */
	subscribe: config => subscribe.handle(config)
};
