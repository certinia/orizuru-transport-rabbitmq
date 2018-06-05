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

/**
 * The Index file for project.
 * Returns the publish and subscribe methods.
 *
 * These define the API for a transport layer.
 * In this case, the transport uses rabbitmq.
 *
 * @module index
 */

import * as amqp from 'amqplib';

import { ITransport, Options as OrizuruOptions } from '@financialforcedev/orizuru';

import { default as validate } from './index/configValidator';
import Publisher from './index/publish';
import Subscriber from './index/subscribe';

export function createTransport(): ITransport {

	let connection: amqp.Connection;
	let publishChannel: amqp.Channel;
	let subscribeChannel: amqp.Channel;

	async function close() {
		connection.close();
	}

	async function connect(options: OrizuruOptions.Transport.IConnect & Options.IConnect) {

		// Create a single connection
		if (!connection) {
			validate(options);
			connection = await amqp.connect(options.url);
		}

		// Create a single publish channel
		if (!publishChannel) {
			publishChannel = await connection.createChannel();
		}

		// Create a single subscribe channel
		if (!subscribeChannel) {
			subscribeChannel = await connection.createChannel();

			// Set prefetch
			if (options.prefetch) {
				subscribeChannel.prefetch(options.prefetch);
			}
		}

		return true;

	}

	async function publish(buffer: Buffer, options: OrizuruOptions.Transport.IPublish & Options.IPublish) {
		const publisher = new Publisher(publishChannel);
		await publisher.init(options);
		return publisher.publish(buffer);
	}

	async function subscribe(handler: (content: Buffer) => Promise<void>, options: OrizuruOptions.Transport.ISubscribe & Options.ISubscribe) {
		const subscriber = new Subscriber(subscribeChannel);
		await subscriber.init(options);
		return subscriber.subscribe(handler, options);
	}

	return {
		close,
		connect,
		publish,
		subscribe
	};

}

export declare namespace Options {

	export interface IConnect {
		prefetch?: number;
	}

	export interface IPublish {
		exchange?: {
			key?: string;
			keyFunction?: ((options: IPublish) => string);
			name?: string;
			type?: string;
		};
	}

	export interface ISubscribe {
		exchange?: {
			key?: string;
			keyFunction?: ((options: ISubscribe) => string);
			name: string;
			type?: string;
		};
	}

}
