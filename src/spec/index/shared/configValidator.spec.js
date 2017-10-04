'use strict';

const
	root = require('app-root-path'),
	{ expect } = require('chai'),

	{ validate } = require(root + '/src/lib/index/shared/configValidator');

describe('index/shared/configValidator.js', () => {

	describe('validate', () => {

		it('should throw error if config is null', () => {

			// given - when - then
			expect(() => validate(null)).to.throw('Invalid parameter: null config');

		});

		it('should throw error if config.cloudamqpUrl is null', () => {

			// given - when - then
			expect(() => validate({})).to.throw('Invalid parameter: cloudamqpUrl not a string.');

		});

		it('should throw error if config.cloudamqpUrl is not a string', () => {

			// given - when - then
			expect(() => validate({ cloudamqpUrl: 1 })).to.throw('Invalid parameter: cloudamqpUrl not a string.');

		});

		it('should return undefined if config.cloudamqpUrl is a string', () => {

			// given - when - then
			expect(validate({ cloudamqpUrl: 'test' })).to.eql(undefined);

		});

	});

});
