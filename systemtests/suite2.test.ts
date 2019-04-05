/*
 * Copyright (c) 2019, FinancialForce.com, inc
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

import chai from 'chai';

import axios from 'axios';

import { Transport } from '../src/index';

const expect = chai.expect;

describe('Suite 2 - Subscribing to messages with and without an SSL connection', () => {

	let transport: Transport;

	const queueName = 'api.test';
	const exchange1 = 'test.exchange1';
	const exchange2 = 'test.exchange2';
	const exchangeQueueName1 = 'exchange.api.test1';
	const exchangeQueueName2 = 'exchange.api.test2';

	beforeAll(async () => {

		try {

			const purgeQueues = [queueName, exchangeQueueName1, exchangeQueueName2].map((currentQueueName) => {
				return axios.delete(`http://guest:guest@localhost:15672/api/queues/%2F/${currentQueueName}/contents`);
			});

			await Promise.all(purgeQueues);

		} catch {
			// Ignore - this is included so that if a previous system test run has failed the data is cleaned up
		}

	});

	afterEach(async () => {
		await transport.close();
	});

	describe('non-SSL connection', () => {

		beforeEach(async () => {

			transport = new Transport({
				url: 'amqp://localhost'
			});

			await transport.connect();

		});

		it('should subscribe to a message queue', (done) => {

			// Given
			const handler = async (content: Buffer) => {
				// Then
				expect(content.toString()).to.eql('test1');
				done();
			};

			// When
			// Then
			transport
				.publish(Buffer.from('test1'), {
					eventName: queueName
				})
				.then(() => {
					return transport.subscribe(handler, {
						eventName: queueName
					});
				});

		});

		it('should subscribe to a message queue when a message is published to an exchange', (done) => {

			// Given
			const handler = async (content: Buffer) => {
				// Then
				expect(content.toString()).to.eql('test2');
				done();
			};

			// When
			// Then
			transport
				.subscribe(handler, {
					eventName: exchangeQueueName1,
					exchange: {
						name: exchange1,
						type: 'fanout'
					}
				})
				.then(() => {
					return transport.publish(Buffer.from('test2'), {
						eventName: exchangeQueueName1,
						exchange: {
							name: exchange1,
							type: 'fanout'
						}
					});
				});

		});

	});

	describe('SSL connection', () => {

		beforeEach(async () => {

			transport = new Transport({
				forceSecure: true,
				socketOptions: {
					rejectUnauthorized: false
				},
				url: 'amqp://localhost'
			});

			await transport.connect();

		});

		it('should subscribe to a message queue', (done) => {

			// Given
			const handler = async (content: Buffer) => {
				// Then
				expect(content.toString()).to.eql('test3');
				done();
			};

			// When
			// Then
			transport
				.publish(Buffer.from('test3'), {
					eventName: queueName
				})
				.then(() => {
					return transport.subscribe(handler, {
						eventName: queueName
					});
				});

		});

		it('should subscribe to a message queue when a message is published to an exchange', (done) => {

			// Given
			const handler = async (content: Buffer) => {
				// Then
				expect(content.toString()).to.eql('test4');
				done();
			};

			// When
			// Then
			transport
				.subscribe(handler, {
					eventName: exchangeQueueName2,
					exchange: {
						name: exchange2,
						type: 'fanout'
					}
				})
				.then(() => {
					return transport.publish(Buffer.from('test4'), {
						eventName: exchangeQueueName2,
						exchange: {
							name: exchange2,
							type: 'fanout'
						}
					});
				});

		});

	});

});
