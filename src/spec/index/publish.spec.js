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
	root = require('app-root-path'),
	proxyquire = require('proxyquire'),
	chai = require('chai'),
	sinonChai = require('sinon-chai'),
	sinon = require('sinon'),
	chaiAsPromised = require('chai-as-promised'),

	mocks = {},

	expect = chai.expect;

let
	publish;

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('index/publish.js', () => {

	beforeEach(() => {
		mocks.amqp = {
			connect: sinon.stub()
		};

		mocks.connection = {
			createChannel: sinon.stub(),
			close: sinon.stub()
		};

		mocks.channel = {
			sendToQueue: sinon.stub()
		};

		mocks.amqp.connect.resolves(mocks.connection);
		mocks.connection.createChannel.resolves(mocks.channel);

		mocks.channel.sendToQueue.resolves(true);

		publish = proxyquire(root + '/src/lib/index/publish', {
			amqplib: mocks.amqp
		});
	});

	afterEach(() => {
		sinon.restore();
	});

	describe('send', () => {

		it('should send to the queue', async () => {

			// given
			const
				eventName = 'TestTopic',
				buffer = 'TestBuffer',
				config = {
					cloudamqpUrl: 'amqp://localhost'
				};

			// when
			await publish.send({ eventName, buffer, config });

			expect(mocks.amqp.connect).to.have.been.calledOnce;
			expect(mocks.amqp.connect).to.have.been.calledWith(config.cloudamqpUrl);
			expect(mocks.connection.createChannel).to.have.been.calledOnce;
			expect(mocks.channel.sendToQueue).to.be.calledOnce;
			expect(mocks.channel.sendToQueue).to.be.calledWith(eventName, buffer);
		});

		it('should reuse connections and channels', async () => {

			// given
			const
				eventName = 'TestTopic',
				buffer = 'TestBuffer',
				config = {
					cloudamqpUrl: 'amqp://localhost'
				};

			// when
			publish.send({ eventName, buffer, config });
			await publish.send({ eventName, buffer, config });

			expect(mocks.amqp.connect).to.have.been.calledOnce;
			expect(mocks.amqp.connect).to.have.been.calledWith(config.cloudamqpUrl);
			expect(mocks.connection.createChannel).to.have.been.calledOnce;
			expect(mocks.channel.sendToQueue).to.have.been.calledTwice;
		});

	});

	describe('close', () => {

		it('should call close', async () => {

			// given
			const
				eventName = 'TestTopic',
				buffer = 'TestBuffer',
				config = {
					cloudamqpUrl: 'amqp://localhost'
				};

			// when
			await publish.send({ eventName, buffer, config });
			await publish.close();

			expect(mocks.connection.close).to.have.been.calledOnce;
		});

		it('should tolerate no connection', async () => {

			// Given - When
			await publish.close();

			// Then
			expect(mocks.connection.close).to.have.not.been.called;
		});

	});

	describe('emitter', () => {

		let errorEvents = [];

		const listener = message => {
			errorEvents.push(message);
		};

		beforeEach(() => {
			publish.emitter.addListener(publish.emitter.ERROR, listener);
		});

		afterEach(() => {
			publish.emitter.removeListener(publish.emitter.ERROR, listener);
			errorEvents = [];
		});

		describe('should emit an error event', () => {

			it('if publish throws an error', () => {

				// given
				const
					eventName = 'TestTopic',
					buffer = 'TestBuffer',
					config = {
						cloudamqpUrl: 'amqp://localhost'
					};

				mocks.channel.sendToQueue.rejects(new Error('test error'));

				// when - then
				return expect(publish.send({ eventName, buffer, config })).to.be.rejected.then(() => {
					expect(errorEvents).to.include('test error');
				});

			});

		});

	});

});
