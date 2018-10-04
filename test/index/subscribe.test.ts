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
import sinon, { SinonStub } from 'sinon';
import sinonChai from 'sinon-chai';

import { Subscriber } from '../../src/index/subscribe';

const expect = chai.expect;

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('index/subscribe', () => {

	let channel: any;

	beforeEach(() => {
		channel = {
			ack: sinon.stub(),
			assertExchange: sinon.stub(),
			assertQueue: sinon.stub(),
			bindQueue: sinon.stub(),
			consume: sinon.stub(),
			nack: sinon.stub()
		};
	});

	afterEach(() => {
		sinon.restore();
	});

	describe('subscribe', () => {

		it('should throw an error if the subscriber has not been initialised', async () => {

			// Given
			const subscriber = new Subscriber(channel);
			const options: any = {};

			// When
			await expect(subscriber.subscribe(options)).to.eventually.be.rejectedWith('Subscriber has not been initialised.');

			// Then
			expect(channel.ack).to.not.have.been.called;
			expect(channel.assertExchange).to.not.have.been.called;
			expect(channel.assertQueue).to.not.have.been.called;
			expect(channel.bindQueue).to.not.have.been.called;
			expect(channel.consume).to.not.have.been.called;
			expect(channel.nack).to.not.have.been.called;

		});

		it('should ignore null', async () => {

			// Given
			(channel.consume as SinonStub).callsArgWith(1, null);

			const handler = sinon.stub();

			const options = {
				eventName: 'eventName'
			};

			const subscriber = new Subscriber(channel);
			await subscriber.init(options);

			// When
			await subscriber.subscribe(handler);

			// Then
			expect(channel.assertQueue).to.have.been.calledOnce;
			expect(channel.consume).to.have.been.calledOnce;

			expect(channel.ack).to.not.have.been.called;
			expect(channel.assertExchange).to.not.have.been.called;
			expect(channel.bindQueue).to.not.have.been.called;
			expect(channel.nack).to.not.have.been.called;

		});

		it('should acknowledge a message when susbcribing to an exchange', async () => {

			// Given
			(channel.consume as SinonStub).callsArgWith(1, {});

			const handler = sinon.stub();

			const options: Orizuru.Transport.ISubscribe = {
				eventName: 'eventName',
				exchange: {
					name: 'testExchange',
					type: 'fanout'
				}
			};

			const subscriber = new Subscriber(channel);
			await subscriber.init(options);

			// When
			await subscriber.subscribe(handler);

			// Then
			expect(channel.assertExchange).to.have.been.calledOnce;
			expect(channel.assertQueue).to.have.been.calledOnce;
			expect(channel.bindQueue).to.have.been.calledOnce;

			expect(channel.ack).to.have.been.calledOnce;
			expect(channel.consume).to.have.been.calledOnce;
			expect(channel.nack).to.not.have.been.called;

		});

		it('should acknowledge a message if the handler returns undefined', async () => {

			// Given
			(channel.consume as SinonStub).callsArgWith(1, {});

			const handler = sinon.stub();

			const options: Orizuru.Transport.ISubscribe = {
				eventName: 'eventName'
			};

			const subscriber = new Subscriber(channel);
			await subscriber.init(options);

			// When
			await subscriber.subscribe(handler);

			// Then
			expect(channel.ack).to.have.been.calledOnce;
			expect(channel.assertQueue).to.have.been.calledOnce;
			expect(channel.consume).to.have.been.calledOnce;

			expect(channel.assertExchange).to.not.have.been.called;
			expect(channel.bindQueue).to.not.have.been.called;
			expect(channel.nack).to.not.have.been.called;

		});

		it('should acknowledge a message if the handler throws an exception', async () => {

			// Given
			(channel.consume as SinonStub).callsArgWith(1, {});

			const handler = sinon.stub().rejects(new Error('error'));

			const options = {
				eventName: 'eventName'
			};

			const subscriber = new Subscriber(channel);
			await subscriber.init(options);

			// When
			await subscriber.subscribe(handler);

			// Then
			expect(channel.ack).to.have.been.calledOnce;
			expect(channel.assertQueue).to.have.been.calledOnce;
			expect(channel.consume).to.have.been.calledOnce;

			expect(channel.assertExchange).to.not.have.been.called;
			expect(channel.bindQueue).to.not.have.been.called;
			expect(channel.nack).to.not.have.been.called;

		});

		it('should requeue a message if the handler returns an IHandlerResponse with retry as true', async () => {

			// Given
			(channel.consume as SinonStub).callsArgWith(1, {});

			const handler = sinon.stub().returns({ retry: true });

			const options = {
				eventName: 'eventName'
			};

			const subscriber = new Subscriber(channel);
			await subscriber.init(options);

			// When
			await subscriber.subscribe(handler);

			// Then
			expect(channel.assertQueue).to.have.been.calledOnce;
			expect(channel.consume).to.have.been.calledOnce;
			expect(channel.nack).to.have.been.calledOnce;

			expect(channel.ack).to.not.have.been.called;
			expect(channel.assertExchange).to.not.have.been.called;
			expect(channel.bindQueue).to.not.have.been.called;

		});

	});

});
