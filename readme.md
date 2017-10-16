# Orizuru Transport RabbitMQ.

Orizuru can use this library for transport via RabbitMQ.

## Install

```
$ npm install @financialforcedev/orizuru-transport-rabbitmq
```

## Usage

Use this dependency to specify the transport layer that ```@financialforcedev/orizuru``` uses as RabbitMQ.

	const
		// get classes from orizuru
		{ Server, Handler, Publisher } = require('@financialforcedev/orizuru'),

		// get the transport
		transport = require('@financialforcedev/orizuru-transport-rabbitmq'),

		// configure the transport
		transportConfig = {
			cloudamqpUrl: 'amqp://localhost'
		};

	new Server({ transport, transportConfig }))...
	new Handler({ transport, transportConfig })...
	new Publisher({ transport, transportConfig })...


## API Docs

Click to view [JSDoc API documents](http://htmlpreview.github.io/?https://github.com/financialforcedev/financialforcedev--orizuru-transport-rabbitmq/blob/feature/update-package/doc/index.html).