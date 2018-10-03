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
 */

import { Channel } from 'amqplib';

/**
 * @private
 */
export class Publisher {

	private readonly channel: Channel;
	private publishFunction?: ((buffer: Buffer) => boolean);

	constructor(channel: Channel) {
		this.channel = channel;
	}

	public async init(options: Orizuru.Transport.IPublish) {

		if (options.exchange) {

			const exchange = options.exchange;
			const name = exchange.name as string;
			const type = exchange.type || 'fanout';
			const key = exchange.key || exchange.keyFunction && exchange.keyFunction(options) || '';

			// Ensure the exchange exists
			await this.channel.assertExchange(name, type, { durable: false });

			this.publishFunction = (buffer: Buffer) => {
				return this.channel.publish(name, key, buffer);
			};

		} else {

			const eventName = options.eventName as string;

			// Ensure the queue exists
			await this.channel.assertQueue(eventName);

			this.publishFunction = (buffer: Buffer) => {
				return this.channel.sendToQueue(eventName, buffer);
			};

		}

	}

	public async publish(buffer: Buffer) {
		if (!this.publishFunction) {
			throw new Error('Publisher has not been initialised.');
		}
		return this.publishFunction(buffer);
	}

}
