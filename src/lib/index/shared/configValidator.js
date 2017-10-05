'use strict';

const
	_ = require('lodash'),
	validate = (config) => {
		if (config == null) {
			throw new Error('Invalid parameter: null config.');
		}
		if (config.cloudamqpUrl == null || !_.isString(config.cloudamqpUrl)) {
			throw new Error('Invalid parameter: cloudamqpUrl not a string.');
		}
	};

module.exports = {
	validate
};
