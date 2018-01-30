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
	chaiAsPromised = require('chai-as-promised'),
	sinon = require('sinon'),

	mocks = {},

	sandbox = sinon.sandbox.create(),
	expect = chai.expect,
	anyFunction = sinon.match.func;

let subscribe;

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('index/subscribe.js', () => {

	beforeEach(() => {
		mocks.amqp = {
			connect: sandbox.stub()
		};

		mocks.connection = {
			createChannel: sandbox.stub(),
			close: sandbox.stub()
		};

		mocks.channel = {
			assertQueue: sandbox.stub(),
			prefetch: sandbox.stub(),
			consume: sandbox.stub(),
			ack: sandbox.stub()
		};

		mocks.amqp.connect.resolves(mocks.connection);
		mocks.connection.createChannel.resolves(mocks.channel);

		mocks.handler = sandbox.stub();

		subscribe = proxyquire(root + '/src/lib/index/subscribe', {
			amqplib: mocks.amqp
		});
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('subscribe', () => {

		it('should supply messages to the handler', async () => {

			// given
			const
				topic = 'TestTopic',
				message = { content: 'TestMessage' },
				config = {
					cloudamqpUrl: 'amqp://localhost'
				};

			mocks.channel.ack.resolves();
			mocks.handler.resolves();
			mocks.channel.consume.callsFake((topic, callback) => {
				return callback(message);
			});

			// when
			await expect(subscribe.handle({ eventName: topic, handler: mocks.handler, config })).to.be.fulfilled;

			// then
			expect(mocks.amqp.connect).to.have.been.calledOnce;
			expect(mocks.amqp.connect).to.have.been.calledWith(config.cloudamqpUrl);
			expect(mocks.connection.createChannel).to.have.been.calledOnce;
			expect(mocks.channel.ack).to.have.been.calledOnce;
			expect(mocks.channel.ack).to.have.been.calledWith(message);
			expect(mocks.channel.prefetch).to.have.not.been.called;
			expect(mocks.channel.assertQueue).to.have.been.calledOnce;
			expect(mocks.channel.assertQueue).to.have.been.calledWith(topic);
			expect(mocks.channel.consume).to.have.been.calledOnce;
			expect(mocks.channel.consume).to.have.been.calledWith(topic, anyFunction);
			expect(mocks.handler).to.have.been.calledOnce;
			expect(mocks.handler).to.have.been.calledWith(message.content);
		});

		it('should set prefetch if supplied in the config', async () => {

			// given
			const
				topic = 'TestTopic',
				message = { content: 'TestMessage' },
				config = {
					cloudamqpUrl: 'amqp://localhost',
					prefetch: 4
				};

			mocks.channel.ack.resolves();
			mocks.handler.resolves();
			mocks.channel.consume.callsFake((topic, callback) => {
				return callback(message);
			});

			// when
			await expect(subscribe.handle({ eventName: topic, handler: mocks.handler, config })).to.be.fulfilled;

			expect(mocks.amqp.connect).to.have.been.calledOnce;
			expect(mocks.amqp.connect).to.have.been.calledWith(config.cloudamqpUrl);
			expect(mocks.connection.createChannel).to.have.been.calledOnce;
			expect(mocks.channel.ack).to.have.been.calledOnce;
			expect(mocks.channel.ack).to.have.been.calledWith(message);
			expect(mocks.channel.prefetch).to.have.been.calledOnce;
			expect(mocks.channel.prefetch).to.have.been.calledWith(4);
			expect(mocks.channel.assertQueue).to.have.been.calledOnce;
			expect(mocks.channel.assertQueue).to.have.been.calledWith(topic);
			expect(mocks.channel.consume).to.have.been.calledOnce;
			expect(mocks.channel.consume).to.have.been.calledWith(topic, anyFunction);
			expect(mocks.handler).to.have.been.calledOnce;
			expect(mocks.handler).to.have.been.calledWith(message.content);
		});

		it('should swallow handler errors and resolve when a returned promise rejects', async () => {

			// given
			const
				topic = 'TestTopic',
				message = { content: 'TestMessage' },
				config = {
					cloudamqpUrl: 'amqp://localhost'
				};

			mocks.channel.ack.resolves();
			mocks.handler.rejects(new Error('test'));
			mocks.channel.consume.callsFake((topic, callback) => {
				return callback(message);
			});

			// when
			await expect(subscribe.handle({ eventName: topic, handler: mocks.handler, config })).to.be.fulfilled;

			expect(mocks.amqp.connect).to.have.been.calledOnce;
			expect(mocks.amqp.connect).to.have.been.calledWith(config.cloudamqpUrl);
			expect(mocks.connection.createChannel).to.have.been.calledOnce;
			expect(mocks.channel.ack).to.have.been.calledOnce;
			expect(mocks.channel.ack).to.have.been.calledWith(message);
			expect(mocks.channel.prefetch).to.have.not.been.called;
			expect(mocks.channel.assertQueue).to.have.been.calledOnce;
			expect(mocks.channel.assertQueue).to.have.been.calledWith(topic);
			expect(mocks.channel.consume).to.have.been.calledOnce;
			expect(mocks.channel.consume).to.have.been.calledWith(topic, anyFunction);
			expect(mocks.handler).to.have.been.calledOnce;
			expect(mocks.handler).to.have.been.calledWith(message.content);
		});

		it('should swallow handler errors when an error is thrown', async () => {

			// given
			const
				topic = 'TestTopic',
				message = { content: 'TestMessage' },
				config = {
					cloudamqpUrl: 'amqp://localhost'
				};

			mocks.channel.ack.resolves();
			mocks.handler.throws(new Error('test'));
			mocks.channel.consume.callsFake((topic, callback) => {
				return callback(message);
			});

			// when
			await expect(subscribe.handle({ eventName: topic, handler: mocks.handler, config })).to.be.fulfilled;

			expect(mocks.amqp.connect).to.have.been.calledOnce;
			expect(mocks.amqp.connect).to.have.been.calledWith(config.cloudamqpUrl);
			expect(mocks.connection.createChannel).to.have.been.calledOnce;
			expect(mocks.channel.ack).to.have.been.calledOnce;
			expect(mocks.channel.ack).to.have.been.calledWith(message);
			expect(mocks.channel.prefetch).to.have.not.been.called;
			expect(mocks.channel.assertQueue).to.have.been.calledOnce;
			expect(mocks.channel.assertQueue).to.have.been.calledWith(topic);
			expect(mocks.channel.consume).to.have.been.calledOnce;
			expect(mocks.channel.consume).to.have.been.calledWith(topic, anyFunction);
			expect(mocks.handler).to.have.been.calledOnce;
			expect(mocks.handler).to.have.been.calledWith(message.content);
		});

		it('should allow multiple subscribers', async () => {

			// given
			const
				topic = 'TestTopic',
				otherTopic = 'otherTopic',
				message = { content: 'TestMessage' },
				config = {
					cloudamqpUrl: 'amqp://localhost'
				};

			mocks.channel.ack.resolves();
			mocks.handler.throws(new Error('test'));
			mocks.channel.consume.callsFake((topic, callback) => {
				return callback(message);
			});

			// when
			await expect(subscribe.handle({ eventName: topic, handler: mocks.handler, config })).to.be.fulfilled;
			await expect(subscribe.handle({ eventName: otherTopic, handler: mocks.handler, config })).to.be.fulfilled;

			expect(mocks.amqp.connect).to.have.been.calledOnce;
			expect(mocks.amqp.connect).to.have.been.calledWith(config.cloudamqpUrl);
			expect(mocks.connection.createChannel).to.have.been.calledTwice;
			expect(mocks.channel.ack).to.have.been.calledTwice;
			expect(mocks.channel.prefetch).to.have.not.been.calledTwice;
			expect(mocks.channel.assertQueue).to.have.been.calledTwice;
			expect(mocks.channel.assertQueue).to.have.been.calledWith(topic);
			expect(mocks.channel.assertQueue).to.have.been.calledWith(otherTopic);
			expect(mocks.channel.consume).to.have.been.calledTwice;
			expect(mocks.channel.consume).to.have.been.calledWith(topic, anyFunction);
			expect(mocks.channel.consume).to.have.been.calledWith(otherTopic, anyFunction);
			expect(mocks.handler).to.have.been.calledTwice;
			expect(mocks.handler).to.have.been.calledWith(message.content);
			expect(mocks.handler).to.have.been.calledWith(message.content);
		});

	});

	describe('close', () => {

		it('should call close', async () => {

			const
				topic = 'TestTopic',
				message = { content: 'TestMessage' },
				config = {
					cloudamqpUrl: 'amqp://localhost'
				};

			mocks.channel.ack.resolves();
			mocks.handler.resolves();
			mocks.channel.consume.callsFake((topic, callback) => {
				return callback(message);
			});

			// when
			await subscribe.handle({ eventName: topic, handler: mocks.handler, config });
			await subscribe.close();

			expect(mocks.connection.close).to.have.been.calledOnce;
		});

		it('should tolerate no connection', async () => {

			// Given - When
			await subscribe.close();

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
			subscribe.emitter.addListener(subscribe.emitter.ERROR, listener);
		});

		afterEach(() => {
			subscribe.emitter.removeListener(subscribe.emitter.ERROR, listener);
			errorEvents = [];
		});

		describe('should emit an error event', () => {

			it('if subscribe throws an error', () => {

				// given
				const
					eventName = 'TestTopic',
					config = {
						cloudamqpUrl: 'amqp://localhost'
					};

				mocks.amqp.connect.throws(new Error('test error'));

				// when - then
				return expect(subscribe.handle({ eventName, handler: mocks.handler, config })).to.be.rejected.then(() => {
					expect(errorEvents).to.include('test error');
				});

			});

			it('if handler function throws an error', () => {

				// given
				const
					eventName = 'TestTopic',
					message = 'test',
					config = {
						cloudamqpUrl: 'amqp://localhost'
					};

				mocks.channel.ack.resolves();
				mocks.handler.throws(new Error('test error'));
				mocks.channel.consume.callsFake((topic, callback) => {
					return callback(message);
				});

				// when
				return expect(subscribe.handle({ eventName, handler: mocks.handler, config })).to.be.fulfilled
					// then
					.then(() => {
						expect(errorEvents).to.include('test error');
					});

			});

			it('if handler function rejects', () => {

				// given
				const
					eventName = 'TestTopic',
					message = 'test',
					config = {
						cloudamqpUrl: 'amqp://localhost'
					};

				mocks.channel.ack.resolves();
				mocks.handler.rejects(new Error('test error'));
				mocks.channel.consume.callsFake((topic, callback) => {
					return callback(message);
				});

				// when
				return expect(subscribe.handle({ eventName, handler: mocks.handler, config })).to.be.fulfilled
					// then
					.then(() => {
						expect(errorEvents).to.include('test error');
					});

			});

		});

	});

});
