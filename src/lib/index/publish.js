/**
 * Copyright (c) 2017-2018 FinancialForce.com, inc
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, 
 *   are permitted provided that the following conditions are met:
 *
 * - Redistributions of source code must retain the above copyright notice, 
 *      this list of conditions and the following disclaimer.
 * - Redistributions in binary form must reproduce the above copyright notice, 
 *      this list of conditions and the following disclaimer in the documentation 
 *      and/or other materials provided with the distribution.
 * - Neither the name of the FinancialForce.com, inc nor the names of its contributors 
 *      may be used to endorse or promote products derived from this software without 
 *      specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
 *  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES 
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL 
 *  THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, 
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
 *  OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 *  OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **/

'use strict';

const
	_ = require('lodash'),
	amqp = require('amqplib'),
	{ validate } = require('./shared/configValidator'),

	EventEmitter = require('events'),

	ERROR_EVENT = 'error_event',

	emitter = new EventEmitter(),

	publishers = new Map();

class Publisher {

	constructor(config) {
		validate(config);
		this.config = _.cloneDeep(config);
	}

	async init() {
		this.connection = await amqp.connect(this.config.cloudamqpUrl);
		this.channel = await this.connection.createChannel();
	}

	async publish(queue, buffer) {
		return await this.channel.sendToQueue(queue, buffer);
	}

	async close() {
		await this.connection.close();
	}

	static async newPublisher(config) {
		const publisher = new Publisher(config);
		await publisher.init();
		return publisher;
	}

}

async function send({ eventName, buffer, config }) {

	try {
		let publisherPromise = publishers.get(config),
			publisher = null;

		if (!publisherPromise) {
			publisherPromise = Publisher.newPublisher(config);
			publishers.set(config, publisherPromise);
		}

		publisher = await publisherPromise;
		return await publisher.publish(eventName, buffer);
	} catch (err) {
		emitter.emit(ERROR_EVENT, err.message);
		throw err;
	}
}

async function close() {
	for (const entry of publishers) {
		// Entry 1 is the Map's value.
		const publisher = await entry[1];
		await publisher.close();
	}
}

emitter.ERROR = ERROR_EVENT;

module.exports = {
	send,
	close,
	emitter
};
