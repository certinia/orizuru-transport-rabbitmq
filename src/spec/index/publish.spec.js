'use strict';

const
	root = require('app-root-path'),
	chai = require('chai'),
	sinonChai = require('sinon-chai'),
	sinon = require('sinon'),

	Amqp = require(root + '/src/lib/index/shared/amqp'),

	Publisher = require(root + '/src/lib/index/publish'),

	mocks = {},

	sandbox = sinon.sandbox.create(),
	expect = chai.expect;

chai.use(sinonChai);

describe('index/publish.js', () => {

	beforeEach(() => {
		mocks.Amqp = {
			apply: sandbox.stub(Amqp, 'apply')
		};
		mocks.channel = {
			sendToQueue: sandbox.stub()
		};
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('send', () => {

		it('should call sendToQueue', () => {

			// given
			const
				eventName = 'TestTopic',
				buffer = 'TestBuffer';

			mocks.Amqp.apply.callsFake(action => {
				return Promise.resolve(action(mocks.channel));
			});

			// when
			return Publisher.send({ eventName, buffer })
				// then
				.then(() => {
					expect(mocks.channel.sendToQueue).to.be.calledOnce;
					expect(mocks.channel.sendToQueue).to.be.calledWith(eventName, buffer);
				});
		});

	});
});
