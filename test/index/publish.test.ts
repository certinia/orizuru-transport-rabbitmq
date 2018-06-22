/**
 * Copyright (c) 2018 FinancialForce.com, inc
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
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import Publisher from '../../src/index/publish';

const expect = chai.expect;

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('index/publish.ts', () => {

	let channel: any;

	beforeEach(() => {
		channel = {
			assertExchange: sinon.stub(),
			assertQueue: sinon.stub(),
			publish: sinon.stub(),
			sendToQueue: sinon.stub()
		};
	});

	afterEach(() => {
		sinon.restore();
	});

	describe('publish', () => {

		it('should throw an error if the publisher has not been initialised', () => {

			// Given
			const buffer = new Buffer('test');

			const publish = new Publisher(channel);

			// When
			return expect(publish.publish(buffer)).to.eventually.be.rejectedWith('Publisher has not been initialised.')
				.then(() => {
					// Then
					expect(channel.assertExchange).to.not.have.been.called;
					expect(channel.publish).to.not.have.been.called;
					expect(channel.sendToQueue).to.not.have.been.called;
				});

		});

		it('should publish to a queue', async () => {

			// Given
			const buffer = new Buffer('test');

			const options = {
				eventName: 'test'
			};

			const publish = new Publisher(channel);
			await publish.init(options);

			// When
			publish.publish(buffer);

			// Then
			expect(channel.sendToQueue).to.have.been.calledOnce;
			expect(channel.sendToQueue).to.have.been.calledWith('test', buffer);
			expect(channel.assertExchange).to.not.have.been.called;

		});

		it('should publish to a fanout exchange', async () => {

			// Given
			const buffer = new Buffer('test');

			const options = {
				eventName: 'test',
				exchange: {
					name: 'exchange1'
				}
			};

			const publish = new Publisher(channel);
			await publish.init(options);

			// When
			await publish.publish(buffer);

			// Then
			expect(channel.assertExchange).to.have.been.calledOnce;
			expect(channel.assertExchange).to.have.been.calledWith('exchange1', 'fanout', { durable: false });
			expect(channel.publish).to.have.been.calledOnce;
			expect(channel.publish).to.have.been.calledWith('exchange1', '', buffer);
			expect(channel.sendToQueue).to.not.have.been.called;

		});

		it('should publish to a topic exchange', async () => {

			// Given
			const buffer = new Buffer('test');

			const options = {
				eventName: 'test',
				exchange: {
					key: 'testKey',
					name: 'exchange1',
					type: 'topic'
				}
			};

			const publish = new Publisher(channel);
			await publish.init(options);

			// When
			await publish.publish(buffer);

			// Then
			expect(channel.assertExchange).to.have.been.calledOnce;
			expect(channel.assertExchange).to.have.been.calledWith('exchange1', 'topic', { durable: false });
			expect(channel.publish).to.have.been.calledOnce;
			expect(channel.publish).to.have.been.calledWith('exchange1', 'testKey', buffer);
			expect(channel.sendToQueue).to.not.have.been.called;

		});

		it('should publish to a topic exchange using the keyFunction', async () => {

			// Given
			const buffer = new Buffer('test');

			const options = {
				eventName: 'test',
				exchange: {
					keyFunction: () => {
						return 'testKey';
					},
					name: 'exchange1',
					type: 'topic'
				}
			};

			const publish = new Publisher(channel);
			await publish.init(options);

			// When
			await publish.publish(buffer);

			// Then
			expect(channel.assertExchange).to.have.been.calledOnce;
			expect(channel.assertExchange).to.have.been.calledWith('exchange1', 'topic', { durable: false });
			expect(channel.publish).to.have.been.calledOnce;
			expect(channel.publish).to.have.been.calledWith('exchange1', 'testKey', buffer);
			expect(channel.sendToQueue).to.not.have.been.called;

		});

	});

});
