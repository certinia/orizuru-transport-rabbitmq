/**
 * Copyright (c) 2017-2019 FinancialForce.com, inc
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

import { Channel, connect as amqpConnect, Connection } from 'amqplib';

import { validate } from './index/optionsValidator';
import { Publisher } from './index/publish';
import { forceSecure } from './index/secure';
import { Subscriber } from './index/subscribe';

export type ExchangeType = 'fanout' | 'topic';

declare global {

	namespace Orizuru {

		interface IHandlerResponse {
			retry: boolean;
		}

		namespace Transport {

			interface IPublish {
				eventName: string;
				exchange?: {
					key?: string;
					keyFunction?: ((options: Orizuru.Transport.IPublish) => string);
					name: string;
					type: ExchangeType;
				};
			}

			interface ISubscribe {
				eventName: string;
				exchange?: {
					key?: string;
					keyFunction?: ((options: Orizuru.Transport.ISubscribe) => string);
					name: string;
					type: ExchangeType;
				};
			}
		}

	}

}

export interface Options {
	prefetch?: number;
	url: string;
	forceSecure?: boolean;
}

export class Transport {

	private readonly options: Options;

	private connection?: Connection;
	private publishChannel?: Channel;
	private subscribeChannel?: Channel;

	constructor(options: Options) {
		validate(options);
		this.options = options.forceSecure
			? forceSecure(options)
			: options;
	}

	/**
	 * Closes the connection.
	 */
	public async close() {
		if (this.publishChannel) {
			await this.publishChannel.close();
		}

		if (this.subscribeChannel) {
			await this.subscribeChannel.close();
		}

		if (this.connection) {
			await this.connection.close();
		}
	}

	/**
	 * Connects to AMQP and creates a publish and subscribe channel.
	 */
	public async connect() {

		// Create a single connection
		if (!this.connection) {
			this.connection = await amqpConnect(this.options.url);
		}

		// Create a single publish channel
		if (!this.publishChannel) {
			this.publishChannel = await this.connection.createChannel();
		}

		// Create a single subscribe channel
		if (!this.subscribeChannel) {
			this.subscribeChannel = await this.connection.createChannel();

			// Set prefetch
			if (this.options.prefetch) {
				this.subscribeChannel.prefetch(this.options.prefetch);
			}
		}

	}

	/**
	 * Publishes a message via AMQP.
	 */
	public async publish(buffer: Buffer, options: Orizuru.Transport.IPublish) {
		if (!this.publishChannel) {
			throw new Error('Transport has not been initialised.');
		}
		const publisher = new Publisher(this.publishChannel);
		await publisher.init(options);
		return publisher.publish(buffer);
	}

	/**
	 * Handles a message from AMQP.
	 */
	public async subscribe(handler: (content: Buffer) => Promise<void | Orizuru.IHandlerResponse>, options: Orizuru.Transport.ISubscribe) {
		if (!this.subscribeChannel) {
			throw new Error('Transport has not been initialised.');
		}
		const subscriber = new Subscriber(this.subscribeChannel);
		await subscriber.init(options);
		return subscriber.subscribe(handler);
	}

}
