# @financialforcedev/orizuru-transport-rabbitmq

## Latest changes (not yet released)

### NEW FEATURES

- Added forceSecure to the configuration options, this will force the protocol of the connection URL to be amqps.

### FIXES

- Make `Transport.close()` flush its message channels before closing the connection.
