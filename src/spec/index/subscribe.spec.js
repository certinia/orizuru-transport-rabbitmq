/**
 * Copyright (c) 2017, FinancialForce.com, inc
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
	chai = require('chai'),
	sinonChai = require('sinon-chai'),
	chaiAsPromised = require('chai-as-promised'),
	sinon = require('sinon'),

	Amqp = require(root + '/src/lib/index/shared/amqp'),

	Subscriber = require(root + '/src/lib/index/subscribe'),

	mocks = {},

	sandbox = sinon.sandbox.create(),
	expect = chai.expect,
	anyFunction = sinon.match.func;

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('index/subscribe.js', () => {

	beforeEach(() => {
		mocks.Amqp = {
			apply: sandbox.stub(Amqp, 'apply')
		};
		mocks.channel = {
			ack: sandbox.stub(),
			assertQueue: sandbox.stub(),
			consume: sandbox.stub()
		};
		mocks.handler = sandbox.stub();
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('subscribe', () => {

		it('should supply messages to the handler', () => {

			// given
			const
				topic = 'TestTopic',
				message = { content: 'TestMessage' },
				config = 'test';

			mocks.channel.consume.callsFake((topic, callback) => {
				return callback(message);
			});
			mocks.channel.ack.resolves();
			mocks.handler.resolves();
			mocks.Amqp.apply.callsFake(action => {
				return Promise.resolve(action(mocks.channel));
			});

			// when
			return Subscriber.handle({ eventName: topic, handler: mocks.handler, config })
				// then
				.then(() => {
					expect(mocks.Amqp.apply).to.have.been.calledOnce;
					expect(mocks.Amqp.apply).to.have.been.calledWith(anyFunction, config);
					expect(mocks.channel.ack).to.have.been.calledOnce;
					expect(mocks.channel.ack).to.have.been.calledWith(message);
					expect(mocks.channel.assertQueue).to.have.been.calledOnce;
					expect(mocks.channel.assertQueue).to.have.been.calledWith(topic);
					expect(mocks.channel.consume).to.have.been.calledOnce;
					expect(mocks.channel.consume).to.have.been.calledWith(topic, anyFunction);
					expect(mocks.handler).to.have.been.calledOnce;
					expect(mocks.handler).to.have.been.calledWith(message.content);
				});
		});

		it('should swallow handler errors when a returned promise rejects', () => {

			// given
			const
				topic = 'TestTopic',
				message = { content: 'TestMessage' };

			mocks.channel.consume.callsFake((topic, callback) => {
				return callback(message);
			});
			mocks.channel.ack.resolves();
			mocks.handler.rejects(new Error('test'));
			mocks.Amqp.apply.callsFake(action => {
				return Promise.resolve(action(mocks.channel));
			});

			// when
			return expect(Subscriber.handle({ eventName: topic, handler: mocks.handler })).to.be.fulfilled
				// then
				.then(() => {
					expect(mocks.Amqp.apply).to.have.been.calledOnce;
					expect(mocks.Amqp.apply).to.have.been.calledWith(anyFunction);
					expect(mocks.channel.ack).to.have.been.calledOnce;
					expect(mocks.channel.ack).to.have.been.calledWith(message);
					expect(mocks.channel.assertQueue).to.have.been.calledOnce;
					expect(mocks.channel.assertQueue).to.have.been.calledWith(topic);
					expect(mocks.channel.consume).to.have.been.calledOnce;
					expect(mocks.channel.consume).to.have.been.calledWith(topic, anyFunction);
					expect(mocks.handler).to.have.been.calledOnce;
					expect(mocks.handler).to.have.been.calledWith(message.content);
				});
		});

		it('should swallow handler errors when an error is thrown', () => {

			// given
			const
				topic = 'TestTopic',
				message = { content: 'TestMessage' };

			mocks.channel.consume.callsFake((topic, callback) => {
				return callback(message);
			});
			mocks.channel.ack.resolves();
			mocks.handler.throws(new Error('test'));
			mocks.Amqp.apply.callsFake(action => {
				return Promise.resolve(action(mocks.channel));
			});

			// when
			return expect(Subscriber.handle({ eventName: topic, handler: mocks.handler })).to.be.fulfilled
				// then
				.then(() => {
					expect(mocks.Amqp.apply).to.have.been.calledOnce;
					expect(mocks.Amqp.apply).to.have.been.calledWith(anyFunction);
					expect(mocks.channel.ack).to.have.been.calledOnce;
					expect(mocks.channel.ack).to.have.been.calledWith(message);
					expect(mocks.channel.assertQueue).to.have.been.calledOnce;
					expect(mocks.channel.assertQueue).to.have.been.calledWith(topic);
					expect(mocks.channel.consume).to.have.been.calledOnce;
					expect(mocks.channel.consume).to.have.been.calledWith(topic, anyFunction);
					expect(mocks.handler).to.have.been.calledOnce;
					expect(mocks.handler).to.have.been.calledWith(message.content);
				});
		});

	});

	describe('emitter', () => {

		let errorEvents = [];

		const listener = message => {
			errorEvents.push(message);
		};

		beforeEach(() => {
			Subscriber.emitter.addListener(Subscriber.emitter.ERROR, listener);
		});

		afterEach(() => {
			Subscriber.emitter.removeListener(Subscriber.emitter.ERROR, listener);
			errorEvents = [];
		});

		describe('should emit an error event', () => {

			it('if subscribe throws an error', () => {

				// given
				mocks.Amqp.apply.callsFake(action => {
					return Promise.reject(new Error('test error'));
				});

				// when - then
				return expect(Subscriber.handle({})).to.be.rejected.then(() => {
					expect(errorEvents).to.include('test error');
				});

			});

			it('if handler function throws an error', () => {

				// given
				const
					topic = 'TestTopic',
					message = { content: 'TestMessage' };

				mocks.channel.consume.callsFake((topic, callback) => {
					return callback(message);
				});
				mocks.channel.ack.resolves();
				mocks.handler.throws(new Error('test error'));
				mocks.Amqp.apply.callsFake(action => {
					return Promise.resolve(action(mocks.channel));
				});

				// when
				return expect(Subscriber.handle({ eventName: topic, handler: mocks.handler })).to.be.fulfilled
					// then
					.then(() => {
						expect(errorEvents).to.include('test error');
					});

			});

			it('if handler function rejects', () => {

				// given
				const
					topic = 'TestTopic',
					message = { content: 'TestMessage' };

				mocks.channel.consume.callsFake((topic, callback) => {
					return callback(message);
				});
				mocks.channel.ack.resolves();
				mocks.handler.rejects(new Error('test error'));
				mocks.Amqp.apply.callsFake(action => {
					return Promise.resolve(action(mocks.channel));
				});

				// when
				return expect(Subscriber.handle({ eventName: topic, handler: mocks.handler })).to.be.fulfilled
					// then
					.then(() => {
						expect(errorEvents).to.include('test error');
					});

			});

		});

	});

});
