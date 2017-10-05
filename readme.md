# Nozomi Transport RabbitMQ.

Nozomi can use this library for transport via RabbitMQ.

## Install

```
$ npm install @financialforcedev/nozomi-transport-rabbitmq
```

## Usage

Use this dependency to specify the transport layer that ```@financialforcedev/nozomi``` uses as RabbitMQ.

	const
		// get classes from nozomi
		{ Server, Handler, Publisher } = require('@financialforcedev/nozomi'),

		// get the transport
		transport = require('@financialforcedev/nozomi-transport-rabbitmq'),

		// configure the transport
		transportConfig = {
			cloudamqpUrl: 'amqp://localhost'
		};

	new Server({ transport, transportConfig }))...
	new Handler({ transport, transportConfig })...
	new Publisher({ transport, transportConfig })...


## API Docs

TODO