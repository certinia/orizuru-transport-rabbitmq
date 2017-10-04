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
	 * let buffer = ...;
	 * index.publish({ eventName: 'test', buffer });
	 * 
	 * @param {object} message - { eventName, buffer }
	 * 
	 */
	publish: config => publish.send(config),
	/**
	 * Subscribe
	 * 
	 * @example
	 * let handler = (buffer) => 
	 * 	{
	 * 		console.log(buffer);
	 * 	};
	 * index.subscribe({ eventName: 'test', handler });
	 * 
	 * @param {object} subscriberConfig - { eventName, handler }
	 */
	subscribe: config => subscribe.handle(config)
};
