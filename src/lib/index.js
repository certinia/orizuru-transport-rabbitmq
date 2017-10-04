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
	 * TODO
	 * 
	 * @param {object} message - { eventName, buffer }
	 * 
	 */
	publish: publish.send,
	/**
	 * Subscribe
	 * 
	 * @example
	 * TODO
	 * 
	 * @param {object} subscriberConfig - { eventName, handler }
	 */
	subscribe: subscribe.handle
};
