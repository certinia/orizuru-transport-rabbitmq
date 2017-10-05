'use strict';

const
	root = require('app-root-path'),
	chai = require('chai'),
	chaiAsPromised = require('chai-as-promised'),
	sinonChai = require('sinon-chai'),
	sinon = require('sinon'),
	amqp = require('amqplib'),

	configValidator = require(root + '/src/lib/index/shared/configValidator'),

	mocks = {},

	sandbox = sinon.sandbox.create(),
	expect = chai.expect;

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('index/shared/amqp.js', () => {

	let AmqpService;

	beforeEach(() => {
		sandbox.stub(configValidator, 'validate').returns(undefined);
		mocks.action = sandbox.stub();
		mocks.channel = sandbox.stub();
		mocks.connection = {
			createChannel: sandbox.stub().resolves(mocks.channel)
		};
		mocks.amqp = {
			connect: sandbox.stub(amqp, 'connect').resolves(mocks.connection)
		};
		mocks.config = {
			cloudamqpUrl: 'test'
		};
		AmqpService = require(root + '/src/lib/index/shared/amqp');
	});

	afterEach(() => {
		const amqpServicePath = require.resolve(root + '/src/lib/index/shared/amqp');
		delete require.cache[amqpServicePath];
		sandbox.restore();
	});

	describe('apply', () => {

		describe('should handle error', () => {

			it('from amqp.connect', () => {
				// given
				mocks.amqp.connect.rejects(new Error('bad'));

				// when
				return expect(AmqpService.apply(mocks.action, mocks.config))
					.to.eventually.be.rejectedWith('bad')
					// then
					.then(() => {
						expect(mocks.amqp.connect).to.have.been.calledOnce;
						expect(mocks.amqp.connect).to.have.been.calledWith(mocks.config.cloudamqpUrl);
						expect(mocks.connection.createChannel).to.have.been.notCalled;
						expect(mocks.action).to.have.been.notCalled;
					});
			});

			it('from connection.createChannel', () => {
				// given
				mocks.connection.createChannel.rejects(new Error('bad'));

				// when
				return expect(AmqpService.apply(mocks.action, mocks.config))
					.to.eventually.be.rejectedWith('bad')
					// then
					.then(() => {
						expect(mocks.amqp.connect).to.have.been.calledOnce;
						expect(mocks.amqp.connect).to.have.been.calledWith(mocks.config.cloudamqpUrl);
						expect(mocks.connection.createChannel).to.have.been.calledOnce;
						expect(mocks.action).to.have.been.notCalled;
					});
			});

			it('from action', () => {
				// given
				mocks.action.rejects(new Error('bad'));

				// when
				return expect(AmqpService.apply(mocks.action, mocks.config))
					.to.eventually.be.rejectedWith('bad')
					// then
					.then(() => {
						expect(mocks.amqp.connect).to.have.been.calledOnce;
						expect(mocks.amqp.connect).to.have.been.calledWith(mocks.config.cloudamqpUrl);
						expect(mocks.connection.createChannel).to.have.been.calledOnce;
						expect(mocks.action).to.have.been.calledOnce;
						expect(mocks.action).to.have.been.calledWith(mocks.channel);
					});
			});

		});

		it('should invoke the action', () => {
			// given/when
			return expect(AmqpService.apply(mocks.action, mocks.config))
				.to.eventually.be.fulfilled
				// then
				.then(() => {
					expect(mocks.amqp.connect).to.have.been.calledOnce;
					expect(mocks.amqp.connect).to.have.been.calledWith(mocks.config.cloudamqpUrl);
					expect(mocks.connection.createChannel).to.have.been.calledOnce;
					expect(mocks.action).to.have.been.calledOnce;
					expect(mocks.action).to.have.been.calledWith(mocks.channel);
				});
		});

		it('should lazy load the connection', () => {
			// given/when
			return expect(AmqpService.apply(mocks.action, mocks.config).then(() => AmqpService.apply(mocks.action)))
				.to.eventually.be.fulfilled
				// then
				.then(() => {
					expect(mocks.amqp.connect).to.have.been.calledOnce;
					expect(mocks.amqp.connect).to.have.been.calledWith(mocks.config.cloudamqpUrl);
					expect(mocks.connection.createChannel).to.have.been.calledTwice;
					expect(mocks.action).to.have.been.calledTwice;
					expect(mocks.action).to.have.been.calledWith(mocks.channel);
				});
		});

	});

});
