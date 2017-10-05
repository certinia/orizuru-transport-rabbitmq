'use strict';

const
	root = require('app-root-path'),
	chai = require('chai'),
	sinonChai = require('sinon-chai'),
	sinon = require('sinon'),

	Amqp = require(root + '/src/lib/index/shared/amqp'),

	Publisher = require(root + '/src/lib/index/publish'),

	mocks = {},
	anyFunction = sinon.match.func,

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
				buffer = 'TestBuffer',
				config = 'test';

			mocks.Amqp.apply.callsFake(action => {
				return Promise.resolve(action(mocks.channel));
			});

			// when
			return Publisher.send({ eventName, buffer, config })
				// then
				.then(() => {
					expect(mocks.Amqp.apply).to.have.been.calledOnce;
					expect(mocks.Amqp.apply).to.have.been.calledWith(anyFunction, config);
					expect(mocks.channel.sendToQueue).to.be.calledOnce;
					expect(mocks.channel.sendToQueue).to.be.calledWith(eventName, buffer);
				});
		});

	});
});
