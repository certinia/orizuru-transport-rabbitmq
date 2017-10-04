'use strict';

const
	root = require('app-root-path'),
	sinon = require('sinon'),
	proxyquire = require('proxyquire'),

	{ calledOnce, calledWith } = sinon.assert,

	sandbox = sinon.sandbox.create(),
	restore = sandbox.restore.bind(sandbox);

describe('index.js', () => {

	afterEach(restore);

	it('should load and expose apis correctly', () => {

		// given
		const
			mockPublish = { send: sandbox.spy() },
			mockSubscribe = { handle: sandbox.spy() },
			index = proxyquire(root + '/src/lib/index', {
				['./index/publish']: mockPublish,
				['./index/subscribe']: mockSubscribe
			});

		// when
		index.publish('test1');
		index.subscribe('test2');

		// then
		calledOnce(mockPublish.send);
		calledWith(mockPublish.send, 'test1');
		calledOnce(mockSubscribe.handle);
		calledWith(mockSubscribe.handle, 'test2');

	});

});
