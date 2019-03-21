# Orizuru Transport RabbitMQ

[![Build Status](https://travis-ci.org/financialforcedev/orizuru-transport-rabbitmq.svg?branch=master)](https://travis-ci.org/financialforcedev/orizuru-transport-rabbitmq)

Orizuru Transport RabbitMQ is a transport library for the [Orizuru](https://www.npmjs.com/package/@financialforcedev/orizuru) framework.

It is a thin wrapper around [amqplib](https://www.npmjs.com/package/amqplib) and allows Orizuru to publish and subscribe to events via [RabbitMQ](http://www.rabbitmq.com/).

## Install

```
$ npm install @financialforcedev/orizuru-transport-rabbitmq
```

## Usage

Use this dependency to specify the transport layer that `@financialforcedev/orizuru` uses as RabbitMQ.

```typescript
// get classes from orizuru
import { Handler, Publisher, Server } from '@financialforcedev/orizuru';

// get the transport
import { Transport } from '@financialforcedev/orizuru-transport-rabbitmq';

// create the transport
const transport = new Transport({
    url:  process.env.CLOUDAMQP_URL || 'amqp://localhost'
});

const server = new Server({
    transport
});

const handler = new Handler({
    transport
});

const publisher = new Publisher({
    transport
});
```

Messages can be published to a [work queue](https://www.rabbitmq.com/tutorials/tutorial-two-java.html) using the publisher...

```typescript
import { Publisher } from '@financialforcedev/orizuru';
import { Transport } from '@financialforcedev/orizuru-transport-rabbitmq';

const transport = new Transport({
    url:  process.env.CLOUDAMQP_URL || 'amqp://localhost'
});

const app = new Publisher({ transport });

app.publish({
    message: {
        context: {},
        message: {
            test: 'message'
        }
    },
    publishOptions: {
        eventName: 'test.queue'
    }
});
```

and consumed by the handler.

```typescript
import { Handler, IOrizuruMessage } from '@financialforcedev/orizuru';
import { Transport } from '@financialforcedev/orizuru-transport-rabbitmq';

const transport = new Transport({
    url:  process.env.CLOUDAMQP_URL || 'amqp://localhost'
});

const app = new Handler({ transport });

app.handle({
    handler: ({ context, message }: IOrizuruMessage<any, any>) => {
        app.info(context);
        app.info(message);
    }),
    schema: {
        namespace: 'testNamespace',
        name: 'testSchema',
        type: 'record',
        fields: [{
            name: 'test',
            type: 'string'
        }]
    },
    subscribeOptions: {
        eventName: 'test.queue'
    }
});
```

Or via a topic exchange using the [publish/subscribe](https://www.rabbitmq.com/tutorials/tutorial-three-javascript.html) mechanism.

```typescript
import { Handler, IOrizuruMessage, Publisher } from '@financialforcedev/orizuru';
import { Transport } from '@financialforcedev/orizuru-transport-rabbitmq';

const publisherTransport = new Transport({
    url:  process.env.CLOUDAMQP_URL || 'amqp://localhost'
});

const publisher = new Publisher({ transport: publisherTransport });

publisher.publish({
    message: {
        context: {},
        message: 'test message'
    },
    publishOptions: {
        eventName: 'test.queue',
        exchange: {
            key: 'testKey',
            name: 'testExchange',
            type: 'topic'
        }
    }
});

const handlerTransport = new Transport({
    url:  process.env.CLOUDAMQP_URL || 'amqp://localhost'
});

const app = new Handler({ transport: handlerTransport});

app.handle({
    handler: ({ context, message }: IOrizuruMessage<any, any>) => {
        app.info(context);
        app.info(message);
    }),
    schema: {
        namespace: 'testNamespace',
        name: 'testSchema',
        type: 'record',
        fields: [{
            name: 'test',
            type: 'string'
        }]
    },
    subscribeOptions: {
        eventName: 'test.queue',
        exchange: {
            key: 'testKey',
            name: 'testExchange',
            type: 'topic'
        }
    }
});
```

## API Docs

Click to view [TSDoc API documentation](http://htmlpreview.github.io/?https://github.com/financialforcedev/orizuru-transport-rabbitmq/blob/master/doc/index.html).
