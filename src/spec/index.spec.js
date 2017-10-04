'use strict';

const
	root = require('app-root-path'),
	proxyquire = require('proxyquire'),
	{ expect } = require('chai');

describe('index.js', () => {

	it('should load and expose apis correctly', () => {

		// given - when
		const
			mockPublish = { send: 'mockPublish' },
			mockSubscribe = { handle: 'mockSubscribe' },
			index = proxyquire(root + '/src/lib/index', {
				['./index/publish']: mockPublish,
				['./index/subscribe']: mockSubscribe
			});

		// then
		expect(index.publish).to.eql(mockPublish.send);
		expect(index.subscribe).to.eql(mockSubscribe.handle);

	});

});
