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

import amqp from 'amqplib';

import * as optionsValidator from '../src/index/optionsValidator';

import { Publisher } from '../src/index/publish';
import { Subscriber } from '../src/index/subscribe';

import { Options, Transport } from '../src/index';

const expect = chai.expect;

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('index', () => {

	let transport: any;
	let channel: any;
	let connection: any;

	beforeEach(() => {

		channel = {
			close: sinon.stub(),
			prefetch: sinon.stub()
		};

		connection = {
			close: sinon.stub(),
			createChannel: sinon.stub().resolves(channel)
		};

		sinon.stub(amqp, 'connect').resolves(connection);
		sinon.stub(optionsValidator, 'validate');

	});

	afterEach(() => {
		sinon.restore();
	});

	describe('constructor', () => {

		it('should extend ITransport', () => {

			// Given
			const options: Options = {
				url: 'amqp://localhost'
			};

			// When
			transport = new Transport(options);

			// Then
			expect(transport).to.have.property('close').that.is.a('function');
			expect(transport).to.have.property('connect').that.is.a('function');
			expect(transport).to.have.property('publish').that.is.a('function');
			expect(transport).to.have.property('subscribe').that.is.a('function');

			expect(optionsValidator.validate).to.have.been.calledOnce;
			expect(optionsValidator.validate).to.have.been.calledWithExactly(options);

		});

	});

	describe('close', () => {

		it('should close the connection if connect has been called', async () => {

			// Given
			transport = new Transport({
				url: 'amqp://localhost'
			});

			await transport.connect();

			// When
			await transport.close();

			// Then
			expect(optionsValidator.validate).to.have.been.calledOnce;
			expect(amqp.connect).to.have.been.calledOnce;
			expect(amqp.connect).to.have.been.calledWithExactly('amqp://localhost');
			expect(connection.createChannel).to.have.been.calledTwice;
			expect(channel.prefetch).to.not.have.been.called;
			expect(connection.close).to.have.been.calledOnce;

		});

		it('should ignore closing the connection if connect has not been called', async () => {

			// Given
			transport = new Transport({
				url: 'amqp://localhost'
			});

			// When
			await transport.close();

			// Then
			expect(optionsValidator.validate).to.have.been.calledOnce;
			expect(amqp.connect).to.not.have.been.called;
			expect(connection.createChannel).to.not.have.been.called;
			expect(channel.prefetch).to.not.have.been.called;
			expect(connection.close).to.not.have.been.called;

		});

		it('should close the channel if connect with flush set to true', async () => {

			// Given
			transport = new Transport({
				url: 'amqp://localhost'
			});

			sinon.stub(Publisher.prototype, 'init');
			sinon.stub(Publisher.prototype, 'publish');

			await transport.connect({ url: 'testUrl' });

			// When
			await transport.close({ flush: true });

			// Then
			expect(optionsValidator.validate).to.have.been.calledOnce;
			expect(amqp.connect).to.have.been.calledOnce;
			expect(amqp.connect).to.have.been.calledWithExactly('amqp://localhost');
			expect(connection.createChannel).to.have.been.calledTwice;
			expect(channel.prefetch).to.not.have.been.called;
			expect(channel.close).to.have.been.calledTwice;
			expect(connection.close).to.have.been.calledOnce;

		});

		it('should not close the channel if connect without flush set', async () => {

			// Given
			transport = new Transport({
				url: 'amqp://localhost'
			});

			sinon.stub(Publisher.prototype, 'init');
			sinon.stub(Publisher.prototype, 'publish');

			await transport.connect({ url: 'testUrl' });

			// When
			await transport.close();

			// Then
			expect(optionsValidator.validate).to.have.been.calledOnce;
			expect(amqp.connect).to.have.been.calledOnce;
			expect(amqp.connect).to.have.been.calledWithExactly('amqp://localhost');
			expect(connection.createChannel).to.have.been.calledTwice;
			expect(channel.prefetch).to.not.have.been.called;
			expect(channel.close).to.have.not.been.calledOnce;
			expect(connection.close).to.have.been.calledOnce;

		});

		it('should ignore closing the connection if connect has not been called', async () => {

			// Given
			transport = new Transport({
				url: 'amqp://localhost'
			});

			// When
			await transport.close();

			// Then
			expect(optionsValidator.validate).to.have.been.calledOnce;
			expect(amqp.connect).to.not.have.been.called;
			expect(connection.createChannel).to.not.have.been.called;
			expect(channel.prefetch).to.not.have.been.called;
			expect(channel.close).to.not.have.been.calledOnce;
			expect(connection.close).to.not.have.been.called;

		});

	});

	describe('connect', () => {

		it('should create a new connection', async () => {

			// Given
			transport = new Transport({
				url: 'amqp://localhost'
			});

			// When
			await transport.connect();

			// Then
			expect(optionsValidator.validate).to.have.been.calledOnce;
			expect(amqp.connect).to.have.been.calledOnce;
			expect(amqp.connect).to.have.been.calledWithExactly('amqp://localhost');
			expect(connection.createChannel).to.have.been.calledTwice;
			expect(channel.prefetch).to.not.have.been.called;

		});

		it('should create a new subscribe channel with prefetch set', async () => {

			// Given
			transport = new Transport({
				prefetch: 2,
				url: 'amqp://localhost'
			});

			// When
			await transport.connect();

			// Then
			expect(optionsValidator.validate).to.have.been.calledOnce;
			expect(amqp.connect).to.have.been.calledOnce;
			expect(amqp.connect).to.have.been.calledWithExactly('amqp://localhost');
			expect(connection.createChannel).to.have.been.calledTwice;
			expect(channel.prefetch).to.have.been.calledOnce;
			expect(channel.prefetch).to.have.been.calledWithExactly(2);

		});

		it('should only create the connection and channels once', async () => {

			// Given
			transport = new Transport({
				url: 'amqp://localhost'
			});

			// When
			await transport.connect();
			await transport.connect();

			// Then
			expect(optionsValidator.validate).to.have.been.calledOnce;
			expect(amqp.connect).to.have.been.calledOnce;
			expect(amqp.connect).to.have.been.calledWithExactly('amqp://localhost');
			expect(connection.createChannel).to.have.been.calledTwice;
			expect(channel.prefetch).to.not.have.been.called;

		});

	});

	describe('publish', () => {

		beforeEach(() => {
			transport = new Transport({
				url: 'amqp://localhost'
			});
		});

		it('should throw an error if the transport has not been initialised', () => {

			// Given
			const buffer = Buffer.from('test');

			// When
			expect(transport.publish(buffer, {})).to.be.rejectedWith('Transport has not been initialised.');

		});

		it('should publish the message buffer', async () => {

			// Given
			const buffer = Buffer.from('test');

			sinon.stub(Publisher.prototype, 'init');
			sinon.stub(Publisher.prototype, 'publish');

			await transport.connect({ url: 'testUrl' });

			// When
			await transport.publish(buffer, {});

			// Then
			expect(Publisher.prototype.init).to.have.been.calledOnce;
			expect(Publisher.prototype.publish).to.have.been.calledOnce;
			expect(Publisher.prototype.publish).to.have.been.calledWithExactly(buffer);

		});

	});

	describe('subscribe', () => {

		beforeEach(() => {
			transport = new Transport({
				url: 'amqp://localhost'
			});
		});

		it('should throw an error if the transport has not been initialised', () => {

			// Given
			const handler = sinon.stub();
			const options = { eventName: 'test' };

			// When
			expect(transport.subscribe(handler, options)).to.be.rejectedWith('Transport has not been initialised.');

		});

		it('should subscribe with the handler', async () => {

			// Given
			const handler = sinon.stub();
			const options = { eventName: 'test' };

			sinon.stub(Subscriber.prototype, 'init');
			sinon.stub(Subscriber.prototype, 'subscribe');

			await transport.connect({ url: 'testUrl' });

			// When
			await transport.subscribe(handler, options);

			// Then
			expect(Subscriber.prototype.init).to.have.been.calledOnce;
			expect(Subscriber.prototype.init).to.have.been.calledWithExactly(options);
			expect(Subscriber.prototype.subscribe).to.have.been.calledOnce;
			expect(Subscriber.prototype.subscribe).to.have.been.calledWithExactly(handler);

		});

	});

});
