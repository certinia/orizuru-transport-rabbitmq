# @financialforcedev/orizuru-transport-rabbitmq

## Latest changes (not yet released)

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
