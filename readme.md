# Orizuru Transport RabbitMQ.

[![Build Status](https://travis-ci.org/financialforcedev/orizuru-transport-rabbitmq.svg?branch=master)](https://travis-ci.org/financialforcedev/orizuru-transport-rabbitmq)
[![NSP Status](https://nodesecurity.io/orgs/ffres/projects/eb75f119-7db6-4f3a-93e5-c62dfed6bb2e/badge)](https://nodesecurity.io/orgs/ffres/projects/eb75f119-7db6-4f3a-93e5-c62dfed6bb2e)

Orizuru Transport RabbitMQ is a transport library for the [Orizuru](https://www.npmjs.com/package/@financialforcedev/orizuru) framework.
It is a thin wrapper around [amqplib](https://www.npmjs.com/package/amqplib) and allows Orizuru to publish and subscribe to events via [RabbitMQ](http://www.rabbitmq.com/).

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

Click to view [JSDoc API documentation](http://htmlpreview.github.io/?https://github.com/financialforcedev/orizuru-transport-rabbitmq/blob/master/doc/index.html).