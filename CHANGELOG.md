# @financialforcedev/orizuru-transport-rabbitmq

## 5.3.0

## NEW FEATURES

- Add `socketOptions` to the Transport `Options` interface
  - This allows more flexibility when connecting to the RabbitMQ instance

- Add a RabbitMQ Docker image that uses SSL
  - Certificates are generated within the Docker image to make configuration easier

## OTHER CHANGES

- Add system tests
  - Test on both SSL and non-SSL connections

- Add Docker scripts to the package.json that:
  - Build the `orizuru-transport-rabbitmq--rabbitmq` service
  - Start the `orizuru-transport-rabbitmq--rabbitmq` service
  - Cleanup the created container and image
  - Start the service then run the system tests

- Amalgamate the change log files

## 5.2.0

### NEW FEATURES

- Added forceSecure to the configuration options, this will force the protocol of the connection URL to be amqps

### FIXES

- Make `Transport.close()` flush its message channels before closing the connection

## 5.1.0

### NEW FEATURES

- Update typescript configuration to target es2017
- Update all dependencies to latest versions

### OTHER CHANGES

- Remove npmignore file
- Update to using [Jest](https://jestjs.io/en/) for tests

## 5.0.1

### OTHER CHANGES

- Update all dependencies to latest versions
- Remove all references to `new Buffer()`
  - Use `Buffer.from()` instead to remove deprecation warnings

## 5.0.0

### BREAKING CHANGES

- Update Orizuru to use a class for the transport layer
  - Each server, publisher and handler should have a different transport instance
  - The configuration for the transport can be provided in the constructor thereby removing the requirement of transportConfig from Orizuru
- Update all references to the Orizuru.Options; use Orizuru.Transport... instead
- Remove the use of Orizuru.Transport.IConnect
- Remove the Orizuru dev dependency

### OTHER CHANGES

- Add nyc.opts file to clean up the package.json

## 4.0.0

### OTHER CHANGES

- Conversion to Typescript

## 3.2.2

- Dependency update for security advisories

## 3.2.1

- Bug fix release

### BUGS FIXED

- Channel leak from the publisher
